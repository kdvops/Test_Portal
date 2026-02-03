import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT BUSINESS SCHEMA
import { Business, BusinessDocument } from './schema/business.schema';

// IMPORT BUSINESS INPUT
import { CreateBusinessDto } from './dto/create.business.dto';
import { UpdateBusinessDto } from './dto/update.business.dto';
import {
  ArgsBusiness,
  BusinessByGroupType,
  BusinessPostType,
} from './dto/args.business.dto';
import { UpdateSectionDto } from 'src/sections/dto/update.section.dto';

// IMPORT SERVICES
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import {
  SectionInputCreate,
  SectionInputUpdate,
  SectionType,
} from 'src/common/types/sections.type';

import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';

@Injectable()
export class BusinessService {
  constructor(
    @InjectModel(Business.name)
    private businessModel: Model<BusinessDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE BUSINESS
  async createBusiness(createBusinessDto: CreateBusinessDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    // SET NEW IMAGES

    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createBusinessDto.bannerImageDetail,
      'business',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createBusinessDto.thumbnailImageDetail,
      'business',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createBusinessDto.responsiveImageDetail,
      'business',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );

    // CREATE SECTIONS
    const sections = await Promise.all(
      createBusinessDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN BUSINESS
    return await this.businessModel.create({
      // SET ALL DATA DTO
      ...createBusinessDto,

      // SET ID
      _id,
      banner: null,
      thumbnail: null,
      responsive: null,
      bannerImageDetail,
      thumbnailImageDetail,
      responsiveImageDetail,

      // SET SECTIONS
      sections,
    });
  }

  // UPDATE BUSINESS
  async updateBusiness(updateBusinessDto: UpdateBusinessDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateBusinessDto.businessID,
      updateBusinessDto.business.banner,
      updateBusinessDto.business.bannerImageDetail,
      'business',
      async () =>
        await this.removeFiles(
          updateBusinessDto.businessID,
          'bannerImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updateBusinessDto.businessID,
      updateBusinessDto.business.thumbnail,
      updateBusinessDto.business.thumbnailImageDetail,
      'business',
      async () =>
        await this.removeFiles(
          updateBusinessDto.businessID,
          'thumbnailImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateBusinessDto.businessID,
      updateBusinessDto.business.responsive,
      updateBusinessDto.business.responsiveImageDetail,
      'business',
      async () =>
        await this.removeFiles(
          updateBusinessDto.businessID,
          'responsiveImageDetail',
        ),
    );

    // FIND ORIGINAL BUSINESS SECTIONS
    const sectionOriginalBusiness: { sections: SectionType[] } =
      (await this.businessModel
        .findById(updateBusinessDto.businessID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalBusiness.sections,
      updateBusinessDto.business.sections,
    );

    removeSections.length > 0 &&
      (await Promise.all(
        removeSections.map(async (section: SectionType) => {
          const sectionRemove =
            await this.sectionsService.removeSections(section);
          // RETURN SECTIONS
          return sectionRemove;
        }),
      ));

    // UPDATE SECTIONS
    const sections = await Promise.all(
      updateBusinessDto.business.sections.map(
        async (section: SectionInputUpdate) => {
          if (section._id) {
            const updateDto: UpdateSectionDto = {
              sectionID: section._id,
              section: section,
            };
            const sectionUpdate =
              await this.sectionsService.updateSections(updateDto);
            // RETURN SECTIONS
            return sectionUpdate;
          } else {
            const sectionCreate =
              await this.sectionsService.createSections(section);
            // RETURN SECTIONS
            return sectionCreate;
          }
        },
      ),
    );
    // UPDATE SECTIONS

    return await this.businessModel.findOneAndUpdate(
      { _id: updateBusinessDto.businessID },
      {
        $set: updateBusinessDto.business,
        banner: null,
        thumbnail: null,
        responsive: null,
        bannerImageDetail,
        thumbnailImageDetail,
        responsiveImageDetail,
        sections,
        updatedAt,
      },
      { new: true },
    );
  }

  // CLONE BUSINESS
  async cloneBusiness(businessID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingBusiness = await this.findBusinessById(businessID);

    const banner = await cloneFiles(
      existingBusiness.banner,
      String(_id),
      'prouser',
    );

    const responsive = await cloneFiles(
      existingBusiness.responsive,
      String(_id),
      'prouser',
    );

    const thumbnail = await cloneFiles(
      existingBusiness.thumbnail,
      String(_id),
      'prouser',
    );

    const bannerImageDetail = existingBusiness.bannerImageDetail
      ? {
          ...existingBusiness.bannerImageDetail,
          image: existingBusiness.bannerImageDetail
            ? await cloneFiles(
                existingBusiness.bannerImageDetail.image,
                String(_id),
                'business',
              )
            : null,
        }
      : null;

    const responsiveIbannerImageDetail = existingBusiness.responsiveImageDetail
      ? {
          ...existingBusiness.responsiveImageDetail,
          image: existingBusiness.responsiveImageDetail
            ? await cloneFiles(
                existingBusiness.responsiveImageDetail.image,
                String(_id),
                'business',
              )
            : null,
        }
      : null;

    const thumbnailIbannerImageDetail = existingBusiness.thumbnailImageDetail
      ? {
          ...existingBusiness.thumbnailImageDetail,
          image: existingBusiness.thumbnailImageDetail
            ? await cloneFiles(
                existingBusiness.thumbnailImageDetail.image,
                String(_id),
                'business',
              )
            : null,
        }
      : null;

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingBusiness.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN PROUSER
    return await this.businessModel.create({
      ...existingBusiness,
      title: existingBusiness.title + ' (copia)',
      _id,
      banner,
      thumbnail,
      responsive,
      bannerImageDetail,
      responsiveIbannerImageDetail,
      thumbnailIbannerImageDetail,
      sections,
      slug: await getUniqueSlug(existingBusiness, this.businessModel),
      status: 'draft',
    });
  }

  async changeBusinessStatus(
    businessID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.businessModel.findOneAndUpdate(
      { _id: businessID },
      { $set: { status } },
      { new: true },
    );
  }

  // UPDATE BUSINESS
  async removeBusiness(businessID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.businessModel.findOneAndUpdate(
      { _id: businessID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND BUSINESS BY TYPE
  async findBusinessByCategory(
    category: string,
    findAll: boolean = false,
  ): Promise<BusinessPostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.businessModel
      .find({
        category: category,
        deletedAt: null,
        ...(status ?? {}),
      })
      .populate(['sections', 'category'])
      .lean()) as unknown as BusinessPostType[];
  }

  // FIND GROUP BUSINESS
  async findBusinessGroupByType(
    findAll: boolean = false,
  ): Promise<BusinessByGroupType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    // CREATE PIPELINE
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
          business: {
            $push: {
              _id: '$_id',
              title: '$title',
              subtitle: '$subtitle',
              slug: '$slug',
              excerpt: '$excerpt',
              link: '$link',
              description: '$description',
              banner: '$banner',
              thumbnail: '$thumbnail',
              responsive: '$responsive',
              bannerImageDetail: '$bannerImageDetail',
              responsiveImageDetail: '$responsiveImageDetail',
              thumbnailImageDetail: '$thumbnailImageDetail',
              category: '$category',
              disabled: '$disabled',
              status: '$status',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          business: 1,
        },
      },
    ];

    // RETURN BUSINESS
    return await this.businessModel.aggregate(pipeline).exec();
  }

  // FIND BUSINESS BY ID
  async findBusinessById(
    businessID: Types.ObjectId,
  ): Promise<BusinessPostType> {
    const business = (await this.businessModel
      .findOne({ _id: businessID })
      .populate(['sections', 'category'])
      .lean()) as unknown as BusinessPostType;

    if (!business) {
      throw new NotFoundException(
        `Business con ID ${businessID} no encontrado`,
      );
    }

    return business;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.businessModel);
  }

  // FIND BUSINESS BY ID
  async findBusinessBySlug(slug: string): Promise<BusinessPostType> {
    return (await this.businessModel
      .findOne({ slug })
      .populate(['sections', 'category'])
      .lean()) as unknown as BusinessPostType;
  }

  // FIND BUSINESS
  async findBusiness(argsBusiness: ArgsBusiness): Promise<BusinessPostType[]> {
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
                $toString: '$title',
              },
              regex: argsBusiness.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$subtitle',
              },
              regex: argsBusiness.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$slug',
              },
              regex: argsBusiness.search,
              options: 'i',
            },
          },
        },
        {
          $expr: {
            $regexMatch: {
              input: {
                $toString: '$excerpt',
              },
              regex: argsBusiness.search,
              options: 'i',
            },
          },
        },
      ],
    };

    // CREATE MATCH TYPE
    const postType = {
      $expr: {
        $regexMatch: {
          input: {
            $toString: '$category',
          },
          regex: argsBusiness.category,
          options: 'i',
        },
      },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    argsBusiness.search && argsBusiness.search !== ''
      ? matches.push(postSearch)
      : [];

    argsBusiness.category && argsBusiness.category !== ''
      ? matches.push(postType)
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
    return await this.businessModel.aggregate(pipeline);
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageBusiness(
    flag: string,
    imageBusiness: any,
    businessID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(businessID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(imageBusiness, businessID);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, businessID: Types.ObjectId) {
    const createParams = {
      filepath: 'business',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: businessID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(businessID: Types.ObjectId, type: string) {
    const removeObject = [];
    const business = await this.businessModel
      .findById(businessID)
      .select(type)
      .lean();

    if (business && business[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${business[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && business[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${business[type].image.split(ASContainerName)[1]}`,
        });
      }
    }

    return await this.azureBlobStorageService.remove(removeObject);
  }

  // FIND SECTION TO REMOVE
  findRemoveItemsInArray(
    original: SectionType[],
    modify: any[],
  ): SectionType[] {
    return original.filter(
      (itemOriginal: SectionType) =>
        !modify.some(
          (itemModify: any) =>
            String(itemOriginal._id) === String(itemModify._id),
        ),
    );
  }
}
