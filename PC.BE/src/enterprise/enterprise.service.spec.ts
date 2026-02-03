import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { EnterpriseService } from './enterprise.service';
import { Enterprise } from './schema/enterprise.schema';
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
    enterpriseID: makeObjectId(),
    enterprise: {
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

describe('EnterpriseService', () => {
  let service: EnterpriseService;
  let enterpriseModel: any;
  let sectionsService: jest.Mocked<SectionsService>;

  beforeEach(async () => {
    enterpriseModel = {
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
        EnterpriseService,
        { provide: getModelToken(Enterprise.name), useValue: enterpriseModel },
        { provide: AzureBlobStorageService, useValue: azureMock },
        { provide: SectionsService, useValue: sectionsMock },
      ],
    }).compile();

    service = module.get<EnterpriseService>(EnterpriseService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createEnterprise', () => {
    it('creates an enterprise with sections and image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'thumbnail' })
        .mockResolvedValueOnce({ image: 'responsive' });
      enterpriseModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createEnterprise(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = enterpriseModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
    });

    it('handles empty sections', async () => {
      const dto = { ...makeBaseCreateDto(), sections: [] };
      enterpriseModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createEnterprise(dto);

      expect(sectionsService.createSections).not.toHaveBeenCalled();
      const payload = enterpriseModel.create.mock.calls[0][0];
      expect(payload.sections).toEqual([]);
    });
  });

  describe('updateEnterprise', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeBaseUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.enterprise.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      enterpriseModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      enterpriseModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.enterpriseID,
      });

      await service.updateEnterprise(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloneEnterprise', () => {
    it('clones images and sections into a draft copy', async () => {
      const enterpriseID = makeObjectId();
      const existingEnterprise = {
        _id: enterpriseID,
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
        .spyOn(service, 'findEnterpriseById')
        .mockResolvedValueOnce(existingEnterprise as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      enterpriseModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneEnterprise(enterpriseID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = enterpriseModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findEnterpriseById', () => {
    it('throws when enterprise is missing', async () => {
      const enterpriseID = makeObjectId();
      enterpriseModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findEnterpriseById(enterpriseID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns an enterprise', async () => {
      const enterpriseID = makeObjectId();
      enterpriseModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: enterpriseID }),
      );

      await expect(service.findEnterpriseById(enterpriseID)).resolves.toEqual({
        _id: enterpriseID,
      });
    });
  });

  describe('findEnterpriseGroupByType', () => {
    it('aggregates enterprise by category', async () => {
      enterpriseModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findEnterpriseGroupByType(false);

      expect(enterpriseModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findEnterprise', () => {
    it('builds a search pipeline', async () => {
      enterpriseModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findEnterprise({ search: 'title', category: 'cat' });

      expect(enterpriseModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findEnterpriseByCategory', () => {
    it('returns by category', async () => {
      enterpriseModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findEnterpriseByCategory('category', false);

      expect(enterpriseModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('changeEnterpriseStatus', () => {
    it('updates status field', async () => {
      const enterpriseID = makeObjectId();
      enterpriseModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: enterpriseID,
      });

      await service.changeEnterpriseStatus(enterpriseID, 'publish');

      expect(enterpriseModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: enterpriseID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeEnterprise', () => {
    it('soft deletes enterprise', async () => {
      const enterpriseID = makeObjectId();
      enterpriseModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: enterpriseID,
      });

      await service.removeEnterprise(enterpriseID);

      const payload = enterpriseModel.findOneAndUpdate.mock.calls[0][1];
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
