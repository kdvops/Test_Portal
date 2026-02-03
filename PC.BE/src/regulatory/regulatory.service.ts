import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT BUSINESS SCHEMA
import { Regulatory, RegulatoryDocument } from './schema/regulatory.schema';

// IMPORT BUSINESS INPUT
import { CreateRegulatoryDto } from './dto/create.regulatory.dto';
import { UpdateRegulatoryDto } from './dto/update.regulatory.dto';
import {
  ArgsRegulatory,
  RegulatoryByGroupType,
  RegulatoryPostType,
} from './dto/args.regulatory.dto';
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
export class RegulatoryService {
  constructor(
    @InjectModel(Regulatory.name)
    private regulatoryModel: Model<RegulatoryDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE BUSINESS
  async createRegulatory(
    createRegulatoryDto: CreateRegulatoryDto,
  ): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createRegulatoryDto.bannerImageDetail,
      'regulatory',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );

    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createRegulatoryDto.thumbnailImageDetail,
      'regulatory',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createRegulatoryDto.responsiveImageDetail,
      'regulatory',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );

    // CREATE SECTIONS
    const sections = await Promise.all(
      createRegulatoryDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN BUSINESS
    return await this.regulatoryModel.create({
      // SET ALL DATA DTO
      ...createRegulatoryDto,

      // SET ID
      _id,

      // SET PICTURE UPLOAD
      banner: null,
      // SET PICTURE UPLOAD
      thumbnail: null,
      // SET PICTURE UPLOAD
      responsive: null,
      bannerImageDetail,
      thumbnailImageDetail,
      responsiveImageDetail,

      // SET SECTIONS
      sections,
    });
  }

  // UPDATE BUSINESS
  async updateRegulatory(
    updateRegulatoryDto: UpdateRegulatoryDto,
  ): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateRegulatoryDto.regulatoryID,
      updateRegulatoryDto.regulatory.banner,
      updateRegulatoryDto.regulatory.bannerImageDetail,
      'regulatory',
      async () =>
        await this.removeFiles(
          updateRegulatoryDto.regulatoryID,
          'bannerImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updateRegulatoryDto.regulatoryID,
      updateRegulatoryDto.regulatory.thumbnail,
      updateRegulatoryDto.regulatory.thumbnailImageDetail,
      'regulatory',
      async () =>
        await this.removeFiles(
          updateRegulatoryDto.regulatoryID,
          'thumbnailImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateRegulatoryDto.regulatoryID,
      updateRegulatoryDto.regulatory.responsive,
      updateRegulatoryDto.regulatory.responsiveImageDetail,
      'regulatory',
      async () =>
        await this.removeFiles(
          updateRegulatoryDto.regulatoryID,
          'responsiveImageDetail',
        ),
    );

    // FIND ORIGINAL BUSINESS SECTIONS
    const sectionOriginalRegulatory: { sections: SectionType[] } =
      (await this.regulatoryModel
        .findById(updateRegulatoryDto.regulatoryID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalRegulatory.sections,
      updateRegulatoryDto.regulatory.sections,
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
      updateRegulatoryDto.regulatory.sections.map(
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

    return await this.regulatoryModel.findOneAndUpdate(
      { _id: updateRegulatoryDto.regulatoryID },
      {
        $set: updateRegulatoryDto.regulatory,
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

  // CREATE BUSINESS
  async cloneRegulatory(regulatoryID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingRegulatory = await this.findRegulatoryById(regulatoryID);

    const banner = await cloneFiles(
      existingRegulatory.banner,
      String(_id),
      'regulatory',
    );

    const responsive = await cloneFiles(
      existingRegulatory.responsive,
      String(_id),
      'regulatory',
    );

    const thumbnail = await cloneFiles(
      existingRegulatory.thumbnail,
      String(_id),
      'regulatory',
    );

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingRegulatory.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN BUSINESS
    return await this.regulatoryModel.create({
      ...existingRegulatory,
      title: existingRegulatory.title + ' (copia)',
      _id,
      banner,
      thumbnail,
      responsive,
      sections,
      slug: await getUniqueSlug(existingRegulatory, this.regulatoryModel),
      status: 'draft',
    });
  }

  async changeRegulatoryStatus(
    regulatoryID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.regulatoryModel.findOneAndUpdate(
      { _id: regulatoryID },
      { $set: { status } },
      { new: true },
    );
  }

  // UPDATE BUSINESS
  async removeRegulatory(regulatoryID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.regulatoryModel.findOneAndUpdate(
      { _id: regulatoryID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND BUSINESS BY TYPE
  async findRegulatoryByCategory(
    category: string,
    findAll: boolean = false,
  ): Promise<RegulatoryPostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.regulatoryModel
      .find({ category: category, deletedAt: null, ...(status ?? {}) })
      .populate(['sections', 'category'])
      .lean()) as unknown as RegulatoryPostType[];
  }

  // FIND GROUP BUSINESS
  async findRegulatoryGroupByType(
    findAll: boolean = false,
  ): Promise<RegulatoryByGroupType[]> {
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
          regulatory: {
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
              regulatory: '$regulatory',
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
          regulatory: 1,
        },
      },
    ];

    // RETURN BUSINESS
    return await this.regulatoryModel.aggregate(pipeline).exec();
  }

  // FIND REGULATORY BY ID
  async findRegulatoryById(
    regulatoryID: Types.ObjectId,
  ): Promise<RegulatoryPostType> {
    const regulatory = (await this.regulatoryModel
      .findOne({ _id: regulatoryID })
      .populate(['sections', 'category'])
      .lean()) as unknown as RegulatoryPostType;

    if (!regulatory) {
      throw new NotFoundException(
        `Regulatory con ID ${regulatoryID} no encontrado`,
      );
    }

    return regulatory;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.regulatoryModel);
  }

  // FIND BUSINESS BY SLUG
  async findRegulatoryBySlug(slug: string): Promise<RegulatoryPostType> {
    return (await this.regulatoryModel
      .findOne({ slug })
      .populate(['sections', 'category'])
      .lean()) as unknown as RegulatoryPostType;
  }

  // FIND BUSINESS
  async findRegulatory(
    argsRegulatory: ArgsRegulatory,
  ): Promise<RegulatoryPostType[]> {
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
              regex: argsRegulatory.search,
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
              regex: argsRegulatory.search,
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
              regex: argsRegulatory.search,
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
              regex: argsRegulatory.search,
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
          regex: argsRegulatory.category,
          options: 'i',
        },
      },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    argsRegulatory.search && argsRegulatory.search !== ''
      ? matches.push(postSearch)
      : [];

    argsRegulatory.category && argsRegulatory.category !== ''
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
    return await this.regulatoryModel.aggregate(pipeline);
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageRegulatory(
    flag: string,
    imageRegulatory: any,
    regulatoryID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(regulatoryID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(imageRegulatory, regulatoryID);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, regulatoryID: Types.ObjectId) {
    const createParams = {
      filepath: 'regulatory',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: regulatoryID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(regulatoryID: Types.ObjectId, type: string) {
    const removeObject = [];
    const regulatoryQuery = this.regulatoryModel.findById(regulatoryID);
    if (!regulatoryQuery || typeof regulatoryQuery.select !== 'function') {
      return;
    }
    const regulatory = await regulatoryQuery.select(type).lean();
    if (!regulatory) {
      return;
    }

    if (regulatory && regulatory[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${regulatory[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && regulatory[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${regulatory[type].image.split(ASContainerName)[1]}`,
        });
      }
    }

    if (removeObject.length === 0) {
      return;
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
