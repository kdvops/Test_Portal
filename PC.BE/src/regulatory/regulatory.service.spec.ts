import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { RegulatoryService } from './regulatory.service';
import { Regulatory } from './schema/regulatory.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import { getUniqueExistingSlug, getUniqueSlug } from 'src/common/utils/slugBuilder';
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
    slug: 'slug',
    subtitle: 'Subtitle',
    link: '',
    excerpt: 'Excerpt',
    description: 'Description',
    category: makeObjectId().toString(),
    banner: [],
    thumbnail: [],
    responsive: [],
    bannerImageDetail: null,
    thumbnailImageDetail: null,
    responsiveImageDetail: null,
    status: StatusItem.draft,
    disabled: false,
    sections: [makeSectionInput()],
  }) as any;

const makeBaseUpdateDto = () =>
  ({
    regulatoryID: makeObjectId(),
    regulatory: {
      title: 'Title',
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
      status: StatusItem.draft,
      disabled: false,
      sections: [makeSectionInput()],
    },
    newUploadBanner: [],
    newUploadThumbnail: [],
    newUploadResponsive: [],
  }) as any;

describe('RegulatoryService', () => {
  let service: RegulatoryService;
  let regulatoryModel: any;
  let sectionsService: jest.Mocked<SectionsService>;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    regulatoryModel = {
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

    const sectionsMock: jest.Mocked<SectionsService> = {
      createSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      updateSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
      removeSections: jest.fn(),
      cloneSections: jest.fn().mockResolvedValue({ _id: makeObjectId() }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegulatoryService,
        { provide: getModelToken(Regulatory.name), useValue: regulatoryModel },
        { provide: AzureBlobStorageService, useValue: azureService },
        { provide: SectionsService, useValue: sectionsMock },
      ],
    }).compile();

    service = module.get<RegulatoryService>(RegulatoryService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createRegulatory', () => {
    it('creates a regulatory entry with sections and image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'thumbnail' })
        .mockResolvedValueOnce({ image: 'responsive' });
      regulatoryModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createRegulatory(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = regulatoryModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
    });

    it('handles empty sections', async () => {
      const dto = { ...makeBaseCreateDto(), sections: [] };
      regulatoryModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createRegulatory(dto);

      expect(sectionsService.createSections).not.toHaveBeenCalled();
      const payload = regulatoryModel.create.mock.calls[0][0];
      expect(payload.sections).toEqual([]);
    });
  });

  describe('updateRegulatory', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeBaseUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.regulatory.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      regulatoryModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      regulatoryModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.regulatoryID,
      });

      await service.updateRegulatory(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloneRegulatory', () => {
    it('clones images and sections into a draft copy', async () => {
      const regulatoryID = makeObjectId();
      const existing = {
        _id: regulatoryID,
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
        .spyOn(service, 'findRegulatoryById')
        .mockResolvedValueOnce(existing as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      regulatoryModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneRegulatory(regulatoryID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = regulatoryModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findRegulatoryById', () => {
    it('throws when regulatory is missing', async () => {
      const regulatoryID = makeObjectId();
      regulatoryModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findRegulatoryById(regulatoryID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns a regulatory entry', async () => {
      const regulatoryID = makeObjectId();
      regulatoryModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: regulatoryID }),
      );

      await expect(service.findRegulatoryById(regulatoryID)).resolves.toEqual({
        _id: regulatoryID,
      });
    });
  });

  describe('findRegulatoryGroupByType', () => {
    it('aggregates regulatory entries by category', async () => {
      regulatoryModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findRegulatoryGroupByType(false);

      expect(regulatoryModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findRegulatory', () => {
    it('builds a search pipeline', async () => {
      regulatoryModel.aggregate.mockReturnValueOnce([]);

      await service.findRegulatory({ search: 'title', category: 'cat' } as any);

      expect(regulatoryModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findRegulatoryByCategory', () => {
    it('returns by category', async () => {
      regulatoryModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findRegulatoryByCategory('category', false);

      expect(regulatoryModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });

  describe('removeFiles', () => {
    it('skips removal when query is missing', async () => {
      const regulatoryID = makeObjectId();
      regulatoryModel.findById.mockReturnValueOnce(undefined);

      await service.removeFiles(regulatoryID, 'banner');

      expect(azureService.remove).not.toHaveBeenCalled();
    });

    it('removes image detail when present', async () => {
      const regulatoryID = makeObjectId();
      const detailUrl = `https://storage/${ASContainerName}detail.png`;
      regulatoryModel.findById.mockReturnValueOnce(
        makeQueryMock({ bannerImageDetail: { image: detailUrl } }),
      );

      await service.removeFiles(regulatoryID, 'bannerImageDetail');

      expect(azureService.remove).toHaveBeenCalledWith([
        expect.objectContaining({
          Key: expect.stringContaining('detail.png'),
        }),
      ]);
    });
  });
});
