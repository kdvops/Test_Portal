import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { CategoriesService } from './categories.service';
import { Categories } from './schema/categories.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { cloneFiles } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';
import { TargetCategories } from 'src/common/enums/target.enum';

jest.mock('src/common/utils/fileHandler', () => ({
  cloneFiles: jest.fn(),
}));

jest.mock('src/common/utils/slugBuilder', () => ({
  getUniqueExistingSlug: jest.fn(),
  getUniqueSlug: jest.fn(),
}));

const mockCloneFiles = cloneFiles as jest.Mock;
const mockGetUniqueSlug = getUniqueSlug as jest.Mock;
const mockGetUniqueExistingSlug = getUniqueExistingSlug as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeLeanQueryMock = <T = any>(value: T) => ({
  lean: jest.fn().mockResolvedValue(value),
});

const makeExecQueryMock = <T = any>(value: T) => ({
  exec: jest.fn().mockResolvedValue(value),
});

const makeBasePictures = () => ({
  banner: '',
  responsive: '',
  thumbnail: '',
  bannerImageDetail: null,
  responsiveImageDetail: null,
  thumbnailImageDetail: null,
});

const makeCreateDto = (overrides: Record<string, any> = {}) =>
  ({
    status: StatusItem.draft,
    name: 'Category',
    excerpt: 'Excerpt',
    description: 'Description',
    slug: 'slug',
    parentID: null,
    parentTarget: null,
    target: TargetCategories.categoryBusiness,
    targetID: null,
    tags: [],
    pictures: makeBasePictures(),
    disabled: false,
    relatedCategories: [],
    relatedTargets: [],
    slugHistory: [],
    ...overrides,
  }) as any;

const makeUpdateDto = (overrides: Record<string, any> = {}) =>
  ({
    _id: makeObjectId(),
    status: StatusItem.draft,
    name: 'Category',
    excerpt: 'Excerpt',
    description: 'Description',
    slug: 'slug',
    tags: [],
    target: TargetCategories.categoryBusiness,
    targetID: null,
    parentID: null,
    parentTarget: null,
    pictures: makeBasePictures(),
    disabled: false,
    ...overrides,
  }) as any;

describe('CategoriesService', () => {
  let service: CategoriesService;
  let categoryModel: any;

  beforeEach(async () => {
    categoryModel = {
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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        { provide: getModelToken(Categories.name), useValue: categoryModel },
        { provide: AzureBlobStorageService, useValue: azureMock },
      ],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    jest.clearAllMocks();
  });

  describe('createCategories', () => {
    it('creates a category with picture details', async () => {
      const dto = makeCreateDto();
      jest
        .spyOn(service, 'getImageDetail')
        .mockResolvedValueOnce({ image: 'banner' } as any)
        .mockResolvedValueOnce({ image: 'responsive' } as any)
        .mockResolvedValueOnce({ image: 'thumbnail' } as any);
      categoryModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createCategories(dto);

      const payload = categoryModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.pictures.bannerImageDetail).toEqual({ image: 'banner' });
    });
  });

  describe('updateCategories', () => {
    it('updates category images and data', async () => {
      const dto = makeUpdateDto();
      jest
        .spyOn(service, 'getImageDetail')
        .mockResolvedValueOnce({ image: 'banner' } as any)
        .mockResolvedValueOnce({ image: 'responsive' } as any)
        .mockResolvedValueOnce({ image: 'thumbnail' } as any);
      categoryModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto._id,
      });

      await service.updateCategories(dto);

      expect(categoryModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      const payload = categoryModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.pictures.bannerImageDetail).toEqual({ image: 'banner' });
    });
  });

  describe('cloneCategories', () => {
    it('clones images and creates a draft copy', async () => {
      const categoryID = makeObjectId();
      const existingCategory = {
        _id: categoryID,
        name: 'Original',
        pictures: {
          banner: 'banner.png',
          responsive: 'responsive.png',
          thumbnail: 'thumbnail.png',
          bannerImageDetail: { image: 'b.png' },
          responsiveImageDetail: { image: 'r.png' },
          thumbnailImageDetail: { image: 't.png' },
        },
      };
      jest
        .spyOn(service, 'findCategoryById')
        .mockResolvedValueOnce(existingCategory as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      categoryModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneCategories(categoryID);

      const payload = categoryModel.create.mock.calls[0][0];
      expect(payload.name).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findCategoryById', () => {
    it('returns a category with subcategories', async () => {
      const categoryID = makeObjectId();
      categoryModel.findById.mockReturnValueOnce(
        makeLeanQueryMock({
          _id: categoryID,
          target: TargetCategories.categoryBusiness,
          parentID: null,
        }),
      );
      categoryModel.find.mockReturnValueOnce(
        makeLeanQueryMock([{ _id: makeObjectId(), parentID: categoryID }]),
      );

      const result = await service.findCategoryById(categoryID);

      expect(result.subcategories).toHaveLength(1);
      expect(result.parentID).toBeNull();
    });
  });

  describe('findCategoryBySlug', () => {
    it('returns a category by slug', async () => {
      const categoryID = makeObjectId();
      categoryModel.findOne.mockReturnValueOnce(
        makeLeanQueryMock({
          _id: categoryID,
          target: TargetCategories.categoryBusiness,
          parentID: null,
        }),
      );
      categoryModel.find.mockReturnValueOnce(
        makeExecQueryMock([{ _id: makeObjectId(), parentID: categoryID }]),
      );

      const result = await service.findCategoryBySlug('slug');

      expect(result.subcategories).toHaveLength(1);
      expect(result.parentID).toBeNull();
    });
  });

  describe('findCategoriesByTarget', () => {
    it('aggregates nested categories', async () => {
      categoryModel.aggregate.mockReturnValueOnce(makeExecQueryMock([]));

      await service.findCategoriesByTarget(TargetCategories.categoryBusiness);

      expect(categoryModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findCategoriesByTargetId', () => {
    it('aggregates categories by targetID', async () => {
      categoryModel.aggregate.mockReturnValueOnce(makeExecQueryMock([]));

      await service.findCategoriesByTargetId(makeObjectId().toString());

      expect(categoryModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findCategoryByParentAndTarget', () => {
    it('aggregates by parent and target', async () => {
      categoryModel.aggregate.mockReturnValueOnce(makeExecQueryMock([]));

      await service.findCategoryByParentAndTarget({
        target: TargetCategories.categoryBusiness,
      } as any);

      expect(categoryModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findCategoriesByParents', () => {
    it('groups by parent target', async () => {
      categoryModel.aggregate.mockReturnValueOnce(makeExecQueryMock([]));

      await service.findCategoriesByParents(TargetCategories.categoryBusiness);

      expect(categoryModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('changeCategoryStatus', () => {
    it('updates status', async () => {
      const categoryID = makeObjectId();
      categoryModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: categoryID,
      });

      await service.changeCategoryStatus(categoryID, 'publish');

      expect(categoryModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: categoryID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeCategories', () => {
    it('soft deletes category', async () => {
      const categoryID = makeObjectId();
      categoryModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: categoryID,
      });

      await service.removeCategories(categoryID);

      const payload = categoryModel.findOneAndUpdate.mock.calls[0][1];
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
