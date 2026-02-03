import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT ENTERPRISE SCHEMA
import { Enterprise, EnterpriseDocument } from './schema/enterprise.schema';

// IMPORT ENTERPRISE INPUT
import { CreateEnterpriseDto } from './dto/create.enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update.enterprise.dto';
import {
  ArgsEnterprise,
  EnterpriseByGroupType,
  EnterprisePostType,
} from './dto/args.enterprise.dto';
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
export class EnterpriseService {
  constructor(
    @InjectModel(Enterprise.name)
    private enterpriseModel: Model<EnterpriseDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE ENTERPRISE
  async createEnterprise(
    createEnterpriseDto: CreateEnterpriseDto,
  ): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createEnterpriseDto.bannerImageDetail,
      'enterprise',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createEnterpriseDto.thumbnailImageDetail,
      'enterprise',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createEnterpriseDto.responsiveImageDetail,
      'enterprise',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );

    // CREATE SECTIONS
    const sections = await Promise.all(
      createEnterpriseDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN ENTERPRISE
    return await this.enterpriseModel.create({
      // SET ALL DATA DTO
      ...createEnterpriseDto,

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

  // UPDATE ENTERPRISE
  async updateEnterprise(
    updateEnterpriseDto: UpdateEnterpriseDto,
  ): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateEnterpriseDto.enterpriseID,
      updateEnterpriseDto.enterprise.banner,
      updateEnterpriseDto.enterprise.bannerImageDetail,
      'enterprise',
      async () =>
        await this.removeFiles(
          updateEnterpriseDto.enterpriseID,
          'bannerImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updateEnterpriseDto.enterpriseID,
      updateEnterpriseDto.enterprise.thumbnail,
      updateEnterpriseDto.enterprise.thumbnailImageDetail,
      'enterprise',
      async () =>
        await this.removeFiles(
          updateEnterpriseDto.enterpriseID,
          'thumbnailImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateEnterpriseDto.enterpriseID,
      updateEnterpriseDto.enterprise.responsive,
      updateEnterpriseDto.enterprise.responsiveImageDetail,
      'enterprise',
      async () =>
        await this.removeFiles(
          updateEnterpriseDto.enterpriseID,
          'responsiveImageDetail',
        ),
    );

    // FIND ORIGINAL ENTERPRISE SECTIONS
    const sectionOriginalEnterprise: { sections: SectionType[] } =
      (await this.enterpriseModel
        .findById(updateEnterpriseDto.enterpriseID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalEnterprise.sections,
      updateEnterpriseDto.enterprise.sections,
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
      updateEnterpriseDto.enterprise.sections.map(
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

    return await this.enterpriseModel.findOneAndUpdate(
      { _id: updateEnterpriseDto.enterpriseID },
      {
        $set: updateEnterpriseDto.enterprise,
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

  // CLONE PROUSER
  async cloneEnterprise(itemID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingEnterprise = await this.findEnterpriseById(itemID);

    const banner = await cloneFiles(
      existingEnterprise.banner,
      String(_id),
      'enterprise',
    );

    const responsive = await cloneFiles(
      existingEnterprise.responsive,
      String(_id),
      'enterprise',
    );

    const thumbnail = await cloneFiles(
      existingEnterprise.thumbnail,
      String(_id),
      'enterprise',
    );

    const bannerImageDetail = existingEnterprise.bannerImageDetail
      ? {
          ...existingEnterprise.bannerImageDetail,
          image: existingEnterprise.bannerImageDetail
            ? await cloneFiles(
                existingEnterprise.bannerImageDetail.image,
                String(_id),
                'enterprise',
              )
            : null,
        }
      : null;

    const responsiveIbannerImageDetail =
      existingEnterprise.responsiveImageDetail
        ? {
            ...existingEnterprise.responsiveImageDetail,
            image: existingEnterprise.responsiveImageDetail
              ? await cloneFiles(
                  existingEnterprise.responsiveImageDetail.image,
                  String(_id),
                  'enterprise',
                )
              : null,
          }
        : null;

    const thumbnailIbannerImageDetail = existingEnterprise.thumbnailImageDetail
      ? {
          ...existingEnterprise.thumbnailImageDetail,
          image: existingEnterprise.thumbnailImageDetail
            ? await cloneFiles(
                existingEnterprise.thumbnailImageDetail.image,
                String(_id),
                'enterprise',
              )
            : null,
        }
      : null;

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingEnterprise.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN PROUSER
    return await this.enterpriseModel.create({
      ...existingEnterprise,
      title: existingEnterprise.title + ' (copia)',
      _id,
      banner,
      thumbnail,
      responsive,
      bannerImageDetail,
      responsiveIbannerImageDetail,
      thumbnailIbannerImageDetail,
      sections,
      slug: await getUniqueSlug(existingEnterprise, this.enterpriseModel),
      status: 'draft',
    });
  }

  async changeEnterpriseStatus(
    enterpriseID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.enterpriseModel.findOneAndUpdate(
      { _id: enterpriseID },
      { $set: { status } },
      { new: true },
    );
  }

  // UPDATE ENTERPRISE
  async removeEnterprise(enterpriseID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.enterpriseModel.findOneAndUpdate(
      { _id: enterpriseID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND GROUP ENTERPRISE
  async findEnterpriseGroupByType(
    findAll: boolean = false,
  ): Promise<EnterpriseByGroupType[]> {
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
          enterprise: {
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
          enterprise: 1,
        },
      },
    ];

    // RETURN ENTERPRISE
    return await this.enterpriseModel.aggregate(pipeline).exec();
  }

  // FIND ENTERPRISE BY ID
  async findEnterpriseById(
    enterpriseID: Types.ObjectId,
  ): Promise<EnterprisePostType> {
    const enterprise = (await this.enterpriseModel
      .findOne({ _id: enterpriseID })
      .populate(['sections', 'category'])
      .lean()) as unknown as EnterprisePostType;

    if (!enterprise) {
      throw new NotFoundException(
        `Enterprise con ID ${enterpriseID} no encontrado`,
      );
    }

    return enterprise;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.enterpriseModel);
  }

  // FIND ENTERPRISE BY SLUG
  async findEnterpriseBySlug(slug: string): Promise<EnterprisePostType> {
    return (await this.enterpriseModel
      .findOne({ slug })
      .populate(['sections', 'category'])
      .lean()) as unknown as EnterprisePostType;
  }

  // FIND ENTERPRISE BY TYPE
  async findEnterpriseByCategory(
    category: string,
    findAll: boolean = false,
  ): Promise<EnterprisePostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.enterpriseModel
      .find({
        category: category,
        deletedAt: null,
        ...(status ?? {}),
      })
      .populate(['sections', 'category'])
      .lean()) as unknown as EnterprisePostType[];
  }

  // FIND ENTERPRISE
  async findEnterprise(
    argsEnterprise: ArgsEnterprise,
  ): Promise<EnterprisePostType[]> {
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
              regex: argsEnterprise.search,
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
              regex: argsEnterprise.search,
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
              regex: argsEnterprise.search,
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
              regex: argsEnterprise.search,
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
          regex: argsEnterprise.category,
          options: 'i',
        },
      },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    argsEnterprise.search && argsEnterprise.search !== ''
      ? matches.push(postSearch)
      : [];

    argsEnterprise.category && argsEnterprise.category !== ''
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
      {
        $lookup: {
          from: 'sections',
          localField: 'sections',
          foreignField: '_id',
          as: 'sections',
        },
      },
      {
        $unwind: {
          path: '$sections',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: '$_id',
          enterprise: {
            $first: {
              _id: '$_id',
              title: '$title',
              slug: '$slug',
              excerpt: '$excerpt',
              subtitle: '$subtitle',
              link: '$link',
              description: '$description',
              type: '$type',
              banner: '$banner',
              thumbnail: '$thumbnail',
              responsive: '$responsive',
              bannerImageDetail: '$bannerImageDetail',
              responsiveImageDetail: '$responsiveImageDetail',
              thumbnailImageDetail: '$thumbnailImageDetail',
              disabled: '$disabled',
              createdAt: '$createdAt',
              updatedAt: '$updatedAt',
              deletedAt: '$deletedAt',
            },
          },
          sections: {
            $push: {
              _id: '$sections._id',
              name: '$sections.name',
              description: '$sections.description',
              type: '$sections.type',
              style: '$sections.style',
              position: '$sections.position',
              color: '$sections.color',
              cards: '$sections.cards',
              text: '$sections.text',
              image: '$sections.image',
              imageDetail: '$sections.imageDetail',
              video: '$sections.video',
              attachments: '$sections.attachments',
              banner: '$sections.banner',
            },
          },
        },
      },
      {
        $project: {
          _id: '$_id',
          title: '$enterprise.title',
          slug: '$enterprise.slug',
          excerpt: '$enterprise.excerpt',
          link: '$enterprise.link',
          subtitle: '$enterprise.subtitle',
          description: '$enterprise.description',
          type: '$enterprise.type',
          banner: '$enterprise.banner',
          thumbnail: '$enterprise.thumbnail',
          responsive: '$enterprise.responsive',
          bannerImageDetail: '$enterprise.bannerImageDetail',
          responsiveImageDetail: '$enterprise.responsiveImageDetail',
          thumbnailImageDetail: '$enterprise.thumbnailImageDetail',
          disabled: '$enterprise.disabled',
          createdAt: '$enterprise.createdAt',
          updatedAt: '$enterprise.updatedAt',
          deletedAt: '$enterprise.deletedAt',
          sections: 1,
        },
      },
    ];

    // AGGREGATE
    return await this.enterpriseModel.aggregate(pipeline).exec();
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageEnterprise(
    flag: string,
    imageEnterprise: any,
    enterpriseID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(enterpriseID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(imageEnterprise, enterpriseID);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, enterpriseID: Types.ObjectId) {
    const createParams = {
      filepath: 'enterprise',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: enterpriseID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(enterpriseID: Types.ObjectId, type: string) {
    const removeObject = [];
    const enterprise = await this.enterpriseModel
      .findById(enterpriseID)
      .select(type)
      .lean();

    if (enterprise && enterprise[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${enterprise[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && enterprise[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${enterprise[type].image.split(ASContainerName)[1]}`,
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
