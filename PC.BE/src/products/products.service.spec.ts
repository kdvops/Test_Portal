import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ProductsService } from './products.service';
import { Products } from './schema/products.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { SectionsService } from '../sections/sections.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
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
    status: StatusItem.draft,
    name: 'Name',
    description: 'Description',
    slug: 'slug',
    category: makeObjectId().toString(),
    banner: [],
    thumbnail: [],
    responsive: [],
    bannerImageDetail: null,
    thumbnailImageDetail: null,
    responsiveImageDetail: null,
    link: '',
    disabled: false,
    sections: [makeSectionInput()],
  }) as any;

const makeBaseUpdateDto = () =>
  ({
    productID: makeObjectId(),
    product: {
      status: StatusItem.draft,
      name: 'Name',
      description: 'Description',
      slug: 'slug',
      category: makeObjectId().toString(),
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
  }) as any;

describe('ProductsService', () => {
  let service: ProductsService;
  let productModel: any;
  let sectionsService: jest.Mocked<SectionsService>;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    productModel = {
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
        ProductsService,
        { provide: getModelToken(Products.name), useValue: productModel },
        { provide: AzureBlobStorageService, useValue: azureService },
        { provide: SectionsService, useValue: sectionsMock },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    sectionsService = module.get(
      SectionsService,
    ) as jest.Mocked<SectionsService>;

    jest.clearAllMocks();
  });

  describe('createProducts', () => {
    it('creates a product with sections and image details', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'banner' })
        .mockResolvedValueOnce({ image: 'thumbnail' })
        .mockResolvedValueOnce({ image: 'responsive' });
      productModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createProducts(dto);

      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
      const payload = productModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.banner).toBeNull();
      expect(payload.bannerImageDetail).toEqual({ image: 'banner' });
    });

    it('handles empty sections', async () => {
      const dto = { ...makeBaseCreateDto(), sections: [] };
      productModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createProducts(dto);

      expect(sectionsService.createSections).not.toHaveBeenCalled();
      const payload = productModel.create.mock.calls[0][0];
      expect(payload.sections).toEqual([]);
    });
  });

  describe('updateProduct', () => {
    it('updates sections and removes missing ones', async () => {
      const dto = makeBaseUpdateDto();
      const existingSections = [
        { _id: makeObjectId() },
        { _id: makeObjectId() },
      ];
      dto.product.sections = [
        { _id: existingSections[0]._id, ...makeSectionInput() },
        makeSectionInput({ _id: undefined }),
      ];
      productModel.findById.mockReturnValueOnce(
        makeQueryMock({ sections: existingSections }),
      );
      productModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.productID,
      });

      await service.updateProduct(dto);

      expect(sectionsService.removeSections).toHaveBeenCalledWith(
        existingSections[1],
      );
      expect(sectionsService.updateSections).toHaveBeenCalledTimes(1);
      expect(sectionsService.createSections).toHaveBeenCalledTimes(1);
    });
  });

  describe('cloneProduct', () => {
    it('clones images and sections into a draft copy', async () => {
      const productID = makeObjectId();
      const existingProduct = {
        _id: productID,
        name: 'Original',
        banner: 'banner.png',
        responsive: 'responsive.png',
        thumbnail: 'thumbnail.png',
        bannerImageDetail: { image: 'b.png' },
        responsiveImageDetail: { image: 'r.png' },
        thumbnailImageDetail: { image: 't.png' },
        category: { _id: makeObjectId() },
        sections: [{ _id: makeObjectId() }],
      };
      jest
        .spyOn(service, 'findProductById')
        .mockResolvedValueOnce(existingProduct as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      productModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneProduct(productID);

      expect(sectionsService.cloneSections).toHaveBeenCalledTimes(1);
      const payload = productModel.create.mock.calls[0][0];
      expect(payload.name).toBe('Original (copia)');
      expect(payload.status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findProductById', () => {
    it('throws when product is missing', async () => {
      productModel.findOne.mockReturnValueOnce(makeQueryMock(null));

      await expect(service.findProductById('missing')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('returns a product by id', async () => {
      const productID = makeObjectId();
      productModel.findOne.mockReturnValueOnce(
        makeQueryMock({ _id: productID }),
      );

      await expect(
        service.findProductById(productID.toString()),
      ).resolves.toEqual({ _id: productID });
    });

    it('returns a product by slug', async () => {
      productModel.findOne.mockReturnValueOnce(makeQueryMock({ slug: 'slug' }));

      await expect(service.findProductById('slug')).resolves.toEqual({
        slug: 'slug',
      });
    });
  });

  describe('findProductsByParentTargetCategory', () => {
    it('aggregates products by parent target', async () => {
      productModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findProductsByParentTargetCategory(
        'categoryGlobal' as any,
        false,
      );

      expect(productModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findProductsByCategory', () => {
    it('returns by category', async () => {
      productModel.find.mockReturnValueOnce(makeQueryMock([]));

      await service.findProductsByCategory('category', false);

      expect(productModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('changeProductStatus', () => {
    it('updates status field', async () => {
      const productID = makeObjectId();
      productModel.findOneAndUpdate.mockResolvedValueOnce({ _id: productID });

      await service.changeProductStatus(productID, 'publish');

      expect(productModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: productID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeProduct', () => {
    it('soft deletes product', async () => {
      const productID = makeObjectId();
      productModel.findOneAndUpdate.mockResolvedValueOnce({ _id: productID });

      await service.removeProduct(productID);

      const payload = productModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('removeFiles', () => {
    it('removes image detail when present', async () => {
      const productID = makeObjectId();
      const imageUrl = `${ASContainerName}products/banner.png`;
      productModel.findById.mockReturnValueOnce(
        makeQueryMock({ bannerImageDetail: { image: imageUrl } }),
      );

      await service.removeFiles(productID, 'bannerImageDetail');

      expect(azureService.remove).toHaveBeenCalledWith([{ Key: imageUrl }]);
    });

    it('skips removal when missing file', async () => {
      const productID = makeObjectId();
      productModel.findById.mockReturnValueOnce(makeQueryMock({}));

      await service.removeFiles(productID, 'bannerImageDetail');

      expect(azureService.remove).not.toHaveBeenCalled();
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });
});
