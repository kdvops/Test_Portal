import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { GraphQLEnumType } from 'graphql';

import { AdjudicatedResolver } from './adjudicated.resolver';
import { AdjudicatedService } from './adjudicated.service';
import { TypeStatusAdjudicated } from 'src/common/enums/adjudicated.enum';

describe('AdjudicatedResolver', () => {
  let resolver: AdjudicatedResolver;
  let service: jest.Mocked<AdjudicatedService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<AdjudicatedService> = {
      updateAdjudicated: jest.fn(),
      cloneAdjudicated: jest.fn(),
      changeAdjudicatedStatus: jest.fn(),
      removeAdjudicated: jest.fn(),
      createAdjudicated: jest.fn(),
      findAdjudicatedProductsGroupByCategory: jest.fn(),
      findAdjudicated: jest.fn(),
      findAdjudicatedById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjudicatedResolver,
        { provide: AdjudicatedService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<AdjudicatedResolver>(AdjudicatedResolver);
    service = module.get(AdjudicatedService) as jest.Mocked<AdjudicatedService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      category: new Types.ObjectId().toString(),
      item_status: 'draft',
      status: 'available',
      name: 'Name',
      link: '',
      excerpt: 'Excerpt',
      description: 'Description',
      pictures: [
        {
          image: [{ img: 'base64', filetype: 'png' }],
          isCover: false,
        },
      ],
      picturesImageDetail: [{ image: 'data:image/png;base64,abc', altText: '' }],
      price: 1000,
      address: 'Address',
      province: 'Province',
      phone: '555-0000',
      disabled: false,
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      adjudicatedID: new Types.ObjectId(),
      adjudicated: {
        category: new Types.ObjectId().toString(),
        item_status: 'draft',
        status: 'available',
        name: 'Name',
        link: '',
        excerpt: 'Excerpt',
        description: 'Description',
        pictures: [],
        picturesImageDetail: [],
        price: 1000,
        address: 'Address',
        province: 'Province',
        phone: '555-0000',
        disabled: false,
      },
      ...overrides,
    }) as any;

  const makeArgs = (overrides: Record<string, any> = {}) =>
    ({
      search: '',
      category: '',
      province: '',
      priceMin: 10,
      priceMax: 100,
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeAdjudicated', async () => {
      await expect(resolver.removeAdjudicated('not-an-id')).rejects.toThrow(
        'Invalid adjudicatedID',
      );
      expect(service.removeAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects cloneAdjudicated', async () => {
      await expect(resolver.cloneAdjudicated('not-an-id')).rejects.toThrow(
        'Invalid adjudicatedID',
      );
      expect(service.cloneAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects publishAdjudicated', async () => {
      expect(() => resolver.publishAdjudicated('not-an-id')).toThrow(
        'Invalid adjudicatedID',
      );
      expect(service.changeAdjudicatedStatus).not.toHaveBeenCalled();
    });

    it('rejects draftAdjudicated', async () => {
      expect(() => resolver.draftAdjudicated('not-an-id')).toThrow(
        'Invalid adjudicatedID',
      );
      expect(service.changeAdjudicatedStatus).not.toHaveBeenCalled();
    });

    it('rejects findAdjudicatedById', () => {
      expect(() => resolver.findAdjudicatedById('not-an-id')).toThrow(
        'Invalid adjudicatedID',
      );
      expect(service.findAdjudicatedById).not.toHaveBeenCalled();
    });
  });

  describe('createAdjudicated', () => {
    it('delegates with valid payload', async () => {
      service.createAdjudicated.mockResolvedValueOnce({ _id: new Types.ObjectId() } as any);

      await resolver.createAdjudicated(makeCreateDto());

      expect(service.createAdjudicated).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'Name' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createAdjudicated(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects missing pictures array', async () => {
      await expect(
        resolver.createAdjudicated(makeCreateDto({ pictures: undefined })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects missing picturesImageDetail array', async () => {
      await expect(
        resolver.createAdjudicated(
          makeCreateDto({ picturesImageDetail: undefined }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.createAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      await expect(
        resolver.createAdjudicated(makeCreateDto({ status: 'draft' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects invalid item_status enum', async () => {
      await expect(
        resolver.createAdjudicated(makeCreateDto({ item_status: 'available' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createAdjudicated).not.toHaveBeenCalled();
    });
  });

  describe('updateAdjudicated', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateAdjudicated.mockResolvedValueOnce({ _id: dto.adjudicatedID } as any);

      await resolver.updateAdjudicated(dto);

      expect(service.updateAdjudicated).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateAdjudicated(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects extra adjudicated fields', async () => {
      const dto = makeUpdateDto({
        adjudicated: { ...makeUpdateDto().adjudicated, extra: 'bad' },
      });

      await expect(resolver.updateAdjudicated(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects missing pictures array', async () => {
      const dto = makeUpdateDto({
        adjudicated: { ...makeUpdateDto().adjudicated, pictures: undefined },
      });

      await expect(resolver.updateAdjudicated(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects missing picturesImageDetail array', async () => {
      const dto = makeUpdateDto({
        adjudicated: {
          ...makeUpdateDto().adjudicated,
          picturesImageDetail: undefined,
        },
      });

      await expect(resolver.updateAdjudicated(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        adjudicated: { ...makeUpdateDto().adjudicated, status: 'draft' },
      });

      await expect(resolver.updateAdjudicated(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects invalid item_status enum', async () => {
      const dto = makeUpdateDto({
        adjudicated: {
          ...makeUpdateDto().adjudicated,
          item_status: 'available',
        },
      });

      await expect(resolver.updateAdjudicated(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateAdjudicated).not.toHaveBeenCalled();
    });
  });

  describe('findAdjudicated', () => {
    it('rejects missing args', async () => {
      await expect(
        resolver.findAdjudicated(undefined as any),
      ).rejects.toThrow(BadRequestException);
      expect(service.findAdjudicated).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findAdjudicated(makeArgs({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.findAdjudicated).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findAdjudicated.mockResolvedValueOnce([]);

      await resolver.findAdjudicated(args);

      expect(service.findAdjudicated).toHaveBeenCalledWith(args);
    });
  });

  describe('findAdjudicatedProductsGroupByCategory', () => {
    it('delegates with explicit flag', async () => {
      service.findAdjudicatedProductsGroupByCategory.mockResolvedValueOnce([]);

      await resolver.findAdjudicatedProductsGroupByCategory(true);

      expect(service.findAdjudicatedProductsGroupByCategory).toHaveBeenCalledWith(
        true,
      );
    });

    it('surfaces invalid enum values in results', async () => {
      service.findAdjudicatedProductsGroupByCategory.mockResolvedValueOnce([
        {
          category: { _id: new Types.ObjectId(), name: 'Category' },
          products: [{ status: 'draft' }],
        },
      ] as any);

      const result = await resolver.findAdjudicatedProductsGroupByCategory(
        false,
      );
      const typeStatusEnum = new GraphQLEnumType({
        name: 'TypeStatusAdjudicated',
        values: Object.fromEntries(
          Object.entries(TypeStatusAdjudicated).map(([key, value]) => [
            key,
            { value },
          ]),
        ),
      });

      expect(() =>
        typeStatusEnum.serialize(result[0].products[0].status),
      ).toThrow('cannot represent value');
    });
  });
});
