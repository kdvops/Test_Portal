import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT INSURANCE SCHEMA
import { Insurance, InsuranceDocument } from './schema/insurance.schema';

// IMPORT INSURANCE INPUT
import { CreateInsuranceDto } from './dto/create.insurance.dto';
import { UpdateInsuranceDto } from './dto/update.insurance.dto';
import {
  ArgsInsurance,
  InsuranceByGroupType,
  InsurancePostType,
} from './dto/args.insurance.dto';
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
export class InsuranceService {
  constructor(
    @InjectModel(Insurance.name)
    private insuranceModel: Model<InsuranceDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE INSURANCE
  async createInsurance(createInsuranceDto: CreateInsuranceDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createInsuranceDto.bannerImageDetail,
      'insurance',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createInsuranceDto.thumbnailImageDetail,
      'insurance',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createInsuranceDto.responsiveImageDetail,
      'insurance',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );

    // CREATE SECTIONS
    const sections = await Promise.all(
      createInsuranceDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN INSURANCE
    return await this.insuranceModel.create({
      // SET ALL DATA DTO
      ...createInsuranceDto,

      // SET ID
      _id,

      // SET PICTURE UPLOAD
      banner: null,
      thumbnail: null,
      responsive: null,
      bannerImageDetail,
      thumbnailImageDetail,
      responsiveImageDetail,
      sections,
    });
  }

  // UPDATE INSURANCE
  async updateInsurance(updateInsuranceDto: UpdateInsuranceDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateInsuranceDto.insuranceID,
      updateInsuranceDto.insurance.banner,
      updateInsuranceDto.insurance.bannerImageDetail,
      'insurance',
      async () =>
        await this.removeFiles(
          updateInsuranceDto.insuranceID,
          'bannerImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updateInsuranceDto.insuranceID,
      updateInsuranceDto.insurance.thumbnail,
      updateInsuranceDto.insurance.thumbnailImageDetail,
      'insurance',
      async () =>
        await this.removeFiles(
          updateInsuranceDto.insuranceID,
          'thumbnailImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateInsuranceDto.insuranceID,
      updateInsuranceDto.insurance.responsive,
      updateInsuranceDto.insurance.responsiveImageDetail,
      'insurance',
      async () =>
        await this.removeFiles(
          updateInsuranceDto.insuranceID,
          'responsiveImageDetail',
        ),
    );

    // FIND ORIGINAL INSURANCE SECTIONS
    const sectionOriginalInsurance: { sections: SectionType[] } =
      (await this.insuranceModel
        .findById(updateInsuranceDto.insuranceID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalInsurance.sections,
      updateInsuranceDto.insurance.sections,
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
      updateInsuranceDto.insurance.sections.map(
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

    return await this.insuranceModel.findOneAndUpdate(
      { _id: updateInsuranceDto.insuranceID },
      {
        $set: updateInsuranceDto.insurance,
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

  // CLONE insurance
  async cloneInsurance(insuranceID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingInsurance = await this.findInsuranceById(insuranceID);

    const banner = await cloneFiles(
      existingInsurance.banner,
      String(_id),
      'insurance',
    );

    const responsive = await cloneFiles(
      existingInsurance.responsive,
      String(_id),
      'insurance',
    );

    const thumbnail = await cloneFiles(
      existingInsurance.thumbnail,
      String(_id),
      'insurance',
    );

    const bannerImageDetail = existingInsurance.bannerImageDetail
      ? {
          ...existingInsurance.bannerImageDetail,
          image: existingInsurance.bannerImageDetail
            ? await cloneFiles(
                existingInsurance.bannerImageDetail.image,
                String(_id),
                'insurance',
              )
            : null,
        }
      : null;

    const responsiveIbannerImageDetail = existingInsurance.responsiveImageDetail
      ? {
          ...existingInsurance.responsiveImageDetail,
          image: existingInsurance.responsiveImageDetail
            ? await cloneFiles(
                existingInsurance.responsiveImageDetail.image,
                String(_id),
                'insurance',
              )
            : null,
        }
      : null;

    const thumbnailIbannerImageDetail = existingInsurance.thumbnailImageDetail
      ? {
          ...existingInsurance.thumbnailImageDetail,
          image: existingInsurance.thumbnailImageDetail
            ? await cloneFiles(
                existingInsurance.thumbnailImageDetail.image,
                String(_id),
                'insurance',
              )
            : null,
        }
      : null;

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingInsurance.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN insurance
    return await this.insuranceModel.create({
      ...existingInsurance,
      title: existingInsurance.title + ' (copia)',
      _id,
      banner,
      thumbnail,
      responsive,
      bannerImageDetail,
      responsiveIbannerImageDetail,
      thumbnailIbannerImageDetail,
      sections,
      slug: await getUniqueSlug(existingInsurance, this.insuranceModel),
      status: 'draft',
    });
  }

  async changeInsuranceStatus(
    insuranceID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.insuranceModel.findOneAndUpdate(
      { _id: insuranceID },
      { $set: { status } },
      { new: true },
    );
  }

  // UPDATE INSURANCE
  async removeInsurance(insuranceID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.insuranceModel.findOneAndUpdate(
      { _id: insuranceID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND INSURANCE BY TYPE
  async findInsuranceByCategory(
    category: string,
    findAll: boolean = false,
  ): Promise<InsurancePostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.insuranceModel
      .find({
        category: category,
        deletedAt: null,
        ...(status ?? {}),
      })
      .populate(['sections', 'category'])
      .lean()) as unknown as InsurancePostType[];
  }

  // FIND GROUP INSURANCE
  async findInsuranceGroupByType(
    findAll: boolean = false,
  ): Promise<InsuranceByGroupType[]> {
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
          insurance: {
            $push: {
              _id: '$_id',
              title: '$title',
              slug: '$slug',
              subtitle: '$subtitle',
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
              deletedAt: '$deletedAt',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          category: 1,
          insurance: 1,
        },
      },
    ];

    // RETURN INSURANCE
    return await this.insuranceModel.aggregate(pipeline).exec();
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.insuranceModel);
  }

  async findInsuranceBySlug(slug: string): Promise<InsurancePostType> {
    return (await this.insuranceModel
      .findOne({ slug })
      .populate(['sections', 'category'])
      .lean()) as unknown as InsurancePostType;
  }

  // FIND INSURANCE BY ID
  async findInsuranceById(
    insuranceID: Types.ObjectId,
  ): Promise<InsurancePostType> {
    const insurance = (await this.insuranceModel
      .findOne({ _id: insuranceID })
      .populate(['sections', 'category'])
      .lean()) as unknown as InsurancePostType;

    if (!insurance) {
      throw new NotFoundException(
        `Insurance con ID ${insuranceID} no encontrado`,
      );
    }

    return insurance;
  }

  // FIND INSURANCE
  async findInsurance(
    argsInsurance: ArgsInsurance,
  ): Promise<InsurancePostType[]> {
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
              regex: argsInsurance.search,
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
              regex: argsInsurance.search,
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
              regex: argsInsurance.search,
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
              regex: argsInsurance.search,
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
            $toString: '$type',
          },
          regex: argsInsurance.category,
          options: 'i',
        },
      },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    argsInsurance.search && argsInsurance.search !== ''
      ? matches.push(postSearch)
      : [];

    argsInsurance.category && argsInsurance.category !== ''
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
    return await this.insuranceModel.aggregate(pipeline);
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageInsurance(
    flag: string,
    imageInsurance: any,
    insuranceID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(insuranceID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(imageInsurance, insuranceID);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, insuranceID: Types.ObjectId) {
    const createParams = {
      filepath: 'insurance',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: insuranceID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(insuranceID: Types.ObjectId, type: string) {
    const removeObject = [];
    const insurance = await this.insuranceModel
      .findById(insuranceID)
      .select(type)
      .lean();

    if (insurance && insurance[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${insurance[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && insurance[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${insurance[type].image.split(ASContainerName)[1]}`,
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
