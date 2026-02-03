import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ProfitsResolver } from './profits.resolver';
import { ProfitsService } from './profits.service';
import { Profits } from './schema/profits.schema';
import { StatusItem } from 'src/common/enums/status.enums';

describe('ProfitsResolver', () => {
  let resolver: ProfitsResolver;
  let service: jest.Mocked<ProfitsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<ProfitsService> = {
      updateProfits: jest.fn(),
      createProfits: jest.fn(),
      cloneProfits: jest.fn(),
      changeProfitsStatus: jest.fn(),
      removeProfits: jest.fn(),
      profitsGroupByCategory: jest.fn(),
      findProfitById: jest.fn(),
      findProfitsByCategory: jest.fn(),
      findUniqueSlug: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfitsResolver,
        { provide: ProfitsService, useValue: serviceMock },
        { provide: getModelToken(Profits.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<ProfitsResolver>(ProfitsResolver);
    service = module.get(ProfitsService) as jest.Mocked<ProfitsService>;
  });

  const makeProfit = (overrides: Record<string, any> = {}) => ({
    name: 'Name',
    status: StatusItem.draft,
    percent: '10',
    color: '#fff',
    category: new Types.ObjectId().toString(),
    description: null,
    devolution: 'text',
    condition: 'text',
    picture: [],
    pictureImageDetail: null,
    disabled: false,
    date: { start: new Date(), end: new Date() },
    ...overrides,
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      profits: [makeProfit()],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      profits: [{ _id: new Types.ObjectId(), ...makeProfit(), picture: 'img' }],
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeProfits', () => {
      expect(() => resolver.removeProfits('not-an-id')).toThrow(
        'Invalid profitID',
      );
      expect(service.removeProfits).not.toHaveBeenCalled();
    });

    it('rejects cloneProfits', () => {
      expect(() => resolver.cloneProfits('not-an-id')).toThrow(
        'Invalid profitID',
      );
      expect(service.cloneProfits).not.toHaveBeenCalled();
    });

    it('rejects publishProfits', () => {
      expect(() => resolver.publishProfits('not-an-id')).toThrow(
        'Invalid profitID',
      );
      expect(service.changeProfitsStatus).not.toHaveBeenCalled();
    });

    it('rejects draftProfits', () => {
      expect(() => resolver.draftProfits('not-an-id')).toThrow(
        'Invalid profitID',
      );
      expect(service.changeProfitsStatus).not.toHaveBeenCalled();
    });

    it('rejects findProfitById', () => {
      expect(() => resolver.findProfitById('not-an-id')).toThrow(
        'Invalid profitID',
      );
      expect(service.findProfitById).not.toHaveBeenCalled();
    });
  });

  describe('createProfit', () => {
    it('delegates with valid payload', async () => {
      service.createProfits.mockResolvedValueOnce([]);

      await resolver.createProfit(makeCreateDto());

      expect(service.createProfits).toHaveBeenCalledWith(
        expect.objectContaining({ profits: expect.any(Array) }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createProfit(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createProfits).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeCreateDto({
        profits: [makeProfit({ status: 'available' })],
      });

      await expect(resolver.createProfit(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.createProfits).not.toHaveBeenCalled();
    });

    it('rejects null picture', async () => {
      const dto = makeCreateDto({
        profits: [makeProfit({ picture: null })],
      });

      await expect(resolver.createProfit(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.createProfits).not.toHaveBeenCalled();
    });
  });

  describe('updateProfits', () => {
    it('delegates with valid payload', async () => {
      service.updateProfits.mockResolvedValueOnce([]);

      await resolver.updateProfits(makeUpdateDto());

      expect(service.updateProfits).toHaveBeenCalledWith(
        expect.objectContaining({ profits: expect.any(Array) }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updateProfits(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateProfits).not.toHaveBeenCalled();
    });

    it('rejects invalid status enum', async () => {
      const dto = makeUpdateDto({
        profits: [makeProfit({ status: 'available', _id: new Types.ObjectId() })],
      });

      await expect(resolver.updateProfits(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateProfits).not.toHaveBeenCalled();
    });
  });

  describe('profitsGroupByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.profitsGroupByCategory.mockResolvedValueOnce([]);

      await resolver.profitsGroupByCategory(true);

      expect(service.profitsGroupByCategory).toHaveBeenCalledWith(true);
    });
  });

  describe('findProfitsByCategory', () => {
    it('delegates with findAll flag', async () => {
      service.findProfitsByCategory.mockResolvedValueOnce([]);

      await resolver.findProfitsByCategory('category', true);

      expect(service.findProfitsByCategory).toHaveBeenCalledWith(
        'category',
        true,
      );
    });
  });

  describe('findUniqueProfitSlug', () => {
    it('delegates to service', async () => {
      service.findUniqueSlug.mockResolvedValueOnce('unique');

      await resolver.findUniqueProfitSlug('slug');

      expect(service.findUniqueSlug).toHaveBeenCalledWith('slug');
    });
  });
});
