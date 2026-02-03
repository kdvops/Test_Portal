import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { GraphQLEnumType } from 'graphql';

import { FinanciallyResolver } from './financially.resolver';
import { FinanciallyService } from './financially.service';
import { SlugFinanciallyInterceptor } from './interceptor/financially.slug.interceptor';
import { Financially } from './schema/financially.schema';
import { TypePostFinancially } from 'src/common/enums/financially.enum';

describe('FinanciallyResolver', () => {
  let resolver: FinanciallyResolver;
  let service: jest.Mocked<FinanciallyService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<FinanciallyService> = {
      updateFinancially: jest.fn(),
      cloneFinancially: jest.fn(),
      changeFinanciallyStatus: jest.fn(),
      createFinancially: jest.fn(),
      removeFinancially: jest.fn(),
      toggleFinanciallyPin: jest.fn(),
      findFinancially: jest.fn(),
      findFinanciallyPaginated: jest.fn(),
      getFinanciallyRelated: jest.fn(),
      getFinanciallyRecent: jest.fn(),
      findFinanciallyGroupByType: jest.fn(),
      findFinanciallyById: jest.fn(),
      findFinanciallyBySlug: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanciallyResolver,
        { provide: FinanciallyService, useValue: serviceMock },
        { provide: getModelToken(Financially.name), useValue: {} },
        {
          provide: SlugFinanciallyInterceptor,
          useValue: { intercept: jest.fn() },
        },
      ],
    }).compile();

    resolver = module.get<FinanciallyResolver>(FinanciallyResolver);
    service = module.get(FinanciallyService) as jest.Mocked<FinanciallyService>;
  });

  const makeValidArgs = () =>
    ({ type: '', search: '', page: 1, itemsPerPage: 5 }) as any;

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      title: 'Title',
      slug: 'slug',
      subtitle: 'Subtitle',
      excerpt: 'Excerpt',
      description: 'Desc',
      type: 'post::article',
      sections: [],
      authors: [],
      file: [],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      financiallyID: new Types.ObjectId(),
      financially: {
        title: 'Title',
        slug: 'slug',
        excerpt: 'Excerpt',
        subtitle: 'Subtitle',
        description: 'Desc',
        type: 'post::article',
        file: '',
        sections: [],
        authors: [],
      },
      newUploadFile: [],
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeFinancially', async () => {
      await expect(resolver.removeFinancially('not-an-id')).rejects.toThrow(
        'Invalid financiallyID',
      );
      expect(service.removeFinancially).not.toHaveBeenCalled();
    });

    it('rejects findFinanciallyById', () => {
      expect(() => resolver.findFinanciallyById('not-an-id')).toThrow(
        'Invalid financiallyID',
      );
      expect(service.findFinanciallyById).not.toHaveBeenCalled();
    });

    it('rejects getFinanciallyRelated', async () => {
      await expect(resolver.getFinanciallyRelated('not-an-id')).rejects.toThrow(
        'Invalid financiallyID',
      );
      expect(service.getFinanciallyRelated).not.toHaveBeenCalled();
    });
  });

  describe('createFinancially', () => {
    it('normalizes missing arrays', async () => {
      service.createFinancially.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createFinancially(
        makeCreateDto({
          file: undefined,
          sections: undefined,
          authors: undefined,
        }),
      );

      const payload = service.createFinancially.mock.calls[0][0] as any;
      expect(payload.sections).toEqual([]);
      expect(payload.authors).toEqual([]);
      expect(payload.file).toEqual([]);
    });

    it('delegates with normalized payload', async () => {
      service.createFinancially.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);
      const dto = makeCreateDto();

      await resolver.createFinancially(dto);

      expect(service.createFinancially).toHaveBeenCalledWith(
        expect.objectContaining(dto),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createFinancially(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createFinancially).not.toHaveBeenCalled();
    });

    it('rejects null sections (should be a validation error)', async () => {
      await expect(
        resolver.createFinancially(makeCreateDto({ sections: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createFinancially).not.toHaveBeenCalled();
    });

    it('accepts null authors', async () => {
      service.createFinancially.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createFinancially(makeCreateDto({ authors: null }));

      const payload = service.createFinancially.mock.calls[0][0] as any;
      expect(payload.authors).toEqual([]);
    });

    it('rejects invalid type enum', async () => {
      await expect(
        resolver.createFinancially(makeCreateDto({ type: 'draft' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createFinancially).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createFinancially(makeCreateDto({ status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createFinancially).not.toHaveBeenCalled();
    });
  });

  describe('updateFinancially', () => {
    it('rejects extra fields', async () => {
      const dto = makeUpdateDto({
        financially: { ...makeUpdateDto().financially, extraField: 'bad' },
      });

      await expect(resolver.updateFinancially(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateFinancially).not.toHaveBeenCalled();
    });

    it('rejects null sections (should be a validation error)', async () => {
      const dto = makeUpdateDto({
        financially: { ...makeUpdateDto().financially, sections: null },
      });

      await expect(resolver.updateFinancially(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateFinancially).not.toHaveBeenCalled();
    });

    it('accepts null authors', async () => {
      const dto = makeUpdateDto({
        financially: { ...makeUpdateDto().financially, authors: null },
      });
      service.updateFinancially.mockResolvedValueOnce({
        _id: dto.financiallyID,
      } as any);

      await resolver.updateFinancially(dto);

      const payload = service.updateFinancially.mock.calls[0][0] as any;
      expect(payload.financially.authors).toEqual([]);
    });

    it('rejects invalid type enum', async () => {
      const dto = makeUpdateDto({
        financially: { ...makeUpdateDto().financially, type: 'draft' },
      });

      await expect(resolver.updateFinancially(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateFinancially).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        financially: { ...makeUpdateDto().financially, status: 'available' },
      });

      await expect(resolver.updateFinancially(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateFinancially).not.toHaveBeenCalled();
    });
  });

  describe('findFinancially', () => {
    it('rejects unknown filter fields', async () => {
      const args = { ...makeValidArgs(), extraField: 'bad' } as any;

      await expect(resolver.findFinancially(args, false)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findFinancially).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      service.findFinancially.mockResolvedValueOnce([]);
      const args = makeValidArgs();

      await resolver.findFinancially(args, true);

      expect(service.findFinancially).toHaveBeenCalledWith(args, true);
    });

    it('rejects missing args (should be a validation error)', async () => {
      await expect(
        resolver.findFinancially(undefined as any, true),
      ).rejects.toThrow(BadRequestException);
      expect(service.findFinancially).not.toHaveBeenCalled();
    });
  });

  describe('findFinanciallyGroupByType', () => {
    it('surfaces invalid enum values in results', async () => {
      service.findFinanciallyGroupByType.mockResolvedValueOnce([
        {
          type: 'draft',
          posts: [{ _id: new Types.ObjectId(), type: 'draft' }],
        },
      ] as any);

      const result = await resolver.findFinanciallyGroupByType();
      const typeEnum = new GraphQLEnumType({
        name: 'TypePostFinancially',
        values: Object.fromEntries(
          Object.entries(TypePostFinancially).map(([key, value]) => [
            key,
            { value },
          ]),
        ),
      });

      expect(() => typeEnum.serialize(result[0].type)).toThrow(
        'cannot represent value',
      );
    });
  });

  describe('getFinanciallyPaginated', () => {
    it('rejects unknown filter fields', async () => {
      const args = { ...makeValidArgs(), extraField: 'bad' } as any;

      await expect(
        resolver.getFinanciallyPaginated(args, false),
      ).rejects.toThrow(BadRequestException);
      expect(service.findFinanciallyPaginated).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      service.findFinanciallyPaginated.mockResolvedValueOnce({
        items: [],
        totalItems: 0,
        itemsPerPage: 5,
        currentPage: 1,
      } as any);
      const args = makeValidArgs();

      await resolver.getFinanciallyPaginated(args, false);

      expect(service.findFinanciallyPaginated).toHaveBeenCalledWith(
        args,
        false,
      );
    });

    it('rejects missing args (should be a validation error)', async () => {
      await expect(
        resolver.getFinanciallyPaginated(undefined as any, false),
      ).rejects.toThrow(BadRequestException);
      expect(service.findFinanciallyPaginated).not.toHaveBeenCalled();
    });
  });
});
