import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { RegulatoryResolver } from './regulatory.resolver';
import { RegulatoryService } from './regulatory.service';
import { SlugRegulatoryInterceptor } from './interceptor/regulatory.slug.interceptor';
import { Regulatory } from './schema/regulatory.schema';
import { StatusItem } from 'src/common/enums/status.enums';

describe('RegulatoryResolver', () => {
  let resolver: RegulatoryResolver;
  let service: jest.Mocked<RegulatoryService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<RegulatoryService> = {
      updateRegulatory: jest.fn(),
      createRegulatory: jest.fn(),
      cloneRegulatory: jest.fn(),
      changeRegulatoryStatus: jest.fn(),
      removeRegulatory: jest.fn(),
      findRegulatoryByCategory: jest.fn(),
      findRegulatory: jest.fn(),
      findRegulatoryGroupByType: jest.fn(),
      findRegulatoryById: jest.fn(),
      findRegulatoryBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegulatoryResolver,
        { provide: RegulatoryService, useValue: serviceMock },
        { provide: getModelToken(Regulatory.name), useValue: {} },
        {
          provide: SlugRegulatoryInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<RegulatoryResolver>(RegulatoryResolver);
    service = module.get(RegulatoryService) as jest.Mocked<RegulatoryService>;
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
      title: 'Title',
      slug: 'slug',
      subtitle: 'Subtitle',
      link: '',
      excerpt: 'Excerpt',
      description: 'Description',
      category: new Types.ObjectId().toString(),
      banner: [],
      thumbnail: [],
      responsive: [],
      bannerImageDetail: null,
      thumbnailImageDetail: null,
      responsiveImageDetail: null,
      status: StatusItem.draft,
      disabled: false,
      sections: [makeSectionInput()],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      regulatoryID: new Types.ObjectId(),
      regulatory: {
        title: 'Title',
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
        status: StatusItem.draft,
        disabled: false,
        sections: [makeSectionInput()],
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
    it('rejects removeRegulatory', async () => {
      await expect(resolver.removeRegulatory('not-an-id')).rejects.toThrow(
        'Invalid regulatoryID',
      );
      expect(service.removeRegulatory).not.toHaveBeenCalled();
    });

    it('rejects cloneRegulatory', async () => {
      await expect(resolver.cloneRegulatory('not-an-id')).rejects.toThrow(
        'Invalid regulatoryID',
      );
      expect(service.cloneRegulatory).not.toHaveBeenCalled();
    });

    it('rejects publishRegulatory', () => {
      expect(() => resolver.publishRegulatory('not-an-id')).toThrow(
        'Invalid regulatoryID',
      );
      expect(service.changeRegulatoryStatus).not.toHaveBeenCalled();
    });

    it('rejects draftRegulatory', () => {
      expect(() => resolver.draftRegulatory('not-an-id')).toThrow(
        'Invalid regulatoryID',
      );
      expect(service.changeRegulatoryStatus).not.toHaveBeenCalled();
    });

    it('rejects findRegulatoryById', () => {
      expect(() => resolver.findRegulatoryById('not-an-id')).toThrow(
        'Invalid regulatoryID',
      );
      expect(service.findRegulatoryById).not.toHaveBeenCalled();
    });
  });

  describe('createRegulatory', () => {
    it('normalizes missing sections', async () => {
      service.createRegulatory.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createRegulatory(makeCreateDto({ sections: undefined }));

      expect(service.createRegulatory).toHaveBeenCalledWith(
        expect.objectContaining({ sections: [] }),
      );
    });

    it('delegates with valid payload', async () => {
      service.createRegulatory.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createRegulatory(makeCreateDto());

      expect(service.createRegulatory).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createRegulatory(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createRegulatory).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createRegulatory(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createRegulatory).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createRegulatory(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createRegulatory).not.toHaveBeenCalled();
    });
  });

  describe('updateRegulatory', () => {
    it('normalizes missing sections', async () => {
      const dto = makeUpdateDto({
        regulatory: { ...makeUpdateDto().regulatory, sections: undefined },
      });
      service.updateRegulatory.mockResolvedValueOnce({
        _id: dto.regulatoryID,
      } as any);

      await resolver.updateRegulatory(dto);

      expect(service.updateRegulatory).toHaveBeenCalledWith(
        expect.objectContaining({
          regulatory: expect.objectContaining({ sections: [] }),
        }),
      );
    });

    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateRegulatory.mockResolvedValueOnce({
        _id: dto.regulatoryID,
      } as any);

      await resolver.updateRegulatory(dto);

      expect(service.updateRegulatory).toHaveBeenCalledWith(dto);
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updateRegulatory(makeUpdateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateRegulatory).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.updateRegulatory(
          makeUpdateDto({
            regulatory: { ...makeUpdateDto().regulatory, status: 'available' },
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateRegulatory).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.updateRegulatory(
          makeUpdateDto({
            regulatory: { ...makeUpdateDto().regulatory, sections: null },
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateRegulatory).not.toHaveBeenCalled();
    });
  });

  describe('findRegulatory', () => {
    it('rejects missing args', async () => {
      await expect(
        resolver.findRegulatory(undefined as any),
      ).rejects.toThrow(BadRequestException);
      expect(service.findRegulatory).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findRegulatory(makeArgs({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.findRegulatory).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      service.findRegulatory.mockResolvedValueOnce([]);

      await resolver.findRegulatory(makeArgs());

      expect(service.findRegulatory).toHaveBeenCalledWith(makeArgs());
    });
  });
});
