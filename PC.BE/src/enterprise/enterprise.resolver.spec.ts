import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { EnterpriseResolver } from './enterprise.resolver';
import { EnterpriseService } from './enterprise.service';
import { SlugEnterpriseInterceptor } from './interceptor/enterprise.slug.interceptor';
import { Enterprise } from './schema/enterprise.schema';

describe('EnterpriseResolver', () => {
  let resolver: EnterpriseResolver;
  let service: jest.Mocked<EnterpriseService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<EnterpriseService> = {
      updateEnterprise: jest.fn(),
      createEnterprise: jest.fn(),
      cloneEnterprise: jest.fn(),
      changeEnterpriseStatus: jest.fn(),
      removeEnterprise: jest.fn(),
      findEnterpriseByCategory: jest.fn(),
      findEnterprise: jest.fn(),
      findEnterpriseGroupByType: jest.fn(),
      findEnterpriseById: jest.fn(),
      findEnterpriseBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EnterpriseResolver,
        { provide: EnterpriseService, useValue: serviceMock },
        { provide: getModelToken(Enterprise.name), useValue: {} },
        {
          provide: SlugEnterpriseInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<EnterpriseResolver>(EnterpriseResolver);
    service = module.get(EnterpriseService) as jest.Mocked<EnterpriseService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: 'Title',
      status: 'draft',
      subtitle: 'Subtitle',
      slug: 'slug',
      excerpt: 'Excerpt',
      link: '',
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
      enterpriseID: new Types.ObjectId(),
      enterprise: {
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
    it('rejects removeEnterprise', async () => {
      await expect(resolver.removeEnterprise('not-an-id')).rejects.toThrow(
        'Invalid enterpriseID',
      );
      expect(service.removeEnterprise).not.toHaveBeenCalled();
    });

    it('rejects cloneEnterprise', async () => {
      await expect(resolver.cloneEnterprise('not-an-id')).rejects.toThrow(
        'Invalid enterpriseID',
      );
      expect(service.cloneEnterprise).not.toHaveBeenCalled();
    });

    it('rejects publishEnterprise', () => {
      expect(() => resolver.publishEnterprise('not-an-id')).toThrow(
        'Invalid enterpriseID',
      );
      expect(service.changeEnterpriseStatus).not.toHaveBeenCalled();
    });

    it('rejects draftEnterprise', () => {
      expect(() => resolver.draftEnterprise('not-an-id')).toThrow(
        'Invalid enterpriseID',
      );
      expect(service.changeEnterpriseStatus).not.toHaveBeenCalled();
    });

    it('rejects findEnterpriseById', () => {
      expect(() => resolver.findEnterpriseById('not-an-id')).toThrow(
        'Invalid enterpriseID',
      );
      expect(service.findEnterpriseById).not.toHaveBeenCalled();
    });
  });

  describe('createEnterprise', () => {
    it('delegates with valid payload', async () => {
      service.createEnterprise.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createEnterprise(makeCreateDto());

      expect(service.createEnterprise).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createEnterprise(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createEnterprise).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createEnterprise(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createEnterprise).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createEnterprise(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createEnterprise).not.toHaveBeenCalled();
    });
  });

  describe('updateEnterprise', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateEnterprise.mockResolvedValueOnce({
        _id: dto.enterpriseID,
      } as any);

      await resolver.updateEnterprise(dto);

      expect(service.updateEnterprise).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateEnterprise(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateEnterprise).not.toHaveBeenCalled();
    });

    it('rejects extra enterprise fields', async () => {
      const dto = makeUpdateDto({
        enterprise: { ...makeUpdateDto().enterprise, extra: 'bad' },
      });

      await expect(resolver.updateEnterprise(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateEnterprise).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        enterprise: { ...makeUpdateDto().enterprise, status: 'available' },
      });

      await expect(resolver.updateEnterprise(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateEnterprise).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      const dto = makeUpdateDto({
        enterprise: { ...makeUpdateDto().enterprise, sections: null },
      });

      await expect(resolver.updateEnterprise(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateEnterprise).not.toHaveBeenCalled();
    });
  });

  describe('findEnterprise', () => {
    it('rejects missing args', async () => {
      await expect(resolver.findEnterprise(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findEnterprise).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findEnterprise(makeArgs({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.findEnterprise).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findEnterprise.mockResolvedValueOnce([]);

      await resolver.findEnterprise(args);

      expect(service.findEnterprise).toHaveBeenCalledWith(args);
    });
  });

  describe('findEnterpriseByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findEnterpriseByCategory.mockResolvedValueOnce([]);

      await resolver.findEnterpriseByCategory('category', true);

      expect(service.findEnterpriseByCategory).toHaveBeenCalledWith(
        'category',
        true,
      );
    });
  });

  describe('findEnterpriseGroupByType', () => {
    it('delegates with findAll flag', async () => {
      service.findEnterpriseGroupByType.mockResolvedValueOnce([]);

      await resolver.findEnterpriseGroupByType(true);

      expect(service.findEnterpriseGroupByType).toHaveBeenCalledWith(true);
    });
  });

  describe('findUniqueEnterpriseSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueEnterpriseSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
