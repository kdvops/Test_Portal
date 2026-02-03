import { Model, PipelineStage, Types } from 'mongoose';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT FINANCIALLY SCHEMA
import { Financially, FinanciallyDocument } from './schema/financially.schema';

// IMPORT FINANCIALLY INPUT
import { CreateFinanciallyDto } from './dto/create.financially.dto';
import { UpdateFinanciallyDto } from './dto/update.financially.dto';
import {
  ArgsFinancially,
  FinanciallyByGroupType,
  FinanciallyPostType,
} from './dto/args.financially.dto';
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
import { FinanciallyPostPaginationType } from './financially.type';
import { AuthorInput, AuthorInputUpdate } from 'src/common/types/author.type';

@Injectable()
export class FinanciallyService {
  constructor(
    @InjectModel(Financially.name)
    private financiallyModel: Model<FinanciallyDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE FINANCIALLY
  async createFinancially(
    createFinanciallyDto: CreateFinanciallyDto,
  ): Promise<any> {
    if (createFinanciallyDto.sections == null) {
      throw new BadRequestException('Sections are required');
    }
    // CREATE ID
    const _id: any = new Types.ObjectId();
    // SET NEW IMAGES
    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createFinanciallyDto.bannerImageDetail,
      'financially',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createFinanciallyDto.thumbnailImageDetail,
      'financially',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createFinanciallyDto.responsiveImageDetail,
      'financially',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW FILE
    const newFileFinancially =
      createFinanciallyDto.file &&
      createFinanciallyDto.file[0] &&
      createFinanciallyDto.file[0].file &&
      createFinanciallyDto.file[0].filetype
        ? await this.checkUploadImageFinancially(
            'create',
            createFinanciallyDto.file,
            _id,
            'file',
          )
        : '';
    // SET NEW FILE

    // CREATE SECTIONS
    const sections = await Promise.all(
      createFinanciallyDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS
    const authors = await Promise.all(
      (createFinanciallyDto.authors ?? []).map(async (author: AuthorInput) => {
        const authorCreate = {
          ...author,
          _id: new Types.ObjectId(),
          image: await getImageDetail(
            _id,
            null,
            author.image,
            'financially',
            async () => await this.removeFiles(_id, 'authors'),
            'create',
          ),
        };
        return authorCreate;
      }),
    );
    // CREATE AUTHORS

    // RETURN FINANCIALLY
    return await this.financiallyModel.create({
      // SET ALL DATA DTO
      ...createFinanciallyDto,

      // SET ID
      _id,
      // SET PICTURE UPLOAD
      banner: null,
      // SET THUMBNAIL UPLOAD
      thumbnail: null,
      // SET RESPONSIVE UPLOAD
      responsive: null,
      bannerImageDetail,
      thumbnailImageDetail,
      responsiveImageDetail,

      // SET FILE UPLOAD
      file: newFileFinancially,

      // SET SECTIONS
      sections,
      authors,
    });
  }

  // UPDATE FINANCIALLY
  async updateFinancially(
    updateFinanciallyDto: UpdateFinanciallyDto,
  ): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateFinanciallyDto.financiallyID,
      updateFinanciallyDto.financially.banner,
      updateFinanciallyDto.financially.bannerImageDetail,
      'financially',
      async () =>
        await this.removeFiles(
          updateFinanciallyDto.financiallyID,
          'bannerImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updateFinanciallyDto.financiallyID,
      updateFinanciallyDto.financially.thumbnail,
      updateFinanciallyDto.financially.thumbnailImageDetail,
      'financially',
      async () =>
        await this.removeFiles(
          updateFinanciallyDto.financiallyID,
          'thumbnailImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateFinanciallyDto.financiallyID,
      updateFinanciallyDto.financially.responsive,
      updateFinanciallyDto.financially.responsiveImageDetail,
      'financially',
      async () =>
        await this.removeFiles(
          updateFinanciallyDto.financiallyID,
          'responsiveImageDetail',
        ),
    );

    // SET FILE IMAGES
    const newFileFinancially =
      updateFinanciallyDto.newUploadFile &&
      updateFinanciallyDto.newUploadFile[0] &&
      updateFinanciallyDto.newUploadFile[0].file &&
      updateFinanciallyDto.newUploadFile[0].filetype
        ? await this.checkUploadImageFinancially(
            'update',
            updateFinanciallyDto.newUploadFile,
            updateFinanciallyDto.financiallyID,
            'file',
          )
        : updateFinanciallyDto.financially.file;
    // SET FILE IMAGES

    // FIND ORIGINAL FINANCIALLY SECTIONS
    const sectionOriginalFinancially: { sections: SectionType[] } =
      (await this.financiallyModel
        .findById(updateFinanciallyDto.financiallyID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalFinancially.sections,
      updateFinanciallyDto.financially.sections,
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

    const authors = await Promise.all(
      (updateFinanciallyDto.financially.authors ?? []).map(
        async (author: AuthorInputUpdate) => {
          const authorUpdate = {
            ...author,
            _id: author._id ?? new Types.ObjectId(),
            image: await getImageDetail(
              updateFinanciallyDto.financiallyID,
              null,
              author.image,
              'financially',
              async () =>
                await this.removeFiles(
                  updateFinanciallyDto.financiallyID,
                  'authors',
                ),
              'create',
            ),
          };
          return authorUpdate;
        },
      ),
    );

    //trhow an error if sections are missing or undefined
    if (!updateFinanciallyDto.financially.sections) {
      throw new BadRequestException(`Sections for the post are missing`);
    }

    // UPDATE SECTIONS
    const sections = await Promise.all(
      updateFinanciallyDto.financially.sections.map(
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

    return await this.financiallyModel.findOneAndUpdate(
      { _id: updateFinanciallyDto.financiallyID },
      {
        $set: updateFinanciallyDto.financially,
        banner: null,
        thumbnail: null,
        responsive: null,
        bannerImageDetail,
        thumbnailImageDetail,
        responsiveImageDetail,
        file: newFileFinancially,
        sections,
        authors,
        updatedAt,
      },
      { new: true },
    );
  }

  // CLONE FINANCIALLY
  async cloneFinancially(financiallyID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const financially: FinanciallyPostType =
      await this.findFinanciallyById(financiallyID);

    const banner = await cloneFiles(
      financially.banner,
      financiallyID.toString(),
    );
    const thumbnail = financially.thumbnail
      ? await cloneFiles(financially.thumbnail, financiallyID.toString())
      : null;
    const responsive = financially.responsive
      ? await cloneFiles(financially.responsive, financiallyID.toString())
      : null;
    const file = financially.file
      ? await cloneFiles(financially.file, financiallyID.toString())
      : null;

    const bannerImageDetail = financially.bannerImageDetail
      ? {
          ...financially.bannerImageDetail,
          image: financially.bannerImageDetail
            ? await cloneFiles(
                financially.bannerImageDetail.image,
                String(_id),
                'prouser',
              )
            : null,
        }
      : null;

    const responsiveIbannerImageDetail = financially.responsiveImageDetail
      ? {
          ...financially.responsiveImageDetail,
          image: financially.responsiveImageDetail
            ? await cloneFiles(
                financially.responsiveImageDetail.image,
                String(_id),
                'prouser',
              )
            : null,
        }
      : null;

    const thumbnailIbannerImageDetail = financially.thumbnailImageDetail
      ? {
          ...financially.thumbnailImageDetail,
          image: financially.thumbnailImageDetail
            ? await cloneFiles(
                financially.thumbnailImageDetail.image,
                String(_id),
                'prouser',
              )
            : null,
        }
      : null;

    // CREATE SECTIONS
    const sections = await Promise.all(
      financially.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    const authors = await Promise.all(
      financially.authors?.map(async (author: AuthorInputUpdate) => {
        const authorUpdate = {
          ...author,
          image: author.image
            ? await cloneFiles(
                author.image.image,
                String(author._id),
                'authors',
              )
            : null,
        };
        return authorUpdate;
      }) || [],
    );

    // RETURN FINANCIALLY
    return await this.financiallyModel.create({
      ...financially,
      title: financially.title + ' (copia)',
      _id,
      banner,
      thumbnail,
      responsive,
      bannerImageDetail,
      responsiveIbannerImageDetail,
      thumbnailIbannerImageDetail,
      ...(file && file),
      sections,
      slug: await getUniqueSlug(financially, this.financiallyModel),
      status: 'draft',
      authors,
    });
  }

  // UPDATE FINANCIALLY
  async removeFinancially(financiallyID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.financiallyModel.findOneAndUpdate(
      { _id: financiallyID },
      { $set: { deletedAt } },
      { new: true },
    );
  }
  // UPDATE FINANCIALLY
  async toggleFinanciallyPin(financiallyID: Types.ObjectId): Promise<any> {
    return await this.financiallyModel.findOneAndUpdate(
      { _id: financiallyID },
      [
        {
          $set: {
            pinnedAt: {
              $cond: [{ $ifNull: ['$pinnedAt', false] }, null, '$$NOW'],
            },
          },
        },
      ],
      { new: true },
    );
  }

  // CREATE FINANCIALLY
  async findFinanciallyGroupByType(): Promise<FinanciallyByGroupType[]> {
    // CREATE PIPELINE
    const pipeline: PipelineStage[] = [
      {
        $match: { deletedAt: null },
      },
      {
        $group: {
          _id: '$type',
          type: { $first: '$type' },
          financially: {
            $push: {
              _id: '$_id',
              title: '$title',
              slug: '$slug',
              subtitle: '$subtitle',
              excerpt: '$excerpt',
              description: '$description',
              banner: '$banner',
              thumbnail: '$thumbnail',
              responsive: '$responsive',
              bannerImageDetail: '$bannerImageDetail',
              responsiveImageDetail: '$responsiveImageDetail',
              thumbnailImageDetail: '$thumbnailImageDetail',
              file: '$file',
              type: '$type',
              disabled: '$disabled',
              status: '$status',
              pinnedAt: '$pinnedAt',
            },
          },
        },
      },
      {
        $set: {
          financially: {
            $sortArray: {
              input: '$financially',
              sortBy: { pinnedAt: -1, createdAt: -1 }, // pinned first, then newest
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: 1,
          financially: 1,
        },
      },
    ];

    // RETURN FINANCIALLY
    return await this.financiallyModel.aggregate(pipeline).exec();
  }

  // FIND FINANCIALLY BY ID
  async findFinanciallyById(
    financiallyID: Types.ObjectId,
  ): Promise<FinanciallyPostType> {
    const financially = (await this.financiallyModel
      .findOne({ _id: financiallyID })
      .populate(['sections'])
      .lean()) as unknown as FinanciallyPostType;

    if (!financially) {
      throw new NotFoundException(
        `Financially con ID ${financiallyID} no encontrado`,
      );
    }

    return financially;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.financiallyModel);
  }

  // FIND FINANCIALLY BY SLUG
  async findFinanciallyBySlug(slug: string): Promise<FinanciallyPostType> {
    return (await this.financiallyModel
      .findOne({ slug })
      .populate(['sections'])
      .lean()) as unknown as FinanciallyPostType;
  }

  // FIND FINANCIALLY
  async findFinancially(
    argsFinancially: ArgsFinancially,
    findAll: boolean = false,
  ): Promise<FinanciallyPostType[]> {
    if (!argsFinancially) {
      throw new BadRequestException('ArgsFinancially is required');
    }
    const status = findAll ? null : { status: { $in: ['publish', null] } };
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
              regex: argsFinancially.search,
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
              regex: argsFinancially.search,
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
              regex: argsFinancially.search,
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
              regex: argsFinancially.search,
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
          regex: argsFinancially.type,
          options: 'i',
        },
      },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    argsFinancially.search && argsFinancially.search !== ''
      ? matches.push(postSearch)
      : [];

    argsFinancially.type && argsFinancially.type !== ''
      ? matches.push(postType)
      : [];

    match = [
      {
        $and: [...matches, postSearch],
      },
    ];

    // CREATE PIPELINE MATCH USER
    const pipeline: PipelineStage[] = [
      {
        $match: {
          deletedAt: null,
          $or: [...match],
          ...(status ?? {}),
        },
      },
      // ↓ sort: pinned first, then newest by createdAt
      {
        $sort: {
          pinnedAt: -1,
          createdAt: -1,
        },
      },
    ];

    // AGGREGATE
    return await this.financiallyModel.aggregate(pipeline);
  }

  // FIND FINANCIALLY
  async findFinanciallyPaginated(
    argsFinancially: ArgsFinancially,
    findAll: boolean = false,
  ): Promise<FinanciallyPostPaginationType> {
    if (!argsFinancially) {
      throw new BadRequestException('ArgsFinancially is required');
    }
    const status = findAll ? null : { status: { $in: ['publish', null] } };

    const currentPage = Math.max(1, argsFinancially.page ?? 1);
    const itemsPerPage = Math.max(
      1,
      Math.min(100, argsFinancially.itemsPerPage ?? 9),
    );

    const skip = (currentPage - 1) * itemsPerPage;

    const matches: any[] = [];
    if (argsFinancially?.search) {
      matches.push({
        $or: [
          { title: { $regex: argsFinancially.search, $options: 'i' } },
          { subtitle: { $regex: argsFinancially.search, $options: 'i' } },
          { slug: { $regex: argsFinancially.search, $options: 'i' } },
          { excerpt: { $regex: argsFinancially.search, $options: 'i' } },
        ],
      });
    }
    if (argsFinancially?.type) {
      matches.push({ type: { $regex: argsFinancially.type, $options: 'i' } });
    }

    const matchStage = {
      deletedAt: null,
      ...(status ?? {}),
      ...(matches.length ? { $and: matches } : {}),
    };

    const pipeline: PipelineStage[] = [
      { $match: matchStage },
      { $sort: { pinnedAt: -1, createdAt: -1 } },
      {
        $facet: {
          items: [{ $skip: skip }, { $limit: itemsPerPage }],
          total: [{ $count: 'count' }],
        },
      },
      {
        $project: {
          items: 1,
          totalItems: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
        },
      },
    ];

    const [res] = await this.financiallyModel.aggregate(pipeline);

    return {
      currentPage,
      items: (res?.items ?? []) as FinanciallyPostType[],
      totalItems: res?.totalItems ?? 0,
      itemsPerPage,
    };
  }

  // FIND FINANCIALLY
  async getFinanciallyRelated(
    financiallyId: Types.ObjectId,
  ): Promise<FinanciallyPostType[]> {
    const financiallyObjectId = financiallyId;
    const financially = await this.financiallyModel
      .findById(financiallyObjectId)
      .select('type')
      .lean();

    if (!financially) {
      return [];
    }

    const status = { status: { $in: ['publish', null] } };

    return (await this.financiallyModel
      .find({
        _id: { $ne: financiallyObjectId },
        type: financially.type,
        deletedAt: null,
        ...status,
      })
      .populate(['sections'])
      .limit(3)
      .lean()) as unknown as FinanciallyPostType[];
  }

  // FIND FINANCIALLY
  async getFinanciallyRecent(
    financiallyId: Types.ObjectId,
  ): Promise<FinanciallyPostType[]> {
    const financiallyObjectId = financiallyId;
    const financially = (await this.financiallyModel
      .findById(financiallyObjectId)
      .select('type')
      .lean()) as unknown as FinanciallyPostType | null;

    if (!financially) {
      return [];
    }

    const status = { status: { $in: ['publish', null] } };

    return (await this.financiallyModel
      .find({
        _id: { $ne: financiallyObjectId },
        type: financially.type,
        deletedAt: null,
        ...status,
      })
      .sort({ createdAt: -1 })
      .populate(['sections'])
      .limit(3)
      .lean()) as unknown as FinanciallyPostType[];
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageFinancially(
    flag: string,
    imageFinancially: any,
    financiallyID: Types.ObjectId,
    target: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(financiallyID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(
      imageFinancially,
      financiallyID,
      target,
    );
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, financiallyID: Types.ObjectId, target: string) {
    const createParams = {
      filepath: 'financially',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: target === 'file' ? file[0].file : file[0].img,
      fileID: financiallyID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  async changeFinanciallyStatus(
    financiallyID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.financiallyModel.findOneAndUpdate(
      { _id: financiallyID },
      { $set: { status } },
      { new: true },
    );
  }

  // REMOVE BUCKET
  async removeFiles(financiallyID: Types.ObjectId, type: string) {
    const removeObject = [];
    const financially = await this.financiallyModel
      .findById(financiallyID)
      .select(type)
      .lean();

    if (financially && financially[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${financially[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && financially[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${financially[type].image.split(ASContainerName)[1]}`,
        });
      }
    } else if (financially && type.includes('authors')) {
      financially.authors.forEach((author) => {
        if (author.image) {
          removeObject.push({
            Key: `${ASContainerName}${author.image.image.split(ASContainerName)[1]}`,
          });
        }
      });
    }

    return await this.azureBlobStorageService.remove(removeObject);
  }

  // FIND SECTION TO REMOVE
  findRemoveItemsInArray(
    original: SectionType[],
    modify: any[],
  ): SectionType[] {
    return original.filter((itemOriginal: SectionType) =>
      modify?.some(
        (itemModify: any) =>
          String(itemOriginal._id) === String(itemModify._id),
      ),
    );
  }
}
