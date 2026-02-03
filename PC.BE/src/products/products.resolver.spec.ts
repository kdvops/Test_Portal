import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ProductsResolver } from './products.resolver';
import { ProductsService } from './products.service';
import { SlugProductsInterceptor } from './interceptor/products.slug.interceptor';
import { Products } from './schema/products.schema';
import { StatusItem } from 'src/common/enums/status.enums';
import { TargetParentCategories } from 'src/common/enums/target.enum';

describe('ProductsResolver', () => {
  let resolver: ProductsResolver;
  let service: jest.Mocked<ProductsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<ProductsService> = {
      updateProduct: jest.fn(),
      createProducts: jest.fn(),
      findProductsByParentTargetCategory: jest.fn(),
      findProductsByCategory: jest.fn(),
      cloneProduct: jest.fn(),
      changeProductStatus: jest.fn(),
      removeProduct: jest.fn(),
      findProductById: jest.fn(),
      findProductBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
      findProductsByCategoryId: jest.fn(),
      findProductsByTargetId: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsResolver,
        { provide: ProductsService, useValue: serviceMock },
        { provide: getModelToken(Products.name), useValue: {} },
        {
          provide: SlugProductsInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<ProductsResolver>(ProductsResolver);
    service = module.get(ProductsService) as jest.Mocked<ProductsService>;
  });

  const makeSectionInput = (overrides: Record<string, any> = {}) => ({
    name: 'Section',
    description: 'Desc',
    color: '',
    position: 1,
    type: 'sectionCards',
    cards: [],
    ...overrides,
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      status: StatusItem.draft,
      name: 'Name',
      description: 'Description',
      slug: 'slug',
      category: new Types.ObjectId().toString(),
      banner: [],
      thumbnail: [],
      responsive: [],
      bannerImageDetail: null,
      thumbnailImageDetail: null,
      responsiveImageDetail: null,
      link: '',
      disabled: false,
      sections: [makeSectionInput()],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      productID: new Types.ObjectId(),
      product: {
        status: StatusItem.draft,
        name: 'Name',
        description: 'Description',
        slug: 'slug',
        category: new Types.ObjectId().toString(),
        banner: null,
        thumbnail: null,
        responsive: null,
        bannerImageDetail: null,
        thumbnailImageDetail: null,
        responsiveImageDetail: null,
        link: '',
        disabled: false,
        sections: [makeSectionInput()],
      },
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeProduct', () => {
      expect(() => resolver.removeProduct('not-an-id')).toThrow(
        'Invalid productID',
      );
      expect(service.removeProduct).not.toHaveBeenCalled();
    });

    it('rejects cloneProduct', () => {
      expect(() => resolver.cloneProduct('not-an-id')).toThrow(
        'Invalid productID',
      );
      expect(service.cloneProduct).not.toHaveBeenCalled();
    });

    it('rejects publishProduct', () => {
      expect(() => resolver.publishProduct('not-an-id')).toThrow(
        'Invalid productID',
      );
      expect(service.changeProductStatus).not.toHaveBeenCalled();
    });

    it('rejects draftProduct', () => {
      expect(() => resolver.draftProduct('not-an-id')).toThrow(
        'Invalid productID',
      );
      expect(service.changeProductStatus).not.toHaveBeenCalled();
    });
  });

  describe('createProduct', () => {
    it('normalizes missing sections', async () => {
      service.createProducts.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createProduct(makeCreateDto({ sections: undefined }));

      expect(service.createProducts).toHaveBeenCalledWith(
        expect.objectContaining({ sections: [] }),
      );
    });

    it('delegates with valid payload', async () => {
      service.createProducts.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createProduct(makeCreateDto());

      expect(service.createProducts).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Name' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createProduct(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createProducts).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createProduct(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createProducts).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createProduct(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createProducts).not.toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('normalizes missing sections', async () => {
      const dto = makeUpdateDto({
        product: { ...makeUpdateDto().product, sections: undefined },
      });
      service.updateProduct.mockResolvedValueOnce({ _id: dto.productID } as any);

      await resolver.updateProduct(dto);

      expect(service.updateProduct).toHaveBeenCalledWith(
        expect.objectContaining({
          product: expect.objectContaining({ sections: [] }),
        }),
      );
    });

    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateProduct.mockResolvedValueOnce({ _id: dto.productID } as any);

      await resolver.updateProduct(dto);

      expect(service.updateProduct).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateProduct(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateProduct).not.toHaveBeenCalled();
    });

    it('rejects extra product fields', async () => {
      const dto = makeUpdateDto({
        product: { ...makeUpdateDto().product, extra: 'bad' },
      });

      await expect(resolver.updateProduct(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateProduct).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        product: { ...makeUpdateDto().product, status: 'available' },
      });

      await expect(resolver.updateProduct(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateProduct).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      const dto = makeUpdateDto({
        product: { ...makeUpdateDto().product, sections: null },
      });

      await expect(resolver.updateProduct(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateProduct).not.toHaveBeenCalled();
    });
  });

  describe('findProductsByParentTargetCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findProductsByParentTargetCategory.mockResolvedValueOnce([]);

      await resolver.findProductsByParentTargetCategory(
        TargetParentCategories.categoryGlobal,
        true,
      );

      expect(service.findProductsByParentTargetCategory).toHaveBeenCalledWith(
        TargetParentCategories.categoryGlobal,
        true,
      );
    });
  });

  describe('findProductsByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findProductsByCategory.mockResolvedValueOnce([]);

      await resolver.findProductsByCategory('category', true);

      expect(service.findProductsByCategory).toHaveBeenCalledWith(
        'category',
        true,
      );
    });
  });

  describe('findProductById', () => {
    it('delegates to service', async () => {
      service.findProductById.mockResolvedValueOnce({} as any);

      await resolver.findProductById('slug-or-id');

      expect(service.findProductById).toHaveBeenCalledWith('slug-or-id');
    });
  });

  describe('findProductBySlug', () => {
    it('delegates to service', async () => {
      service.findProductBySlug.mockResolvedValueOnce({} as any);

      await resolver.findProductBySlug('slug');

      expect(service.findProductBySlug).toHaveBeenCalledWith('slug');
    });
  });

  describe('findUniqueProductSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueProductSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
