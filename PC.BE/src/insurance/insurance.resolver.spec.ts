import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { InsuranceResolver } from './insurance.resolver';
import { InsuranceService } from './insurance.service';
import { SlugInsuranceInterceptor } from './interceptor/insurance.slug.interceptor';
import { Insurance } from './schema/insurance.schema';

describe('InsuranceResolver', () => {
  let resolver: InsuranceResolver;
  let service: jest.Mocked<InsuranceService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<InsuranceService> = {
      updateInsurance: jest.fn(),
      createInsurance: jest.fn(),
      cloneInsurance: jest.fn(),
      changeInsuranceStatus: jest.fn(),
      removeInsurance: jest.fn(),
      findInsuranceByCategory: jest.fn(),
      findInsurance: jest.fn(),
      findInsuranceGroupByType: jest.fn(),
      findInsuranceById: jest.fn(),
      findInsuranceBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InsuranceResolver,
        { provide: InsuranceService, useValue: serviceMock },
        { provide: getModelToken(Insurance.name), useValue: {} },
        {
          provide: SlugInsuranceInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<InsuranceResolver>(InsuranceResolver);
    service = module.get(InsuranceService) as jest.Mocked<InsuranceService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: 'Title',
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
      status: 'draft',
      disabled: false,
      sections: [],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      insuranceID: new Types.ObjectId(),
      insurance: {
        title: 'Title',
        excerpt: 'Excerpt',
        subtitle: 'Subtitle',
        slug: 'slug',
        link: '',
        description: 'Description',
        category: new Types.ObjectId().toString(),
        banner: null,
        thumbnail: null,
        responsive: null,
        bannerImageDetail: null,
        thumbnailImageDetail: null,
        responsiveImageDetail: null,
        status: 'draft',
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
    it('rejects removeInsurance', async () => {
      await expect(resolver.removeInsurance('not-an-id')).rejects.toThrow(
        'Invalid insuranceID',
      );
      expect(service.removeInsurance).not.toHaveBeenCalled();
    });

    it('rejects cloneInsurance', async () => {
      await expect(resolver.cloneInsurance('not-an-id')).rejects.toThrow(
        'Invalid insuranceID',
      );
      expect(service.cloneInsurance).not.toHaveBeenCalled();
    });

    it('rejects publishInsurance', () => {
      expect(() => resolver.publishInsurance('not-an-id')).toThrow(
        'Invalid insuranceID',
      );
      expect(service.changeInsuranceStatus).not.toHaveBeenCalled();
    });

    it('rejects draftInsurance', () => {
      expect(() => resolver.draftInsurance('not-an-id')).toThrow(
        'Invalid insuranceID',
      );
      expect(service.changeInsuranceStatus).not.toHaveBeenCalled();
    });

    it('rejects findInsuranceById', () => {
      expect(() => resolver.findInsuranceById('not-an-id')).toThrow(
        'Invalid insuranceID',
      );
      expect(service.findInsuranceById).not.toHaveBeenCalled();
    });
  });

  describe('createInsurance', () => {
    it('delegates with valid payload', async () => {
      service.createInsurance.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createInsurance(makeCreateDto());

      expect(service.createInsurance).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createInsurance(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createInsurance).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createInsurance(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createInsurance).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createInsurance(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createInsurance).not.toHaveBeenCalled();
    });
  });

  describe('updateInsurance', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateInsurance.mockResolvedValueOnce({
        _id: dto.insuranceID,
      } as any);

      await resolver.updateInsurance(dto);

      expect(service.updateInsurance).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateInsurance(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateInsurance).not.toHaveBeenCalled();
    });

    it('rejects extra insurance fields', async () => {
      const dto = makeUpdateDto({
        insurance: { ...makeUpdateDto().insurance, extra: 'bad' },
      });

      await expect(resolver.updateInsurance(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateInsurance).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        insurance: { ...makeUpdateDto().insurance, status: 'available' },
      });

      await expect(resolver.updateInsurance(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateInsurance).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      const dto = makeUpdateDto({
        insurance: { ...makeUpdateDto().insurance, sections: null },
      });

      await expect(resolver.updateInsurance(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateInsurance).not.toHaveBeenCalled();
    });
  });

  describe('findInsurance', () => {
    it('rejects missing args', async () => {
      await expect(resolver.findInsurance(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findInsurance).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findInsurance(makeArgs({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.findInsurance).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findInsurance.mockResolvedValueOnce([]);

      await resolver.findInsurance(args);

      expect(service.findInsurance).toHaveBeenCalledWith(args);
    });
  });

  describe('findInsuranceByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findInsuranceByCategory.mockResolvedValueOnce([]);

      await resolver.findInsuranceByCategory('category', true);

      expect(service.findInsuranceByCategory).toHaveBeenCalledWith(
        'category',
        true,
      );
    });
  });

  describe('findInsuranceGroupByType', () => {
    it('delegates with findAll flag', async () => {
      service.findInsuranceGroupByType.mockResolvedValueOnce([]);

      await resolver.findInsuranceGroupByType(true);

      expect(service.findInsuranceGroupByType).toHaveBeenCalledWith(true);
    });
  });

  describe('findUniqueInsuranceSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueInsuranceSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
