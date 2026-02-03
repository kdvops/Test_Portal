import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ProuserResolver } from './prouser.resolver';
import { ProuserService } from './prouser.service';
import { SlugProuserInterceptor } from './interceptor/prouser.slug.interceptor';
import { Prouser } from './schema/prouser.schema';
import { StatusItem } from 'src/common/enums/status.enums';

describe('ProuserResolver', () => {
  let resolver: ProuserResolver;
  let service: jest.Mocked<ProuserService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<ProuserService> = {
      updateProuser: jest.fn(),
      createProuser: jest.fn(),
      cloneProuser: jest.fn(),
      changeProuserStatus: jest.fn(),
      removeProuser: jest.fn(),
      findProuserByCategory: jest.fn(),
      findProuserValidationDocument: jest.fn(),
      findProuser: jest.fn(),
      findProuserGroupByType: jest.fn(),
      findProuserById: jest.fn(),
      findProuserBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProuserResolver,
        { provide: ProuserService, useValue: serviceMock },
        { provide: getModelToken(Prouser.name), useValue: {} },
        {
          provide: SlugProuserInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<ProuserResolver>(ProuserResolver);
    service = module.get(ProuserService) as jest.Mocked<ProuserService>;
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
      subtitle: 'Subtitle',
      link: '',
      slug: 'slug',
      excerpt: 'Excerpt',
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
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      prouserID: new Types.ObjectId(),
      prouser: {
        title: 'Title',
        excerpt: 'Excerpt',
        slug: 'slug',
        subtitle: 'Subtitle',
        link: '',
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
    it('rejects removeProuser', async () => {
      await expect(resolver.removeProuser('not-an-id')).rejects.toThrow(
        'Invalid prouserID',
      );
      expect(service.removeProuser).not.toHaveBeenCalled();
    });

    it('rejects cloneProuser', async () => {
      await expect(resolver.cloneProuser('not-an-id')).rejects.toThrow(
        'Invalid prouserID',
      );
      expect(service.cloneProuser).not.toHaveBeenCalled();
    });

    it('rejects publishProuser', () => {
      expect(() => resolver.publishProuser('not-an-id')).toThrow(
        'Invalid prouserID',
      );
      expect(service.changeProuserStatus).not.toHaveBeenCalled();
    });

    it('rejects draftProuser', () => {
      expect(() => resolver.draftProuser('not-an-id')).toThrow(
        'Invalid prouserID',
      );
      expect(service.changeProuserStatus).not.toHaveBeenCalled();
    });

    it('rejects findProuserById', () => {
      expect(() => resolver.findProuserById('not-an-id')).toThrow(
        'Invalid prouserID',
      );
      expect(service.findProuserById).not.toHaveBeenCalled();
    });
  });

  describe('createProuser', () => {
    it('normalizes missing sections', async () => {
      service.createProuser.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createProuser(makeCreateDto({ sections: undefined }));

      expect(service.createProuser).toHaveBeenCalledWith(
        expect.objectContaining({ sections: [] }),
      );
    });

    it('delegates with valid payload', async () => {
      service.createProuser.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createProuser(makeCreateDto());

      expect(service.createProuser).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Title' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createProuser(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createProuser).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createProuser(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createProuser).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      await expect(
        resolver.createProuser(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createProuser).not.toHaveBeenCalled();
    });
  });

  describe('updateProuser', () => {
    it('normalizes missing sections', async () => {
      const dto = makeUpdateDto({
        prouser: { ...makeUpdateDto().prouser, sections: undefined },
      });
      service.updateProuser.mockResolvedValueOnce({
        _id: dto.prouserID,
      } as any);

      await resolver.updateProuser(dto);

      expect(service.updateProuser).toHaveBeenCalledWith(
        expect.objectContaining({
          prouser: expect.objectContaining({ sections: [] }),
        }),
      );
    });

    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateProuser.mockResolvedValueOnce({ _id: dto.prouserID } as any);

      await resolver.updateProuser(dto);

      expect(service.updateProuser).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateProuser(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateProuser).not.toHaveBeenCalled();
    });

    it('rejects extra prouser fields', async () => {
      const dto = makeUpdateDto({
        prouser: { ...makeUpdateDto().prouser, extra: 'bad' },
      });

      await expect(resolver.updateProuser(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateProuser).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        prouser: { ...makeUpdateDto().prouser, status: 'available' },
      });

      await expect(resolver.updateProuser(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateProuser).not.toHaveBeenCalled();
    });

    it('rejects null sections', async () => {
      const dto = makeUpdateDto({
        prouser: { ...makeUpdateDto().prouser, sections: null },
      });

      await expect(resolver.updateProuser(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateProuser).not.toHaveBeenCalled();
    });
  });

  describe('findProuser', () => {
    it('rejects missing args', async () => {
      await expect(resolver.findProuser(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findProuser).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findProuser(makeArgs({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.findProuser).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findProuser.mockResolvedValueOnce([]);

      await resolver.findProuser(args);

      expect(service.findProuser).toHaveBeenCalledWith(args);
    });
  });

  describe('findProuserByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findProuserByCategory.mockResolvedValueOnce([]);

      await resolver.findProuserByCategory('category', true);

      expect(service.findProuserByCategory).toHaveBeenCalledWith(
        'category',
        true,
      );
    });
  });

  describe('findProuserGroupByType', () => {
    it('delegates with findAll flag', async () => {
      service.findProuserGroupByType.mockResolvedValueOnce([]);

      await resolver.findProuserGroupByType(true);

      expect(service.findProuserGroupByType).toHaveBeenCalledWith(true);
    });
  });

  describe('findProuserValidationDocument', () => {
    it('delegates to service', async () => {
      service.findProuserValidationDocument.mockResolvedValueOnce({} as any);

      await resolver.findProuserValidationDocument('123');

      expect(service.findProuserValidationDocument).toHaveBeenCalledWith('123');
    });
  });

  describe('findProuserBySlug', () => {
    it('delegates to service', async () => {
      service.findProuserBySlug.mockResolvedValueOnce({} as any);

      await resolver.findProuserBySlug('slug');

      expect(service.findProuserBySlug).toHaveBeenCalledWith('slug');
    });
  });

  describe('findUniqueProuserSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueProuserSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
