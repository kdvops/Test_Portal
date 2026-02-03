import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ChannelsService } from './channels.service';
import { Channels } from './schema/channels.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';

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

const makeSectionInput = (overrides: Record<string, any> = {}) => ({
  name: 'Section',
  description: 'Desc',
  color: '',
  position: 1,
  type: 'sectionCards',
  cards: [],
  ...overrides,
});

const makeBaseCreateDto = () =>
  ({
    title: 'Title',
    status: StatusItem.draft,
    subtitle: 'Subtitle',
    slug: 'slug',
    excerpt: 'Excerpt',
    link: '',
    description: 'Description',
    category: makeObjectId().toString(),
    banner: null,
    thumbnail: null,
    responsive: null,
    bannerImageDetail: null,
    thumbnailImageDetail: null,
    responsiveImageDetail: null,
    disabled: false,
    sections: [makeSectionInput()],
  }) as any;

const makeBaseUpdateDto = () =>
  ({
    channelID: makeObjectId(),
    channel: {
      title: 'Title',
      status: StatusItem.draft,
      slug: 'slug',
      excerpt: 'Excerpt',
      link: '',
      subtitle: 'Subtitle',
      description: 'Description',
      category: makeObjectId().toString(),
      banner: null,
      thumbnail: null,
      responsive: null,
      bannerImageDetail: null,
      thumbnailImageDetail: null,
      responsiveImageDetail: null,
      disabled: false,
      sections: [makeSectionInput()],
    },
    newUploadBanner: [],
    newUploadThumbnail: [],
    newUploadResponsive: [],
  }) as any;

describe('ChannelsService', () => {
  let service: ChannelsService;
  let channelsModel: any;
  let sectionsService: jest.Mocked<SectionsService>;

  beforeEach(async () => {
    channelsModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    const azureMock: jest.Mocked<AzureBlobStorageService> = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const sectionsMock: jest.Mocked<SectionsService> = {
      createSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      updateSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      removeSections: jest.fn(),
      cloneSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChannelsService,
        { provide: getModelToken(Channels.name), useValue: channelsModel },
        { provide: AzureBlobStorageService, useValue: azureMock },
        { provide: SectionsService, useValue: sectionsMock },
      ],
    }).compile();

    service = module.get<ChannelsService>(ChannelsService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createChannel', () => {
    it('creates a channel with sections and image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'thumbnail' })
        .mockResolvedValueOnce({ image: 'responsive' });
      channelsModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createChannel(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = channelsModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
    });

    it('handles empty sections', async () => {
      const dto = { ...makeBaseCreateDto(), sections: [] };
      channelsModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createChannel(dto);

      expect(sectionsService.createSections).not.toHaveBeenCalled();
      const payload = channelsModel.create.mock.calls[0][0];
      expect(payload.sections).toEqual([]);
    });
  });

  describe('updateChannel', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeBaseUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.channel.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      channelsModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      channelsModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.channelID,
      });

      await service.updateChannel(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloneChannel', () => {
    it('clones images and sections into a draft copy', async () => {
      const channelID = makeObjectId();
      const existingChannel = {
        _id: channelID,
        title: 'Original',
        banner: 'banner.png',
        responsive: 'responsive.png',
        thumbnail: 'thumbnail.png',
        bannerImageDetail: { image: 'b.png' },
        responsiveImageDetail: { image: 'r.png' },
        thumbnailImageDetail: { image: 't.png' },
        sections: [{ _id: makeObjectId() }],
      };
      jest
        .spyOn(service, 'findChannelById')
        .mockResolvedValueOnce(existingChannel as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      channelsModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneChannel(channelID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = channelsModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findChannelById', () => {
    it('throws when channel is missing', async () => {
      const channelID = makeObjectId();
      channelsModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findChannelById(channelID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns a channel', async () => {
      const channelID = makeObjectId();
      channelsModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: channelID }),
      );

      await expect(service.findChannelById(channelID)).resolves.toEqual({
        _id: channelID,
      });
    });
  });

  describe('findChannelsGroupByType', () => {
    it('aggregates channels by category', async () => {
      channelsModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findChannelsGroupByType(false);

      expect(channelsModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findChannelsPost', () => {
    it('returns channels list', async () => {
      channelsModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findChannelsPost(false);

      expect(channelsModel.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('findChannels', () => {
    it('builds a search pipeline', async () => {
      channelsModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findChannels({ search: 'title', category: 'cat' });

      expect(channelsModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findChannelsByCategory', () => {
    it('returns by category', async () => {
      channelsModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findChannelsByCategory('category', false);

      expect(channelsModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('changeChannelStatus', () => {
    it('updates status field', async () => {
      const channelID = makeObjectId();
      channelsModel.findOneAndUpdate.mockResolvedValueOnce({ _id: channelID });

      await service.changeChannelStatus(channelID, 'publish');

      expect(channelsModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: channelID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeChannel', () => {
    it('soft deletes channel', async () => {
      const channelID = makeObjectId();
      channelsModel.findOneAndUpdate.mockResolvedValueOnce({ _id: channelID });

      await service.removeChannel(channelID);

      const payload = channelsModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });
});
