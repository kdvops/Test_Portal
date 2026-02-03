import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { BusinessService } from './business.service';
import { Business } from './schema/business.schema';
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
    link: '',
    excerpt: 'Excerpt',
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
    businessID: makeObjectId(),
    business: {
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

describe('BusinessService', () => {
  let service: BusinessService;
  let businessModel: any;
  let sectionsService: jest.Mocked<SectionsService>;

  beforeEach(async () => {
    businessModel = {
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
        BusinessService,
        { provide: getModelToken(Business.name), useValue: businessModel },
        { provide: AzureBlobStorageService, useValue: azureMock },
        { provide: SectionsService, useValue: sectionsMock },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createBusiness', () => {
    it('creates a business with sections and image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'thumbnail' })
        .mockResolvedValueOnce({ image: 'responsive' });
      businessModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createBusiness(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = businessModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
    });

    it('handles empty sections', async () => {
      const dto = { ...makeBaseCreateDto(), sections: [] };
      businessModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createBusiness(dto);

      expect(sectionsService.createSections).not.toHaveBeenCalled();
      const payload = businessModel.create.mock.calls[0][0];
      expect(payload.sections).toEqual([]);
    });
  });

  describe('updateBusiness', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeBaseUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.business.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      businessModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      businessModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.businessID,
      });

      await service.updateBusiness(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloneBusiness', () => {
    it('clones images and sections into a draft copy', async () => {
      const businessID = makeObjectId();
      const existingBusiness = {
        _id: businessID,
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
        .spyOn(service, 'findBusinessById')
        .mockResolvedValueOnce(existingBusiness as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      businessModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneBusiness(businessID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = businessModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findBusinessById', () => {
    it('throws when business is missing', async () => {
      const businessID = makeObjectId();
      businessModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findBusinessById(businessID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns a business', async () => {
      const businessID = makeObjectId();
      businessModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: businessID }),
      );

      await expect(service.findBusinessById(businessID)).resolves.toEqual({
        _id: businessID,
      });
    });
  });

  describe('findBusinessGroupByType', () => {
    it('aggregates businesses by category', async () => {
      businessModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findBusinessGroupByType(false);

      expect(businessModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findBusiness', () => {
    it('builds a search pipeline', async () => {
      businessModel.aggregate.mockResolvedValueOnce([]);

      await service.findBusiness({ search: 'title', category: 'cat' });

      expect(businessModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findBusinessByCategory', () => {
    it('returns by category', async () => {
      businessModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findBusinessByCategory('category', false);

      expect(businessModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('changeBusinessStatus', () => {
    it('updates status field', async () => {
      const businessID = makeObjectId();
      businessModel.findOneAndUpdate.mockResolvedValueOnce({ _id: businessID });

      await service.changeBusinessStatus(businessID, 'publish');

      expect(businessModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: businessID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeBusiness', () => {
    it('soft deletes business', async () => {
      const businessID = makeObjectId();
      businessModel.findOneAndUpdate.mockResolvedValueOnce({ _id: businessID });

      await service.removeBusiness(businessID);

      const payload = businessModel.findOneAndUpdate.mock.calls[0][1];
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
