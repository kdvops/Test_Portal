import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { InsuranceService } from './insurance.service';
import { Insurance } from './schema/insurance.schema';
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
    insuranceID: makeObjectId(),
    insurance: {
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

describe('InsuranceService', () => {
  let service: InsuranceService;
  let insuranceModel: any;
  let sectionsService: jest.Mocked<SectionsService>;

  beforeEach(async () => {
    insuranceModel = {
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
        InsuranceService,
        { provide: getModelToken(Insurance.name), useValue: insuranceModel },
        { provide: AzureBlobStorageService, useValue: azureMock },
        { provide: SectionsService, useValue: sectionsMock },
      ],
    }).compile();

    service = module.get<InsuranceService>(InsuranceService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createInsurance', () => {
    it('creates insurance with sections and image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'thumbnail' })
        .mockResolvedValueOnce({ image: 'responsive' });
      insuranceModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createInsurance(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = insuranceModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
    });

    it('handles empty sections', async () => {
      const dto = { ...makeBaseCreateDto(), sections: [] };
      insuranceModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createInsurance(dto);

      expect(sectionsService.createSections).not.toHaveBeenCalled();
      const payload = insuranceModel.create.mock.calls[0][0];
      expect(payload.sections).toEqual([]);
    });
  });

  describe('updateInsurance', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeBaseUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.insurance.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      insuranceModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      insuranceModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.insuranceID,
      });

      await service.updateInsurance(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloneInsurance', () => {
    it('clones images and sections into a draft copy', async () => {
      const insuranceID = makeObjectId();
      const existingInsurance = {
        _id: insuranceID,
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
        .spyOn(service, 'findInsuranceById')
        .mockResolvedValueOnce(existingInsurance as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      insuranceModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneInsurance(insuranceID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = insuranceModel.create.mock.calls[0][0];
      expect(payload.title).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findInsuranceById', () => {
    it('throws when insurance is missing', async () => {
      const insuranceID = makeObjectId();
      insuranceModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findInsuranceById(insuranceID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns an insurance', async () => {
      const insuranceID = makeObjectId();
      insuranceModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: insuranceID }),
      );

      await expect(service.findInsuranceById(insuranceID)).resolves.toEqual({
        _id: insuranceID,
      });
    });
  });

  describe('findInsuranceGroupByType', () => {
    it('aggregates insurance by category', async () => {
      insuranceModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findInsuranceGroupByType(false);

      expect(insuranceModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findInsurance', () => {
    it('builds a search pipeline', async () => {
      insuranceModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findInsurance({ search: 'title', category: 'cat' });

      expect(insuranceModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findInsuranceByCategory', () => {
    it('returns by category', async () => {
      insuranceModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findInsuranceByCategory('category', false);

      expect(insuranceModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('changeInsuranceStatus', () => {
    it('updates status field', async () => {
      const insuranceID = makeObjectId();
      insuranceModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: insuranceID,
      });

      await service.changeInsuranceStatus(insuranceID, 'publish');

      expect(insuranceModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: insuranceID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeInsurance', () => {
    it('soft deletes insurance', async () => {
      const insuranceID = makeObjectId();
      insuranceModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: insuranceID,
      });

      await service.removeInsurance(insuranceID);

      const payload = insuranceModel.findOneAndUpdate.mock.calls[0][1];
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
