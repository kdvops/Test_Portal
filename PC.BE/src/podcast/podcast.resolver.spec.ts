import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PodcastResolver } from './podcast.resolver';
import { PodcastService } from './podcast.service';
import { Podcast } from './schema/podcast.schema';
import { StatusItem } from 'src/common/enums/status.enums';

describe('PodcastResolver', () => {
  let resolver: PodcastResolver;
  let service: jest.Mocked<PodcastService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<PodcastService> = {
      updatePodcastEpisode: jest.fn(),
      createPodcastEpisode: jest.fn(),
      clonePodcastEpisode: jest.fn(),
      changePodcastEpisodeStatus: jest.fn(),
      removePodcastEpisode: jest.fn(),
      episodePodcastGroupBySeason: jest.fn(),
      findEpisodePodcastBySeason: jest.fn(),
      findEpisodePodcastById: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PodcastResolver,
        { provide: PodcastService, useValue: serviceMock },
        { provide: getModelToken(Podcast.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<PodcastResolver>(PodcastResolver);
    service = module.get(PodcastService) as jest.Mocked<PodcastService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: 'Title',
      description: 'Description',
      season: new Types.ObjectId().toString(),
      slug: 'slug',
      status: StatusItem.draft,
      disabled: false,
      cover: null,
      coverImageDetail: null,
      link: 'https://example.com',
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      episodeID: new Types.ObjectId(),
      newCoverPodcast: [],
      episode: {
        title: 'Title',
        season: new Types.ObjectId().toString(),
        link: 'https://example.com',
        description: 'Description',
        slug: 'slug',
        cover: null,
        coverImageDetail: null,
        status: StatusItem.draft,
        disabled: false,
      },
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removePodcast', async () => {
      expect(() => resolver.removePodcast('not-an-id')).toThrow(
        'Invalid episodeID',
      );
      expect(service.removePodcastEpisode).not.toHaveBeenCalled();
    });

    it('rejects clonePodcast', async () => {
      expect(() => resolver.clonePodcast('not-an-id')).toThrow(
        'Invalid episodeID',
      );
      expect(service.clonePodcastEpisode).not.toHaveBeenCalled();
    });

    it('rejects publishPodcast', () => {
      expect(() => resolver.publishPodcast('not-an-id')).toThrow(
        'Invalid episodeID',
      );
      expect(service.changePodcastEpisodeStatus).not.toHaveBeenCalled();
    });

    it('rejects draftPodcast', () => {
      expect(() => resolver.draftPodcast('not-an-id')).toThrow(
        'Invalid episodeID',
      );
      expect(service.changePodcastEpisodeStatus).not.toHaveBeenCalled();
    });

    it('rejects findEpisodePodcastById', () => {
      expect(() => resolver.findEpisodePodcastById('not-an-id')).toThrow(
        'Invalid episodeID',
      );
      expect(service.findEpisodePodcastById).not.toHaveBeenCalled();
    });
  });

  describe('createPodcastEpisode', () => {
    it('delegates with valid payload', async () => {
      service.createPodcastEpisode.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createPodcastEpisode(makeCreateDto());

      expect(service.createPodcastEpisode).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createPodcastEpisode(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPodcastEpisode).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createPodcastEpisode(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPodcastEpisode).not.toHaveBeenCalled();
    });
  });

  describe('updatePodcastEpisode', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updatePodcastEpisode.mockResolvedValueOnce({
        _id: dto.episodeID,
      } as any);

      await resolver.updatePodcastEpisode(dto);

      expect(service.updatePodcastEpisode).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updatePodcastEpisode(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updatePodcastEpisode).not.toHaveBeenCalled();
    });

    it('rejects extra episode fields', async () => {
      const dto = makeUpdateDto({
        episode: { ...makeUpdateDto().episode, extra: 'bad' },
      });

      await expect(resolver.updatePodcastEpisode(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePodcastEpisode).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        episode: { ...makeUpdateDto().episode, status: 'available' },
      });

      await expect(resolver.updatePodcastEpisode(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePodcastEpisode).not.toHaveBeenCalled();
    });

    it('rejects missing slug', async () => {
      const dto = makeUpdateDto({
        episode: { ...makeUpdateDto().episode, slug: null },
      });

      await expect(resolver.updatePodcastEpisode(dto)).rejects.toThrow(
        new BadRequestException('episode.slug is required'),
      );
      expect(service.updatePodcastEpisode).not.toHaveBeenCalled();
    });
  });

  describe('episodePodcastGroupBySeason', () => {
    it('delegates with findAll flag', async () => {
      service.episodePodcastGroupBySeason.mockResolvedValueOnce([]);

      await resolver.episodePodcastGroupBySeason(true);

      expect(service.episodePodcastGroupBySeason).toHaveBeenCalledWith(true);
    });
  });

  describe('findEpisodePodcastBySeason', () => {
    it('delegates with season and findAll', async () => {
      service.findEpisodePodcastBySeason.mockResolvedValueOnce([]);

      await resolver.findEpisodePodcastBySeason('season', true);

      expect(service.findEpisodePodcastBySeason).toHaveBeenCalledWith(
        'season',
        true,
      );
    });
  });

  describe('findUniqueEpisodeSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueEpisodeSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
