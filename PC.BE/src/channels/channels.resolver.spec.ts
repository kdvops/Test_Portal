import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ChannelsResolver } from './channels.resolver';
import { ChannelsService } from './channels.service';
import { SlugChannelsInterceptor } from './interceptor/channels.slug.interceptor';
import { Channels } from './schema/channels.schema';

describe('ChannelsResolver', () => {
  let resolver: ChannelsResolver;
  let service: jest.Mocked<ChannelsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<ChannelsService> = {
      updateChannel: jest.fn(),
      createChannel: jest.fn(),
      cloneChannel: jest.fn(),
      changeChannelStatus: jest.fn(),
      removeChannel: jest.fn(),
      findChannelsByCategory: jest.fn(),
      findChannels: jest.fn(),
      findChannelsGroupByType: jest.fn(),
      findChannelsPost: jest.fn(),
      findChannelById: jest.fn(),
      findChannelsBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelsResolver,
        { provide: ChannelsService, useValue: serviceMock },
        { provide: getModelToken(Channels.name), useValue: {} },
        {
          provide: SlugChannelsInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<ChannelsResolver>(ChannelsResolver);
    service = module.get(ChannelsService) as jest.Mocked<ChannelsService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: 'Title',
      status: 'draft',
      subtitle: 'Subtitle',
      slug: 'slug',
      excerpt: 'Excerpt',
      link: '',
      description: 'Description',
      category: new Types.ObjectId().toString(),
      banner: null,
      thumbnail: null,
      responsive: null,
      bannerImageDetail: null,
      thumbnailImageDetail: null,
      responsiveImageDetail: null,
      disabled: false,
      sections: [],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      channelID: new Types.ObjectId(),
      channel: {
        title: 'Title',
        status: 'draft',
        slug: 'slug',
        excerpt: 'Excerpt',
        link: '',
        subtitle: 'Subtitle',
        description: 'Description',
        category: new Types.ObjectId().toString(),
        banner: null,
        thumbnail: null,
        responsive: null,
        bannerImageDetail: null,
        thumbnailImageDetail: null,
        responsiveImageDetail: null,
        disabled: false,
        sections: [],
      },
      newUploadBanner: [],
      newUploadThumbnail: [],
      newUploadResponsive: [],
      ...overrides,
    }) as any;

  const makeArgs = (overrides: Record<string, any> = {}) =>
    ({
      category: '',
      search: '',
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeChannel', async () => {
      await expect(resolver.removeChannel('not-an-id')).rejects.toThrow(
        'Invalid channelID',
      );
      expect(service.removeChannel).not.toHaveBeenCalled();
    });

    it('rejects cloneChannel', async () => {
      await expect(resolver.cloneChannel('not-an-id')).rejects.toThrow(
        'Invalid channelID',
      );
      expect(service.cloneChannel).not.toHaveBeenCalled();
    });

    it('rejects publishChannel', () => {
      expect(() => resolver.publishChannel('not-an-id')).toThrow(
        'Invalid channelID',
      );
      expect(service.changeChannelStatus).not.toHaveBeenCalled();
    });

    it('rejects draftChannel', () => {
      expect(() => resolver.draftChannel('not-an-id')).toThrow(
        'Invalid channelID',
      );
      expect(service.changeChannelStatus).not.toHaveBeenCalled();
    });

    it('rejects findChannelById', () => {
      expect(() => resolver.findChannelById('not-an-id')).toThrow(
        'Invalid channelID',
      );
      expect(service.findChannelById).not.toHaveBeenCalled();
    });
  });

  describe('createChannel', () => {
    it('delegates with valid payload', async () => {
      service.createChannel.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createChannel(makeCreateDto());

      expect(service.createChannel).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createChannel(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createChannel).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createChannel(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createChannel).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createChannel(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createChannel).not.toHaveBeenCalled();
    });
  });

  describe('updateChannel', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateChannel.mockResolvedValueOnce({ _id: dto.channelID } as any);

      await resolver.updateChannel(dto);

      expect(service.updateChannel).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateChannel(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateChannel).not.toHaveBeenCalled();
    });

    it('rejects extra channel fields', async () => {
      const dto = makeUpdateDto({
        channel: { ...makeUpdateDto().channel, extra: 'bad' },
      });

      await expect(resolver.updateChannel(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateChannel).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        channel: { ...makeUpdateDto().channel, status: 'available' },
      });

      await expect(resolver.updateChannel(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateChannel).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      const dto = makeUpdateDto({
        channel: { ...makeUpdateDto().channel, sections: null },
      });

      await expect(resolver.updateChannel(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateChannel).not.toHaveBeenCalled();
    });
  });

  describe('findChannels', () => {
    it('rejects missing args', async () => {
      await expect(resolver.findChannels(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findChannels).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findChannels(makeArgs({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.findChannels).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findChannels.mockResolvedValueOnce([]);

      await resolver.findChannels(args);

      expect(service.findChannels).toHaveBeenCalledWith(args);
    });
  });

  describe('findChannelsByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findChannelsByCategory.mockResolvedValueOnce([]);

      await resolver.findChannelsByCategory('category', true);

      expect(service.findChannelsByCategory).toHaveBeenCalledWith(
        'category',
        true,
      );
    });
  });

  describe('findChannelsGroupByType', () => {
    it('delegates with findAll flag', async () => {
      service.findChannelsGroupByType.mockResolvedValueOnce([]);

      await resolver.findChannelsGroupByType(true);

      expect(service.findChannelsGroupByType).toHaveBeenCalledWith(true);
    });
  });

  describe('findChannelsPost', () => {
    it('delegates with findAll flag', async () => {
      service.findChannelsPost.mockResolvedValueOnce([]);

      await resolver.findChannelsPost(true);

      expect(service.findChannelsPost).toHaveBeenCalledWith(true);
    });
  });

  describe('findUniqueChannelSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueChannelSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
