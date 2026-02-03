import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { CoinsResolver } from './coins.resolver';
import { CoinsService } from './coins.service';
import { Coins } from './schema/coins.schema';

describe('CoinsResolver', () => {
  let resolver: CoinsResolver;
  let service: jest.Mocked<CoinsService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<CoinsService> = {
      updateCoin: jest.fn(),
      removeCoin: jest.fn(),
      createCoins: jest.fn(),
      coins: jest.fn(),
      findCoinById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinsResolver,
        { provide: CoinsService, useValue: serviceMock },
        { provide: getModelToken(Coins.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<CoinsResolver>(CoinsResolver);
    service = module.get(CoinsService) as jest.Mocked<CoinsService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      name: 'USD',
      price: { buy: '100', sell: '101' },
      prefix: '$',
      logo: null,
      logoImageDetail: null,
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      coinID: new Types.ObjectId(),
      coin: {
        name: 'USD',
        price: { buy: '100', sell: '101' },
        prefix: '$',
        logo: null,
        logoImageDetail: null,
      },
      newUploadLogo: [],
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects removeCoin', async () => {
      await expect(resolver.removeCoin('not-an-id')).rejects.toThrow(
        'Invalid coinID',
      );
      expect(service.removeCoin).not.toHaveBeenCalled();
    });

    it('rejects findCoinById', () => {
      expect(() => resolver.findCoinById('not-an-id')).toThrow(
        'Invalid coinID',
      );
      expect(service.findCoinById).not.toHaveBeenCalled();
    });
  });

  describe('createCoin', () => {
    it('delegates with valid payload', async () => {
      service.createCoins.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createCoin(makeCreateDto());

      expect(service.createCoins).toHaveBeenCalledWith(
        expect.objectContaining({ name: 'USD' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createCoin(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createCoins).not.toHaveBeenCalled();
    });

    it('rejects invalid price shape', async () => {
      await expect(
        resolver.createCoin(makeCreateDto({ price: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createCoins).not.toHaveBeenCalled();
    });
  });

  describe('updateCoin', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateCoin.mockResolvedValueOnce({ _id: dto.coinID } as any);

      await resolver.updateCoin(dto);

      expect(service.updateCoin).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateCoin(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateCoin).not.toHaveBeenCalled();
    });

    it('rejects extra coin fields', async () => {
      await expect(
        resolver.updateCoin(
          makeUpdateDto({ coin: { ...makeUpdateDto().coin, extra: 'bad' } }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateCoin).not.toHaveBeenCalled();
    });

    it('rejects invalid price shape', async () => {
      await expect(
        resolver.updateCoin(makeUpdateDto({ coin: { price: 'bad' } })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateCoin).not.toHaveBeenCalled();
    });
  });

  describe('coins', () => {
    it('delegates to service', async () => {
      service.coins.mockResolvedValueOnce([]);

      await resolver.coins();

      expect(service.coins).toHaveBeenCalled();
    });
  });
});
