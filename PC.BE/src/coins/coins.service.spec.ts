import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { CoinsService } from './coins.service';
import { Coins } from './schema/coins.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { getImageDetail } from 'src/common/utils/fileHandler';

jest.mock('src/common/utils/fileHandler', () => ({
  getImageDetail: jest.fn(),
}));

const mockGetImageDetail = getImageDetail as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => ({
  select: jest.fn().mockReturnThis(),
  lean: jest.fn().mockResolvedValue(value),
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
    coinID: makeObjectId(),
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

describe('CoinsService', () => {
  let service: CoinsService;
  let coinModel: any;

  beforeEach(async () => {
    coinModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
    };

    const azureMock: jest.Mocked<AzureBlobStorageService> = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinsService,
        { provide: getModelToken(Coins.name), useValue: coinModel },
        { provide: AzureBlobStorageService, useValue: azureMock },
      ],
    }).compile();

    service = module.get<CoinsService>(CoinsService);
    jest.clearAllMocks();
  });

  describe('createCoins', () => {
    it('creates coin with image detail', async () => {
      const dto = makeCreateDto();
      mockGetImageDetail.mockResolvedValueOnce({ image: 'logo' });
      coinModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createCoins(dto);

      const payload = coinModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.logo).toBeNull();
      expect(payload.logoImageDetail).toEqual({ image: 'logo' });
    });
  });

  describe('updateCoin', () => {
    it('updates coin data and image detail', async () => {
      const dto = makeUpdateDto();
      mockGetImageDetail.mockResolvedValueOnce({ image: 'logo' });
      coinModel.findOneAndUpdate.mockResolvedValueOnce({ _id: dto.coinID });

      await service.updateCoin(dto);

      const payload = coinModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.logo).toBeNull();
      expect(payload.logoImageDetail).toEqual({ image: 'logo' });
    });
  });

  describe('removeCoin', () => {
    it('soft deletes coin', async () => {
      const coinID = makeObjectId();
      coinModel.findById.mockReturnValueOnce(
        makeQueryMock({ logo: '' }),
      );
      coinModel.findOneAndUpdate.mockResolvedValueOnce({ _id: coinID });

      await service.removeCoin(coinID);

      const payload = coinModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
      expect(payload.$set.logo).toBe('');
    });
  });

  describe('findCoinById', () => {
    it('returns a coin', async () => {
      const coinID = makeObjectId();
      coinModel.findById.mockReturnValueOnce(makeQueryMock({ _id: coinID }));

      await expect(service.findCoinById(coinID)).resolves.toEqual({
        _id: coinID,
      });
    });
  });

  describe('coins', () => {
    it('returns list of coins', async () => {
      coinModel.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([]),
      });

      await service.coins();

      expect(coinModel.find).toHaveBeenCalledWith({ deletedAt: null });
    });
  });
});
