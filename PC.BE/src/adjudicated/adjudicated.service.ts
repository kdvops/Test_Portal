import { Model, Types } from 'mongoose';
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// IMPORT ADJUDICATED SCHEMA
import { Adjudicated, AdjudicatedDocument } from './schema/adjudicated.schema';

// IMPORT TYPES AND OBJECTS
import { AdjudicatedPictureType } from 'src/common/types/adjudicated.type';

// IMPORT ADJUDICATED INPUT
import { CreateAdjudicatedDto } from './dto/create.adjudicated.dto';
import { UpdateAdjudicatedDto } from './dto/update.adjudicated.dto';
import {
  AdjudicatedProductsByGroupCategory,
  ArgsAdjudicated,
} from './dto/args.adjudicated.dto';

// IMPORT SERVICES
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import { getUniqueSlug } from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';
import {
  ImageDetailInputUpdate,
  ImageDetailType,
} from 'src/common/types/common.type';

@Injectable()
export class AdjudicatedService {
  private readonly logger = new Logger(AdjudicatedService.name);
  constructor(
    @InjectModel(Adjudicated.name)
    private adjudicatedModel: Model<AdjudicatedDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // CREATE ADJUDICATED
  async createAdjudicated(
    createAdjudicatedDto: CreateAdjudicatedDto,
  ): Promise<Adjudicated> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    // UPLOAD PICTURES ADJUDICATED
    const newPicturesImageDetail = await Promise.all(
      createAdjudicatedDto.picturesImageDetail.map(
        async (picture: ImageDetailInputUpdate) => {
          // NEW ID FOR PICTURE
          const pictureId: any = new Types.ObjectId();

          const newPictureAdjudicated = await getImageDetail(
            pictureId,
            null,
            picture,
            'pictures',
            null,
            'create',
          );

          return {
            ...newPictureAdjudicated,
            _id: pictureId,
          };
        },
      ),
    );

    // RETURN ADJUDICATED
    return await this.adjudicatedModel.create({
      // SET ALL DATA DTO
      ...createAdjudicatedDto,
      // SET ID
      _id,
      // SET PICTURE UPLOAD
      pictures: null,
      picturesImageDetail: newPicturesImageDetail,
    });
  }

  // UPDATE ADJUDICATED
  async updateAdjudicated(
    updateAdjudicatedDto: UpdateAdjudicatedDto,
  ): Promise<Adjudicated> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // UPLOAD PICTURES ADJUDICATED
    const picturesImageDetail = await Promise.all(
      updateAdjudicatedDto.adjudicated.picturesImageDetail.map(
        async (picture: ImageDetailInputUpdate) => {
          // NEW ID FOR PICTURE
          const pictureId: any = new Types.ObjectId();

          //////////////////////////
          // VALIDATE ACTION TYPE //
          //////////////////////////
          if (!picture.updatedAt && !picture.deletedAt && !picture._id) {
            const newPictureAdjudicated = await getImageDetail(
              updateAdjudicatedDto.adjudicatedID,
              null,
              picture,
              'pictures',
              null,
              'create',
            );

            return {
              ...newPictureAdjudicated,
              _id: pictureId,
            };
          } else if (picture.updatedAt && !picture.deletedAt) {
            const pictureAdjudicated = await getImageDetail(
              updateAdjudicatedDto.adjudicatedID,
              null,
              picture,
              'pictures',
              async () =>
                await this.removeFiles(
                  updateAdjudicatedDto.adjudicatedID,
                  picture._id,
                ),
            );

            return pictureAdjudicated;
          } else if (picture.deletedAt) {
            await this.removeFiles(
              updateAdjudicatedDto.adjudicatedID,
              picture._id,
            );
            return '';
          } else {
            return { ...picture, _id: picture._id };
          }
        },
      ),
    );

