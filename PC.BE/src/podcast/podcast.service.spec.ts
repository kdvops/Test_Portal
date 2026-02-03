import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PodcastService } from './podcast.service';
import { Podcast } from './schema/podcast.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';
import { ASContainerName } from 'src/common/constants';

jest.mock('src/common/utils/fileHandler', () => ({
  getImageDetail: jest.fn(),
  cloneFiles: jest.fn(),
}));

jest.mock('src/common/utils/slugBuilder', () => ({
  getUniqueExistingSlug: jest.fn(),
  getUniqueSlug: jest.fn(),
}));

const mockGetImageDetail = getImageDetail as jest.Mock;
const mockCloneFiles = cloneFiles as jest.Mock;
const mockGetUniqueSlug = getUniqueSlug as jest.Mock;
const mockGetUniqueExistingSlug = getUniqueExistingSlug as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
    exec: jest.fn().mockResolvedValue(value),
  };
  return query;
};

const makeBaseCreateDto = () =>
  ({
    title: 'Title',
    description: 'Description',
    season: makeObjectId().toString(),
    slug: 'slug',
    status: StatusItem.draft,
    disabled: false,
    cover: null,
    coverImageDetail: null,
    link: 'https://example.com',
  }) as any;

const makeBaseUpdateDto = () =>
  ({
    episodeID: makeObjectId(),
    newCoverPodcast: [],
    episode: {
      title: 'Title',
      season: makeObjectId().toString(),
      link: 'https://example.com',
      description: 'Description',
      slug: 'slug',
      cover: null,
      coverImageDetail: null,
      status: StatusItem.draft,
      disabled: false,
    },
  }) as any;

describe('PodcastService', () => {
  let service: PodcastService;
  let podcastModel: any;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    podcastModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PodcastService,
        { provide: getModelToken(Podcast.name), useValue: podcastModel },
        { provide: AzureBlobStorageService, useValue: azureService },
      ],
    }).compile();

    service = module.get<PodcastService>(PodcastService);

    jest.clearAllMocks();
  });

  describe('createPodcastEpisode', () => {
    it('creates an episode with cover image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail.mockResolvedValueOnce({ image: 'cover' });
      podcastModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createPodcastEpisode(dto);

      const payload = podcastModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.cover).toBeNull();
      expect(payload.coverImageDetail).toEqual({ image: 'cover' });
    });
  });

  describe('updatePodcastEpisode', () => {
    it('updates episode and cover image detail', async () => {
      const dto = makeBaseUpdateDto();
      mockGetImageDetail.mockResolvedValueOnce({ image: 'cover' });
      podcastModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.episodeID,
      });

      await service.updatePodcastEpisode(dto);

      expect(podcastModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: dto.episodeID },
        expect.objectContaining({ $set: dto.episode }),
        { new: true },
      );
    });
  });

  describe('clonePodcastEpisode', () => {
    it('clones episode into a draft copy', async () => {
      const episodeID = makeObjectId();
      const existingEpisode = {
        _id: episodeID,
        title: 'Original',
        cover: 'cover.png',
        coverImageDetail: { image: 'c.png' },
      };
      jest
        .spyOn(service, 'findEpisodePodcastById')
        .mockResolvedValueOnce(existingEpisode as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      podcastModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.clonePodcastEpisode(episodeID);

      const payload = podcastModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('episodePodcastGroupBySeason', () => {
    it('aggregates episodes by season', async () => {
      podcastModel.aggregate.mockReturnValueOnce([]);

      await service.episodePodcastGroupBySeason(false);

      expect(podcastModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findEpisodePodcastBySeason', () => {
    it('returns episodes by season', async () => {
      podcastModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findEpisodePodcastBySeason('season', false);

      expect(podcastModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ season: 'season' }),
      );
    });
  });

  describe('findEpisodePodcastById', () => {
    it('returns an episode', async () => {
      const episodeID = makeObjectId();
      podcastModel.findById.mockResolvedValueOnce({ _id: episodeID });

      await expect(service.findEpisodePodcastById(episodeID)).resolves.toEqual({
        _id: episodeID,
      });
    });
  });

  describe('changePodcastEpisodeStatus', () => {
    it('updates status field', async () => {
      const episodeID = makeObjectId();
      podcastModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: episodeID,
      });

      await service.changePodcastEpisodeStatus(episodeID, 'publish');

      expect(podcastModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: episodeID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removePodcastEpisode', () => {
    it('soft deletes episode', async () => {
      const episodeID = makeObjectId();
      podcastModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: episodeID,
      });

      await service.removePodcastEpisode(episodeID);

      const payload = podcastModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });

    it('skips file removal when episode is missing', async () => {
      const episodeID = makeObjectId();
      podcastModel.findById.mockReturnValueOnce(undefined);
      podcastModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: episodeID,
      });

      await service.removePodcastEpisode(episodeID);

      expect(azureService.remove).not.toHaveBeenCalled();
      expect(podcastModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: episodeID },
        expect.any(Object),
        { new: true },
      );
    });

    it('removes cover and coverImageDetail when present', async () => {
      const episodeID = makeObjectId();
      const coverUrl = `${ASContainerName}podcast/cover.png`;
      const detailUrl = `${ASContainerName}podcast/detail.png`;
      podcastModel.findById.mockReturnValueOnce(
        makeQueryMock({
          cover: coverUrl,
          coverImageDetail: {
            image: detailUrl,
          },
        }),
      );
      podcastModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: episodeID,
      });

      await service.removePodcastEpisode(episodeID);

      expect(azureService.remove).toHaveBeenCalledWith([
        expect.objectContaining({ Key: coverUrl }),
        expect.objectContaining({ Key: detailUrl }),
      ]);
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });
});
