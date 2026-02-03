import { Model, Types } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
// import * as _ from 'lodash';

// IMPORT ENTERPRISE SCHEMA
import { Channels, ChannelsDocument } from './schema/channels.schema';

// IMPORT ENTERPRISE INPUT
import { CreateChannelDto } from './dto/create.channel.dto';
import { UpdateChannelDto } from './dto/update.channels.dto';
import {
  ArgsChannels,
  ChannelsByGroupType,
  ChannelsPostType,
} from './dto/args.channels.dto';
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
export class ChannelsService {
  constructor(
    @InjectModel(Channels.name)
    private channelsModel: Model<ChannelsDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
    private sectionsService: SectionsService,
  ) {}

  // CREATE ENTERPRISE
  async createChannel(createChannelDto: CreateChannelDto): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();

    const bannerImageDetail = await getImageDetail(
      _id,
      null,
      createChannelDto.bannerImageDetail,
      'channels',
      async () => await this.removeFiles(_id, 'bannerImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      _id,
      null,
      createChannelDto.thumbnailImageDetail,
      'channels',
      async () => await this.removeFiles(_id, 'thumbnailImageDetail'),
      'create',
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      _id,
      null,
      createChannelDto.responsiveImageDetail,
      'channels',
      async () => await this.removeFiles(_id, 'responsiveImageDetail'),
      'create',
    );

    // CREATE SECTIONS
    const sections = await Promise.all(
      createChannelDto.sections.map(async (section: SectionInputCreate) => {
        const sectionCreate =
          await this.sectionsService.createSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );
    // CREATE SECTIONS

    // RETURN ENTERPRISE
    return await this.channelsModel.create({
      // SET ALL DATA DTO
      ...createChannelDto,

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
  async updateChannel(updateChannelDto: UpdateChannelDto): Promise<any> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const bannerImageDetail = await getImageDetail(
      updateChannelDto.channelID,
      updateChannelDto.channel.banner,
      updateChannelDto.channel.bannerImageDetail,
      'channels',
      async () =>
        await this.removeFiles(updateChannelDto.channelID, 'bannerImageDetail'),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const thumbnailImageDetail = await getImageDetail(
      updateChannelDto.channelID,
      updateChannelDto.channel.thumbnail,
      updateChannelDto.channel.thumbnailImageDetail,
      'channels',
      async () =>
        await this.removeFiles(
          updateChannelDto.channelID,
          'thumbnailImageDetail',
        ),
    );
    // SET NEW IMAGES

    // SET NEW IMAGES
    const responsiveImageDetail = await getImageDetail(
      updateChannelDto.channelID,
      updateChannelDto.channel.responsive,
      updateChannelDto.channel.responsiveImageDetail,
      'channels',
      async () =>
        await this.removeFiles(
          updateChannelDto.channelID,
          'responsiveImageDetail',
        ),
    );

    // FIND ORIGINAL ENTERPRISE SECTIONS
    const sectionOriginalChannels: { sections: SectionType[] } =
      (await this.channelsModel
        .findById(updateChannelDto.channelID)
        .populate(['sections'])
        .select('sections')
        .lean()) as unknown as { sections: SectionType[] };

    // FIND REMOVE SECTIONS
    const removeSections = this.findRemoveItemsInArray(
      sectionOriginalChannels.sections,
      updateChannelDto.channel.sections,
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
      updateChannelDto.channel.sections.map(
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

    return await this.channelsModel.findOneAndUpdate(
      { _id: updateChannelDto.channelID },
      {
        $set: updateChannelDto.channel,
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
  async cloneChannel(itemID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingChannel = await this.findChannelById(itemID);

    const banner = await cloneFiles(
      existingChannel.banner,
      String(_id),
      'channels',
    );

    const responsive = await cloneFiles(
      existingChannel.responsive,
      String(_id),
      'channels',
    );

    const thumbnail = await cloneFiles(
      existingChannel.thumbnail,
      String(_id),
      'channels',
    );

    const bannerImageDetail = existingChannel.bannerImageDetail
      ? {
          ...existingChannel.bannerImageDetail,
          image: existingChannel.bannerImageDetail
            ? await cloneFiles(
                existingChannel.bannerImageDetail.image,
                String(_id),
                'channels',
              )
            : null,
        }
      : null;

    const responsiveIbannerImageDetail = existingChannel.responsiveImageDetail
      ? {
          ...existingChannel.responsiveImageDetail,
          image: existingChannel.responsiveImageDetail
            ? await cloneFiles(
                existingChannel.responsiveImageDetail.image,
                String(_id),
                'channels',
              )
            : null,
        }
      : null;

    const thumbnailIbannerImageDetail = existingChannel.thumbnailImageDetail
      ? {
          ...existingChannel.thumbnailImageDetail,
          image: existingChannel.thumbnailImageDetail
            ? await cloneFiles(
                existingChannel.thumbnailImageDetail.image,
                String(_id),
                'channels',
              )
            : null,
        }
      : null;

    // CREATE SECTIONS
    const sections = await Promise.all(
      existingChannel.sections.map(async (section: SectionType) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const sectionCreate = await this.sectionsService.cloneSections(section);
        // RETURN SECTIONS
        return sectionCreate;
      }),
    );

    // RETURN PROUSER
    return await this.channelsModel.create({
      ...existingChannel,
      title: existingChannel.title + ' (copia)',
      _id,
      banner,
      thumbnail,
      responsive,
      bannerImageDetail,
      responsiveIbannerImageDetail,
      thumbnailIbannerImageDetail,
      sections,
      slug: await getUniqueSlug(existingChannel, this.channelsModel),
      status: 'draft',
    });
  }

  async changeChannelStatus(
    channelID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.channelsModel.findOneAndUpdate(
      { _id: channelID },
      { $set: { status } },
      { new: true },
    );
  }

  // UPDATE ENTERPRISE
  async removeChannel(channelID: Types.ObjectId): Promise<any> {
    // REMOVE SLIDER DATE
    const deletedAt: Date = new Date();

    return await this.channelsModel.findOneAndUpdate(
      { _id: channelID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // FIND GROUP ENTERPRISE
  async findChannelsGroupByType(
    findAll: boolean = false,
  ): Promise<ChannelsByGroupType[]> {
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
          channels: {
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
          channels: 1,
        },
      },
    ];

    // RETURN ENTERPRISE
    return await this.channelsModel.aggregate(pipeline).exec();
  }

  // FIND GROUP ENTERPRISE
  async findChannelsPost(
    findAll: boolean = false,
  ): Promise<ChannelsPostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };

    return (await this.channelsModel
      .find({ deletedAt: null, ...(status ?? {}) })
      .populate(['sections', 'category'])
      .lean()) as unknown as ChannelsPostType[];
  }

  // FIND CHANNEL BY ID
  async findChannelById(
    channelID: Types.ObjectId,
  ): Promise<ChannelsPostType> {
    const channel = (await this.channelsModel
      .findOne({ _id: channelID })
      .populate(['sections', 'category'])
      .lean()) as unknown as ChannelsPostType;

    if (!channel) {
      throw new NotFoundException(`Channel con ID ${channelID} no encontrado`);
    }

    return channel;
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.channelsModel);
  }

  // FIND ENTERPRISE BY SLUG
  async findChannelsBySlug(slug: string): Promise<ChannelsPostType> {
    return (await this.channelsModel
      .findOne({ slug })
      .populate(['sections', 'category'])
      .lean()) as unknown as ChannelsPostType;
  }

  // FIND ENTERPRISE BY TYPE
  async findChannelsByCategory(
    category: string,
    findAll: boolean = false,
  ): Promise<ChannelsPostType[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return (await this.channelsModel
      .find({
        category: category,
        deletedAt: null,
        ...(status ?? {}),
      })
      .populate(['sections', 'category'])
      .lean()) as unknown as ChannelsPostType[];
  }

  // FIND ENTERPRISE
  async findChannels(argsChannels: ArgsChannels): Promise<ChannelsPostType[]> {
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
              regex: argsChannels.search,
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
              regex: argsChannels.search,
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
              regex: argsChannels.search,
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
              regex: argsChannels.search,
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
          regex: argsChannels.category,
          options: 'i',
        },
      },
    };

    // VALIDATE AND PUSH MATCHES SEARCH
    argsChannels.search && argsChannels.search !== ''
      ? matches.push(postSearch)
      : [];

    argsChannels.category && argsChannels.category !== ''
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
          channels: {
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
              video: '$sections.video',
              attachments: '$sections.attachments',
              banner: '$sections.banner',
              grid: '$sections.grid',
              gallery: '$sections.gallery',
              accordion: '$sections.accordion',
            },
          },
        },
      },
      {
        $project: {
          _id: '$_id',
          title: '$channels.title',
          slug: '$channels.slug',
          excerpt: '$channels.excerpt',
          link: '$channels.link',
          subtitle: '$channels.subtitle',
          description: '$channels.description',
          type: '$channels.type',
          banner: '$channels.banner',
          thumbnail: '$channels.thumbnail',
          responsive: '$channels.responsive',
          bannerImageDetail: '$channels.bannerImageDetail',
          responsiveImageDetail: '$channels.responsiveImageDetail',
          thumbnailImageDetail: '$channels.thumbnailImageDetail',
          disabled: '$channels.disabled',
          createdAt: '$channels.createdAt',
          updatedAt: '$channels.updatedAt',
          deletedAt: '$channels.deletedAt',
          sections: 1,
        },
      },
    ];

    // AGGREGATE
    return await this.channelsModel.aggregate(pipeline).exec();
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImageChannels(
    flag: string,
    imageChannels: any,
    channelsID: Types.ObjectId,
    target?: string,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(channelsID, target));

    // UPLOAD NEW IMAGE
    const file: any = await this.uploadFiles(imageChannels, channelsID);
    return file.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, channelsID: Types.ObjectId) {
    const createParams = {
      filepath: 'channels',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: channelsID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(channelsID: Types.ObjectId, type: string) {
    const removeObject = [];
    const channels = await this.channelsModel
      .findById(channelsID)
      .select(type)
      .lean();

    if (channels && channels[type]) {
      if (!type.includes('ImageDetail')) {
        removeObject.push({
          Key: `${ASContainerName}${channels[type].split(ASContainerName)[1]}`,
        });
      } else if (type.includes('ImageDetail') && channels[type]?.image) {
        removeObject.push({
          Key: `${ASContainerName}${channels[type].image.split(ASContainerName)[1]}`,
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
