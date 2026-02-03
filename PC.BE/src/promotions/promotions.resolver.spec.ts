import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PromotionsResolver } from './promotions.resolver';
import { PromotionsService } from './promotions.service';
import { Promotions } from './schema/promotions.schema';
import { StatusItem } from 'src/common/enums/status.enums';

describe('PromotionsResolver', () => {
  let resolver: PromotionsResolver;
  let service: jest.Mocked<PromotionsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<PromotionsService> = {
      updatePromotions: jest.fn(),
      createPromotions: jest.fn(),
      findPromotionsByMonth: jest.fn(),
      clonePromotion: jest.fn(),
      changePromotionStatus: jest.fn(),
      removePromotions: jest.fn(),
      removePromotion: jest.fn(),
      findPromotionById: jest.fn(),
      findPromotionsByDate: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsResolver,
        { provide: PromotionsService, useValue: serviceMock },
        { provide: getModelToken(Promotions.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<PromotionsResolver>(PromotionsResolver);
    service = module.get(PromotionsService) as jest.Mocked<PromotionsService>;
  });

  const makePromotion = (overrides: Record<string, any> = {}) => ({
    name: 'Name',
    status: StatusItem.draft,
    percent: '10',
    devolution: 'text',
    condition: 'text',
    extract: 'Extract',
    picture: [],
    pictureImageDetail: null,
    disabled: false,
    date: { start: new Date(), end: new Date() },
    ...overrides,
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      promotions: [makePromotion()],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      promotions: [
        { _id: new Types.ObjectId(), ...makePromotion(), picture: 'img' },
      ],
      ...overrides,
    }) as any;

  const makeSearchArgs = (overrides: Record<string, any> = {}) =>
    ({
      month: '2025-01',
      ...overrides,
    }) as any;

  const makeParamsByDate = (overrides: Record<string, any> = {}) =>
    ({
      search: '',
      start: '2025-01-01',
      end: '2025-01-31',
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removePromotion', () => {
      expect(() => resolver.removePromotion('not-an-id')).toThrow(
        'Invalid promotionID',
      );
      expect(service.removePromotion).not.toHaveBeenCalled();
    });

    it('rejects clonePromotion', () => {
      expect(() => resolver.clonePromotion('not-an-id')).toThrow(
        'Invalid promotionID',
      );
      expect(service.clonePromotion).not.toHaveBeenCalled();
    });

    it('rejects publishPromotion', () => {
      expect(() => resolver.publishPromotion('not-an-id')).toThrow(
        'Invalid promotionID',
      );
      expect(service.changePromotionStatus).not.toHaveBeenCalled();
    });

    it('rejects draftPromotion', () => {
      expect(() => resolver.draftPromotion('not-an-id')).toThrow(
        'Invalid promotionID',
      );
      expect(service.changePromotionStatus).not.toHaveBeenCalled();
    });

    it('rejects findPromotionById', () => {
      expect(() => resolver.findPromotionById('not-an-id')).toThrow(
        'Invalid promotionID',
      );
      expect(service.findPromotionById).not.toHaveBeenCalled();
    });
  });

  describe('createPromotion', () => {
    it('delegates with valid payload', async () => {
      service.createPromotions.mockResolvedValueOnce([]);

      await resolver.createPromotion(makeCreateDto());

      expect(service.createPromotions).toHaveBeenCalledWith(
        expect.objectContaining({ promotions: expect.any(Array) }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createPromotion(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createPromotions).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeCreateDto({
        promotions: [makePromotion({ status: 'available' })],
      });

      await expect(resolver.createPromotion(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.createPromotions).not.toHaveBeenCalled();
    });

    it('rejects null picture', async () => {
      const dto = makeCreateDto({
        promotions: [makePromotion({ picture: null })],
      });

      await expect(resolver.createPromotion(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.createPromotions).not.toHaveBeenCalled();
    });
  });

  describe('updatePromotions', () => {
    it('delegates with valid payload', async () => {
      service.updatePromotions.mockResolvedValueOnce([]);

      await resolver.updatePromotions(makeUpdateDto());

      expect(service.updatePromotions).toHaveBeenCalledWith(
        expect.objectContaining({ promotions: expect.any(Array) }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updatePromotions(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updatePromotions).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        promotions: [
          makePromotion({ status: 'available', _id: new Types.ObjectId() }),
        ],
      });

      await expect(resolver.updatePromotions(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updatePromotions).not.toHaveBeenCalled();
    });
  });

  describe('findPromotionsByMonth', () => {
    it('rejects missing args', async () => {
      await expect(
        resolver.findPromotionsByMonth(undefined as any, false),
      ).rejects.toThrow(BadRequestException);
      expect(service.findPromotionsByMonth).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.findPromotionsByMonth(makeSearchArgs({ extra: 'bad' }), false),
      ).rejects.toThrow(BadRequestException);
      expect(service.findPromotionsByMonth).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      service.findPromotionsByMonth.mockResolvedValueOnce([]);

      await resolver.findPromotionsByMonth(makeSearchArgs(), true);

      expect(service.findPromotionsByMonth).toHaveBeenCalledWith(
        makeSearchArgs(),
        true,
      );
    });
  });

  describe('removePromotions', () => {
    it('rejects missing ids', async () => {
      expect(() =>
        resolver.removePromotions({ promotionsIDS: null } as any),
      ).toThrow(BadRequestException);
      expect(service.removePromotions).not.toHaveBeenCalled();
    });

    it('delegates with valid payload', async () => {
      service.removePromotions.mockResolvedValueOnce([]);

      await resolver.removePromotions({
        promotionsIDS: [new Types.ObjectId()],
      } as any);

      expect(service.removePromotions).toHaveBeenCalled();
    });
  });

  describe('findPromotionById', () => {
    it('delegates to service', async () => {
      service.findPromotionById.mockResolvedValueOnce({} as any);

      await resolver.findPromotionById(new Types.ObjectId().toString());

      expect(service.findPromotionById).toHaveBeenCalled();
    });
  });

  describe('findPromotionByDate', () => {
    it('rejects missing params', async () => {
      expect(() =>
        resolver.findPromotionByDate(undefined as any, false),
      ).toThrow(BadRequestException);
      expect(service.findPromotionsByDate).not.toHaveBeenCalled();
    });

    it('rejects extra params fields', async () => {
      expect(() =>
        resolver.findPromotionByDate(
          makeParamsByDate({ extra: 'bad' }),
          false,
        ),
      ).toThrow(BadRequestException);
      expect(service.findPromotionsByDate).not.toHaveBeenCalled();
    });

    it('delegates with valid params', async () => {
      service.findPromotionsByDate.mockResolvedValueOnce([]);

      await resolver.findPromotionByDate(makeParamsByDate(), true);

      expect(service.findPromotionsByDate).toHaveBeenCalledWith(
        makeParamsByDate(),
        true,
      );
    });
  });
});