    // UPDATE ADJUDICATED PRODUCT
    return await this.adjudicatedModel.findOneAndUpdate(
      { _id: updateAdjudicatedDto.adjudicatedID },
      {
        $set: updateAdjudicatedDto.adjudicated,
        pictures: null,
        picturesImageDetail,
        updatedAt,
      },
      { new: true },
    );
  }

  // CLONE ADJUDICATED
  async cloneAdjudicated(adjudicatedID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const adjudicated: Adjudicated =
      await this.findAdjudicatedById(adjudicatedID);

    const images: Array<ImageDetailType> = adjudicated.pictures
      ? (adjudicated.pictures as unknown as ImageDetailType[])
      : adjudicated.picturesImageDetail;

    const picturesImageDetail = await Promise.all(
      await images.map(async (picture: ImageDetailType) => {
        const pictureId: any = new Types.ObjectId();
        const pictureImageDetail = picture
          ? {
              ...picture,
              image: await cloneFiles(
                picture.image,
                String(pictureId),
                'promotions',
              ),
            }
          : null;
        return pictureImageDetail;
      }),
    );

    // RETURN ADJUDICATED
    return await this.adjudicatedModel.create({
      // SET ALL DATA DTO
      ...adjudicated,
      name: adjudicated.name + ' (copia)',
      // SET ID
      _id,
      // SET PICTURE UPLOAD
      pictures: null,
      picturesImageDetail,
      slug: await getUniqueSlug(adjudicated, this.adjudicatedModel),
      item_status: 'draft',
    });
  }

  async changeAdjudicatedStatus(
    adjudicatedID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.adjudicatedModel.findOneAndUpdate(
      { _id: adjudicatedID },
      { $set: { item_status: status } },
      { new: true },
    );
  }

  // REMOVE ADJUDICATED
  async removeAdjudicated(adjudicatedID: Types.ObjectId): Promise<Adjudicated> {
    // REMOVE EPISODE PODCAST DATE
    const deletedAt: Date = new Date();

    return await this.adjudicatedModel.findOneAndUpdate(
      { _id: adjudicatedID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND GROUP INSURANCE
  async findAdjudicatedProductsGroupByCategory(
    findAll: boolean = false,
  ): Promise<AdjudicatedProductsByGroupCategory[]> {
    const status = findAll ? null : { item_status: { $in: ['publish', null] } };
    // CREATE PIPELINE
    const pipeline = [
      {
        $match: {
          deletedAt: null,
          ...(status ?? {}),
        },
      },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $group: {
          _id: '$category',
          category: {
            $first: {
              _id: '$category._id',
              name: '$category.name',
              pictures: '$category.pictures',
              parentTarget: '$category.parentTarget',
              target: '$category.target',
            },
          },
          products: {
            $push: {
              _id: '$_id',
              category: '$category',
              status: '$status',
              name: '$name',
              excerpt: '$excerpt',
              description: '$description',
              pictures: '$pictures',
              picturesImageDetail: '$picturesImageDetail',
              price: '$price',
              address: '$address',
              phone: '$phone',
              disabled: '$disabled',
              item_status: '$item_status',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              deletedAt: '$deletedAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          products: 1,
        },
      },
    ];

    // RETURN ADJUDICATED
    return await this.adjudicatedModel.aggregate(pipeline).exec();
  }

  // FIND ADJUDICATED BY ID
  async findAdjudicatedById(
    adjudicatedID: Types.ObjectId,
  ): Promise<Adjudicated> {
    return (await this.adjudicatedModel
      .findById(adjudicatedID)
      .lean()) as unknown as Adjudicated;
  }

  // FIND ADJUDICATED
  async findAdjudicated(
    argsAdjudicated: ArgsAdjudicated,
  ): Promise<Adjudicated[]> {
    // CREATE PIPELINE MATCH
    let match = [];

    // CREATE PIPELINE MATCHES
    const matches = [];

    // CREATE MATCH SEARCH
    const postSearch = {
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$name',
              },
              regex: argsAdjudicated.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$description',
              },
              regex: argsAdjudicated.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$address',
              },
              regex: argsAdjudicated.search,
              options: 'i',
            },
          },
        },
      ],
    };

    // CREATE MATCH SEARCH
    const postProvince = {
      $expr: {
        $regexMatch: {
          input: {
            $toString: '$province',
          },
          regex: argsAdjudicated.province,
          options: 'i',
        },
      },
    };

    // CREATE MATCH TYPE
    const postCategory = {
      $expr: {
        $regexMatch: {
          input: {
            $toString: '$category',
          },
          regex: argsAdjudicated.category,
          options: 'i',
        },
      },
    };

    // CREATE MATCH TYPE
    const postPriceRange = {
      price: { $gte: argsAdjudicated.priceMin, $lte: argsAdjudicated.priceMax },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    argsAdjudicated.province && argsAdjudicated.province !== ''
      ? matches.push(postProvince)
      : [];

    argsAdjudicated.category && argsAdjudicated.category !== ''
      ? matches.push(postCategory)
      : [];

    argsAdjudicated.priceMin &&
    argsAdjudicated.priceMin !== null &&
    argsAdjudicated.priceMax &&
    argsAdjudicated.priceMax !== null
      ? matches.push(postPriceRange)
      : [];

    match = [
      {
        $and: [...matches, postSearch],
      },
    ];

    // CREATE PIPELINE MATCH USER
    const pipeline = [
      {
        $match: {
          deletedAt: null,
          $or: [...match],
        },
      },
    ];

    // AGGREGATE
    return await this.adjudicatedModel.aggregate(pipeline);
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageAdjudicated(
    flag: string,
    imageAdjudicated: any,
    adjudicatedID: Types.ObjectId,
    pictureID?: Types.ObjectId,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(adjudicatedID, pictureID));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imageAdjudicated, adjudicatedID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, adjudicatedID: Types.ObjectId) {
    const createParams = {
      filepath: 'adjudicated',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: adjudicatedID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(adjudicatedID: Types.ObjectId, pictureID?: Types.ObjectId) {
    const removeObject = [];
    const adjudicated = await this.adjudicatedModel
      .findById(adjudicatedID)
      .select('pictures')
      .lean();

    if (pictureID) {
      adjudicated.pictures?.map((picture: AdjudicatedPictureType) => {
        if (String(picture._id) === String(pictureID)) {
          removeObject.push({
            Key: `${ASContainerName}${picture.image.split(ASContainerName)[1]}`,
          });
        }
      });

      adjudicated.picturesImageDetail?.map((picture: ImageDetailType) => {
        if (String(picture._id) === String(pictureID)) {
          removeObject.push({
            Key: `${ASContainerName}${picture.image.split(ASContainerName)[1]}`,
          });
        }
      });
    }

    return await this.azureBlobStorageService.remove(removeObject);
  }
}
