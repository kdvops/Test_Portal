import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as _ from 'lodash';

// IMPORT PROFIT SCHEMA
import { Profits, ProfitsDocument } from './schema/profits.schema';

// IMPORT PROFIT INPUT
import { CreateProfitDto } from './dto/create.profit.dto';
import { UpdateProfitsDto } from './dto/update.profit.dto';
import { ProfitsGroupByCategoryDto } from './dto/args.profits.dto';

// IMPORT S3 STORAGE SERVICE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';

// IMPORT MOMENT
// import { RemoveProfitsDto } from './dto/remove.profit.dto';

@Injectable()
export class ProfitsService {
  constructor(
    @InjectModel(Profits.name)
    private profitModel: Model<ProfitsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // GET ALL PROFIT
  async profitsGroupByCategory(
    findAll: boolean = false,
  ): Promise<ProfitsGroupByCategoryDto[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    // PIPELINE AGGREGATE
    const pipeline = [
      {
        $match: { deletedAt: null, ...(status ?? {}) },
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
          _id: '$category._id',
          category: {
            $first: {
              _id: '$category._id',
              name: '$category.name',
              pictures: '$category.pictures',
            },
          },
          profits: {
            $push: {
              _id: '$_id',
              name: '$name',
              description: '$description',
              category: '$category',
              color: '$color',
              date: '$date',
              percent: '$percent',
              devolution: '$devolution',
              condition: '$condition',
              disabled: '$disabled',
              status: '$status',
              picture: '$picture',
              pictureImageDetail: '$pictureImageDetail',
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          category: {
            _id: '$category._id',
            name: '$category.name',
            pictures: '$category.pictures',
          },
          profits: 1,
        },
      },
    ];

    return await this.profitModel.aggregate(pipeline);
  }

  // UPDATE PROFIT
  async updateProfits(updateProfitsDto: UpdateProfitsDto): Promise<Profits[]> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    // UPDATE PROFITS
    const profits = await Promise.all(
      updateProfitsDto.profits.map(async (profitDto) => {
        if (!profitDto._id) {
          // ID FOR NEW PROFIT
          const newProfitId = new Types.ObjectId();

          const picturerImageDetail = await getImageDetail(
            newProfitId,
            profitDto.picture,
            profitDto.pictureImageDetail,
            'profits',
            null,
            'create',
          );

          // REMOVE NEW PICTURE PROFIT
          _.omit(profitDto, ['newPictureProfit']);

          // CREATE NEW PROFIT
          const newProfit = await this.profitModel.create({
            // SET ALL DATA DTO
            ...profitDto,

            // SET ID
            _id: newProfitId,
            picture: null,
            picturerImageDetail,
          });

          // RETURN NEW PROFIT CREATED
          return newProfit;
        } else {
          const picturerImageDetail = await getImageDetail(
            profitDto._id,
            profitDto.picture,
            profitDto.pictureImageDetail,
            'profits',
            async () => await this.removeFiles(profitDto._id),
          );

          // REMOVE NEW PICTURE PROFIT
          _.omit(profitDto, ['newPictureProfit']);

          // UPDATE PROFIT
          const updateProfit = await this.profitModel.findOneAndUpdate(
            { _id: profitDto._id },
            {
              $set: profitDto,
              picture: null,
              picturerImageDetail,
              updatedAt,
            },
            { new: true },
          );

          // RETURN PROFIT UPDATED
          return updateProfit;
        }
      }),
    );

    // RETURN PROFITS
    return profits;
  }

  // CREATE PROFIT
  async createProfits(createProfitsDto: CreateProfitDto): Promise<Profits[]> {
    const profits = await Promise.all(
      createProfitsDto.profits.map(async (profitDto) => {
        // CREATE ID PROFIT
        const _id: any = new Types.ObjectId();

        const picturerImageDetail = await getImageDetail(
          _id,
          null,
          profitDto.pictureImageDetail,
          'profits',
          null,
          'create',
        );

        const profit = await this.profitModel.create({
          // SET ALL DATA DTO
          ...profitDto,

          // SET ID
          _id,
          picture: null,
          picturerImageDetail,
        });

        // RETURN PROFIT
        return profit;
      }),
    );

    // RETURN PROFITS
    return profits;
  }

  // CLONE PROFITS
  async cloneProfits(itemID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingProfit: Profits = (
      await this.findProfitById(itemID)
    ).toObject();

    const picture = await cloneFiles(
      existingProfit.picture,
      String(_id),
      'profits',
    );

    const toCreate = {
      ...existingProfit,
      name: existingProfit.name + ' (copia)',
      _id,
      picture,
      slug: await getUniqueSlug(existingProfit, this.profitModel),
    };
    // RETURN PROUSER
    return await this.profitModel.create(toCreate);
  }

  // GET PROFIT BY ID
  async findProfitById(profitID: Types.ObjectId): Promise<Profits> {
    return await this.profitModel.findById(profitID);
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.profitModel);
  }

  // GET PROFIT BY CATEGORY
  async findProfitsByCategory(
    categoryID: string,
    findAll: boolean = false,
  ): Promise<Profits[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return await this.profitModel.find({
      category: categoryID,
      deletedAt: null,
      ...(status ?? {}),
    });
  }

  async changeProfitsStatus(
    profitID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.profitModel.findOneAndUpdate(
      { _id: profitID },
      { $set: { status } },
      { new: true },
    );
  }

  // REMOVE PROFIT BY ID
  async removeProfits(profitID: Types.ObjectId): Promise<Profits[]> {
    // REMOVE IMAGE
    await this.removeFiles(profitID);

    // REMOVE PROFIT DATE
    const deletedAt: Date = new Date();

    // SET EMPTY STRING TO PICTURE
    const picture: string = '';

    return await this.profitModel.findOneAndUpdate(
      { _id: profitID },
      { $set: { deletedAt, picture } },
      { new: true },
    );
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageProfit(
    flag: string,
    imageProfit: any,
    profitID: Types.ObjectId,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(profitID));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imageProfit, profitID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, profitID: Types.ObjectId) {
    const createParams = {
      filepath: 'profits',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: profitID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(profitID: Types.ObjectId) {
    const removeObject = [];
    const profitQuery = this.profitModel.findById(profitID);
    if (!profitQuery || typeof profitQuery.select !== 'function') {
      return;
    }
    const profit = await profitQuery.select('picture pictureImageDetail').lean();
    if (!profit) {
      return;
    }

    if (profit.picture) {
      removeObject.push({
        Key: `${ASContainerName}${profit.picture.split(ASContainerName)[1]}`,
      });
    }
    if (profit.pictureImageDetail?.image) {
      removeObject.push({
        Key: `${ASContainerName}${profit.pictureImageDetail.image.split(ASContainerName)[1]}`,
      });
    }

    if (removeObject.length === 0) {
      return;
    }
    return await this.azureBlobStorageService.remove(removeObject);
  }
}
