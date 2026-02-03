import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { CategoriesResolver } from './categories.resolver';
import { CategoriesService } from './categories.service';
import { SlugCategoriesInterceptor } from './interceptor/categories.slug.interceptor';
import { Categories } from './schema/categories.schema';
import {
  TargetCategories,
  TargetParentCategories,
} from 'src/common/enums/target.enum';

describe('CategoriesResolver', () => {
  let resolver: CategoriesResolver;
  let service: jest.Mocked<CategoriesService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<CategoriesService> = {
      updateCategories: jest.fn(),
      createCategories: jest.fn(),
      cloneCategories: jest.fn(),
      changeCategoryStatus: jest.fn(),
      removeCategories: jest.fn(),
      findCategoryById: jest.fn(),
      findUniqueSlug: jest.fn(),
      findCategoryBySlug: jest.fn(),
      findCategoriesByTarget: jest.fn(),
      findCategoriesByTargetId: jest.fn(),
      findCategoryByParentAndTarget: jest.fn(),
      findCategoriesByParents: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesResolver,
        { provide: CategoriesService, useValue: serviceMock },
        { provide: getModelToken(Categories.name), useValue: {} },
        {
          provide: SlugCategoriesInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<CategoriesResolver>(CategoriesResolver);
    service = module.get(CategoriesService) as jest.Mocked<CategoriesService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      status: 'draft',
      name: 'Category',
      excerpt: 'Excerpt',
      description: 'Description',
      slug: 'slug',
      parentID: null,
      parentTarget: null,
      target: TargetCategories.categoryBusiness,
      targetID: null,
      tags: [],
      pictures: {
        banner: '',
        responsive: '',
        thumbnail: '',
        bannerImageDetail: null,
        responsiveImageDetail: null,
        thumbnailImageDetail: null,
      },
      disabled: false,
      relatedCategories: [],
      relatedTargets: [],
      slugHistory: [],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      _id: new Types.ObjectId(),
      status: 'draft',
      name: 'Category',
      excerpt: 'Excerpt',
      description: 'Description',
      slug: 'slug',
      tags: [],
      target: TargetCategories.categoryBusiness,
      targetID: null,
      parentID: null,
      parentTarget: undefined,
      pictures: {
        banner: '',
        responsive: '',
        thumbnail: '',
        bannerImageDetail: null,
        responsiveImageDetail: null,
        thumbnailImageDetail: null,
      },
      disabled: false,
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeCategories', async () => {
      expect(() => resolver.removeCategories('not-an-id')).toThrow(
        'Invalid categoryID',
      );
      expect(service.removeCategories).not.toHaveBeenCalled();
    });

    it('rejects cloneCategories', () => {
      expect(() => resolver.cloneCategories('not-an-id')).toThrow(
        'Invalid categoryID',
      );
      expect(service.cloneCategories).not.toHaveBeenCalled();
    });

    it('rejects publishCategory', () => {
      expect(() => resolver.publishCategory('not-an-id')).toThrow(
        'Invalid categoryID',
      );
      expect(service.changeCategoryStatus).not.toHaveBeenCalled();
    });

    it('rejects draftCategory', () => {
      expect(() => resolver.draftCategory('not-an-id')).toThrow(
        'Invalid categoryID',
      );
      expect(service.changeCategoryStatus).not.toHaveBeenCalled();
    });

    it('rejects findCategoryById', () => {
      expect(() => resolver.findCategoryById('not-an-id')).toThrow(
        'Invalid categoryID',
      );
      expect(service.findCategoryById).not.toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    it('delegates with valid payload', async () => {
      service.createCategories.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createCategory(makeCreateDto());

      expect(service.createCategories).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Category' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createCategory(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createCategories).not.toHaveBeenCalled();
    });

    it('rejects missing target and targetID', async () => {
      await expect(
        resolver.createCategory(
          makeCreateDto({ target: null, targetID: null }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.createCategories).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createCategory(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createCategories).not.toHaveBeenCalled();
    });
  });

  describe('updateCategories', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateCategories.mockResolvedValueOnce({ _id: dto._id } as any);

      await resolver.updateCategories(dto);

      expect(service.updateCategories).toHaveBeenCalledWith(dto);
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updateCategories(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateCategories).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.updateCategories(makeUpdateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateCategories).not.toHaveBeenCalled();
    });

    it('rejects invalid parentTarget enum', async () => {
      await expect(
        resolver.updateCategories(makeUpdateDto({ parentTarget: 'invalid' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateCategories).not.toHaveBeenCalled();
    });
  });

  describe('findCategoryByTarget', () => {
    it('rejects invalid target enum', async () => {
      expect(() => resolver.findCategoryByTarget('invalid', false)).toThrow(
        BadRequestException,
      );
      expect(service.findCategoriesByTarget).not.toHaveBeenCalled();
    });

    it('delegates with valid target', async () => {
      service.findCategoriesByTarget.mockResolvedValueOnce([]);

      await resolver.findCategoryByTarget(
        TargetCategories.categoryBusiness,
        false,
      );

      expect(service.findCategoriesByTarget).toHaveBeenCalledWith(
        TargetCategories.categoryBusiness,
        false,
      );
    });
  });

  describe('findCategoriesByTargetId', () => {
    it('rejects invalid targetID', async () => {
      expect(() =>
        resolver.findCategoriesByTargetId('not-an-id', false),
      ).toThrow(BadRequestException);
      expect(service.findCategoriesByTargetId).not.toHaveBeenCalled();
    });

    it('delegates with valid targetID', async () => {
      const targetID = new Types.ObjectId().toString();
      service.findCategoriesByTargetId.mockResolvedValueOnce([]);

      await resolver.findCategoriesByTargetId(targetID, false);

      expect(service.findCategoriesByTargetId).toHaveBeenCalledWith(
        targetID,
        false,
      );
    });
  });

  describe('findCategoryByParentAndTarget', () => {
    it('rejects missing target', async () => {
      expect(() =>
        resolver.findCategoryByParentAndTarget({} as any, false),
      ).toThrow(BadRequestException);
      expect(service.findCategoryByParentAndTarget).not.toHaveBeenCalled();
    });

    it('rejects invalid enums', async () => {
      expect(() =>
        resolver.findCategoryByParentAndTarget(
          { target: 'invalid', parentTarget: 'invalid' } as any,
          false,
        ),
      ).toThrow(BadRequestException);
      expect(service.findCategoryByParentAndTarget).not.toHaveBeenCalled();
    });

    it('delegates with valid payload', async () => {
      service.findCategoryByParentAndTarget.mockResolvedValueOnce([]);

      await resolver.findCategoryByParentAndTarget(
        {
          target: TargetCategories.categoryBusiness,
          parentTarget: TargetParentCategories.categoryGlobal,
        },
        false,
      );

      expect(service.findCategoryByParentAndTarget).toHaveBeenCalledWith(
        {
          target: TargetCategories.categoryBusiness,
          parentTarget: TargetParentCategories.categoryGlobal,
        },
        false,
      );
    });
  });

  describe('findUniqueCategorySlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueCategorySlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
