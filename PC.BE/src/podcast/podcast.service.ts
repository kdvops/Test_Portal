import { Model, Types } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

// IMPORT EPISODE PODCAST SCHEMA
import { Podcast, PodcastDocument } from './schema/podcast.schema';

// IMPORT EPISODE PODCAST INPUT
import { CreateEpisodePodcastDto } from './dto/create.podcast.dto';
import { UpdatePodcastEpisodeDto } from './dto/update.podcast.dto';
import { EpisodePodcastGroupBySeason } from './dto/args.podcast.dto';

// IMPORT S3 STORAGE SERVICE
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { ASContainerName, ImageCompression } from 'src/common/constants';

@Injectable()
export class PodcastService {
  constructor(
    @InjectModel(Podcast.name)
    private podcastModel: Model<PodcastDocument>,
    private azureBlobStorageService: AzureBlobStorageService,
  ) {}

  // GET ALL EPISODE PODCAST GROUP BY SEASON
  async episodePodcastGroupBySeason(
    findAll: boolean = false,
  ): Promise<EpisodePodcastGroupBySeason[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    // PIPELINE AGGREGATE
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
          localField: 'season',
          foreignField: '_id',
          as: 'season',
        },
      },
      {
        $unwind: '$season',
      },
      {
        $group: {
          _id: '$season._id',
          season: {
            $first: {
              _id: '$season._id',
              name: '$season.name',
              pictures: '$season.pictures',
              slug: '$season.slug',
            },
          },
          episodes: {
            $push: {
              _id: '$_id',
              title: '$title',
              slug: '$slug',
              description: '$description',
              season: '$season',
              link: '$link',
              disabled: '$disabled',
              cover: '$cover',
              coverImageDetail: '$coverImageDetail',
              status: '$status',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          season: 1,
          episodes: 1,
        },
      },
    ];

    return await this.podcastModel.aggregate(pipeline);
  }

  // UPDATE EPISODE PODCAST
  async updatePodcastEpisode(
    updatePodcastEpisodeDto: UpdatePodcastEpisodeDto,
  ): Promise<Podcast[]> {
    // SET UPDATED AT
    const updatedAt = Date.now();

    const coverImageDetail = await getImageDetail(
      updatePodcastEpisodeDto.episodeID,
      updatePodcastEpisodeDto.episode.cover,
      updatePodcastEpisodeDto.episode.coverImageDetail,
      'podcast',
      async () => await this.removeFiles(updatePodcastEpisodeDto.episodeID),
      'create',
    );

    // RETURN EPISODE PODCASTS
    return await this.podcastModel.findOneAndUpdate(
      { _id: updatePodcastEpisodeDto.episodeID },
      {
        $set: updatePodcastEpisodeDto.episode,
        cover: null,
        coverImageDetail,
        updatedAt,
      },
      { new: true },
    );
  }

  // CREATE EPISODE PODCAST
  async createPodcastEpisode(
    createEpisodePodcastDto: CreateEpisodePodcastDto,
  ): Promise<Podcast> {
    // CREATE ID EPISODE PODCAST
    const _id: any = new Types.ObjectId();

    const coverImageDetail = await getImageDetail(
      _id,
      null,
      createEpisodePodcastDto.coverImageDetail,
      'podcast',
      async () => await this.removeFiles(_id),
      'create',
    );

    // RETURN PODCAST
    return await this.podcastModel.create({
      // SET ALL DATA DTO
      ...createEpisodePodcastDto,

      // SET ID
      _id,

      // SET COVER UPLOAD
      cover: null,
      coverImageDetail,
    });
  }

  // REMOVE EPISODE PODCAST BY ID
  async clonePodcastEpisode(itemID: Types.ObjectId): Promise<any> {
    // CREATE ID
    const _id: any = new Types.ObjectId();
    const existingPodcastEpisode = await this.findEpisodePodcastById(itemID);

    const cover = await cloneFiles(
      existingPodcastEpisode.cover,
      String(_id),
      'podcast',
    );

    const coverImageDetail = existingPodcastEpisode.coverImageDetail
      ? {
          ...existingPodcastEpisode.coverImageDetail,
          image: existingPodcastEpisode.coverImageDetail
            ? await cloneFiles(
                existingPodcastEpisode.coverImageDetail.image,
                String(_id),
                'podcast',
              )
            : null,
        }
      : null;

    return await this.podcastModel.create({
      // SET ALL DATA DTO
      ...existingPodcastEpisode,
      title: existingPodcastEpisode.title + ' (copia)',
      // SET ID
      _id,
      // SET COVER UPLOAD
      cover,
      coverImageDetail,
      slug: await getUniqueSlug(existingPodcastEpisode, this.podcastModel),
      status: 'draft',
    });
  }

  // GET EPISODE PODCAST BY ID
  async findEpisodePodcastById(episodeID: Types.ObjectId): Promise<Podcast> {
    return await this.podcastModel.findById(episodeID);
  }

  async findUniqueSlug(slug: string): Promise<string> {
    return await getUniqueExistingSlug(slug, this.podcastModel);
  }

  // GET EPISODE PODCAST BY CATEGORY
  async findEpisodePodcastBySeason(
    seasonID: string,
    findAll: boolean = false,
  ): Promise<Podcast[]> {
    const status = findAll ? null : { status: { $in: ['publish', null] } };
    return await this.podcastModel.find({
      season: seasonID,
      deletedAt: null,
      ...(status ?? {}),
    });
  }

  async changePodcastEpisodeStatus(
    episodeID: Types.ObjectId,
    status: string = 'publish',
  ): Promise<any> {
    // RETURN CATEGORY
    return await this.podcastModel.findOneAndUpdate(
      { _id: episodeID },
      { $set: { status } },
      { new: true },
    );
  }

  // REMOVE EPISODE PODCAST BY ID
  async removePodcastEpisode(episodeID: Types.ObjectId): Promise<Podcast> {
    // REMOVE IMAGE
    await this.removeFiles(episodeID);

    // REMOVE EPISODE PODCAST DATE
    const deletedAt: Date = new Date();

    // SET EMPTY STRING TO PICTURE
    // const cover: string = '';

    return await this.podcastModel.findOneAndUpdate(
      { _id: episodeID },
      { $set: { deletedAt } },
      { new: true },
    );
  }

  // CHECK IMAGES UPLOAD BUCKET
  async checkUploadImagePodcast(
    flag: string,
    imagePodcast: any,
    podcastID: Types.ObjectId,
  ) {
    // REMOVE IMAGE BEFORE SAVED
    flag === 'update' && (await this.removeFiles(podcastID));

    // UPLOAD NEW IMAGE
    const image: any = await this.uploadFiles(imagePodcast, podcastID);
    return image.Location;
  }

  // UPLOAD BUCKET
  async uploadFiles(file: any, podcastID: Types.ObjectId) {
    const createParams = {
      filepath: 'podcast',
      filetype:
        file[0].filetype === 'pdf' ? 'pdf' : ImageCompression.defaultFormat,
      base64: file[0].img,
      fileID: podcastID.toString(),
    };
    return await this.azureBlobStorageService.upload(createParams);
  }

  // REMOVE BUCKET
  async removeFiles(podcastID: Types.ObjectId) {
    const removeObject = [];
    const podcastQuery = this.podcastModel.findById(podcastID);
    if (!podcastQuery || typeof podcastQuery.select !== 'function') {
      return;
    }
    const podcast = await podcastQuery.select('cover').lean();
    if (!podcast) {
      return;
    }

    if (podcast.cover) {
      removeObject.push({
        Key: `${ASContainerName}${podcast.cover.split(ASContainerName)[1]}`,
      });
    }
    if (podcast.coverImageDetail) {
      removeObject.push({
        Key: `${ASContainerName}${podcast.coverImageDetail?.image?.split(ASContainerName)?.[1]}`,
      });
    }

    return await this.azureBlobStorageService.remove(removeObject);
  }
}
