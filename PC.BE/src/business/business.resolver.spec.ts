import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { BusinessResolver } from './business.resolver';
import { BusinessService } from './business.service';
import { SlugBusinessInterceptor } from './interceptor/business.slug.interceptor';
import { Business } from './schema/business.schema';

describe('BusinessResolver', () => {
  let resolver: BusinessResolver;
  let service: jest.Mocked<BusinessService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<BusinessService> = {
      updateBusiness: jest.fn(),
      createBusiness: jest.fn(),
      cloneBusiness: jest.fn(),
      changeBusinessStatus: jest.fn(),
      removeBusiness: jest.fn(),
      findBusinessByCategory: jest.fn(),
      findBusiness: jest.fn(),
      findBusinessGroupByType: jest.fn(),
      findBusinessById: jest.fn(),
      findBusinessBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessResolver,
        { provide: BusinessService, useValue: serviceMock },
        { provide: getModelToken(Business.name), useValue: {} },
        {
          provide: SlugBusinessInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<BusinessResolver>(BusinessResolver);
    service = module.get(BusinessService) as jest.Mocked<BusinessService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: 'Title',
      status: 'draft',
      subtitle: 'Subtitle',
      slug: 'slug',
      link: '',
      excerpt: 'Excerpt',
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
      businessID: new Types.ObjectId(),
      business: {
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
    it('rejects removeBusiness', async () => {
      await expect(resolver.removeBusiness('not-an-id')).rejects.toThrow(
        'Invalid businessID',
      );
      expect(service.removeBusiness).not.toHaveBeenCalled();
    });

    it('rejects cloneBusiness', async () => {
      await expect(resolver.cloneBusiness('not-an-id')).rejects.toThrow(
        'Invalid businessID',
      );
      expect(service.cloneBusiness).not.toHaveBeenCalled();
    });

    it('rejects publishBusiness', () => {
      expect(() => resolver.publishBusiness('not-an-id')).toThrow(
        'Invalid businessID',
      );
      expect(service.changeBusinessStatus).not.toHaveBeenCalled();
    });

    it('rejects draftBusiness', () => {
      expect(() => resolver.draftBusiness('not-an-id')).toThrow(
        'Invalid businessID',
      );
      expect(service.changeBusinessStatus).not.toHaveBeenCalled();
    });

    it('rejects findBusinessById', () => {
      expect(() => resolver.findBusinessById('not-an-id')).toThrow(
        'Invalid businessID',
      );
      expect(service.findBusinessById).not.toHaveBeenCalled();
    });
  });

  describe('createBusiness', () => {
    it('delegates with valid payload', async () => {
      service.createBusiness.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createBusiness(makeCreateDto());

      expect(service.createBusiness).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createBusiness(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createBusiness).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createBusiness(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createBusiness).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createBusiness(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createBusiness).not.toHaveBeenCalled();
    });
  });

  describe('updateBusiness', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateBusiness.mockResolvedValueOnce({
        _id: dto.businessID,
      } as any);

      await resolver.updateBusiness(dto);

      expect(service.updateBusiness).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateBusiness(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateBusiness).not.toHaveBeenCalled();
    });

    it('rejects extra business fields', async () => {
      const dto = makeUpdateDto({
        business: { ...makeUpdateDto().business, extra: 'bad' },
      });

      await expect(resolver.updateBusiness(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateBusiness).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        business: { ...makeUpdateDto().business, status: 'available' },
      });

      await expect(resolver.updateBusiness(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateBusiness).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      const dto = makeUpdateDto({
        business: { ...makeUpdateDto().business, sections: null },
      });

      await expect(resolver.updateBusiness(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateBusiness).not.toHaveBeenCalled();
    });
  });

  describe('findBusiness', () => {
    it('rejects missing args', async () => {
      await expect(resolver.findBusiness(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findBusiness).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findBusiness(makeArgs({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.findBusiness).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findBusiness.mockResolvedValueOnce([]);

      await resolver.findBusiness(args);

      expect(service.findBusiness).toHaveBeenCalledWith(args);
    });
  });

  describe('findBusinessByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findBusinessByCategory.mockResolvedValueOnce([]);

      await resolver.findBusinessByCategory('category', true);

      expect(service.findBusinessByCategory).toHaveBeenCalledWith(
        'category',
        true,
      );
    });
  });

  describe('findBusinessGroupByType', () => {
    it('delegates with findAll flag', async () => {
      service.findBusinessGroupByType.mockResolvedValueOnce([]);

      await resolver.findBusinessGroupByType(true);

      expect(service.findBusinessGroupByType).toHaveBeenCalledWith(true);
    });
  });

  describe('findUniqueBusinessSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueBusinessSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
