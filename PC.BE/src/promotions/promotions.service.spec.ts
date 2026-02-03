import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { PromotionsService } from './promotions.service';
import { Promotions } from './schema/promotions.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import { getUniqueSlug } from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';
import { ASContainerName } from 'src/common/constants';

jest.mock('src/common/utils/fileHandler', () => ({
  getImageDetail: jest.fn(),
  cloneFiles: jest.fn(),
}));

jest.mock('src/common/utils/slugBuilder', () => ({
  getUniqueSlug: jest.fn(),
}));

const mockGetImageDetail = getImageDetail as jest.Mock;
const mockCloneFiles = cloneFiles as jest.Mock;
const mockGetUniqueSlug = getUniqueSlug as jest.Mock;

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
    exec: jest.fn().mockResolvedValue(value),
  };
  return query;
};

const makePromotion = (overrides: Record<string, any> = {}) => ({
  _id: makeObjectId(),
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
    promotions: [makePromotion({ _id: undefined })],
    ...overrides,
  }) as any;

const makeUpdateDto = (overrides: Record<string, any> = {}) =>
  ({
    promotions: [makePromotion({ picture: 'img' })],
    ...overrides,
  }) as any;

describe('PromotionsService', () => {
  let service: PromotionsService;
  let promotionModel: any;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    promotionModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      aggregate: jest.fn(),
    };

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PromotionsService,
        { provide: getModelToken(Promotions.name), useValue: promotionModel },
        { provide: AzureBlobStorageService, useValue: azureService },
      ],
    }).compile();

    service = module.get<PromotionsService>(PromotionsService);

    jest.clearAllMocks();
  });

  describe('createPromotions', () => {
    it('creates promotions with image details', async () => {
      const dto = makeCreateDto({
        promotions: [
          makePromotion({
            _id: undefined,
            picture: [{ img: 'base64' }],
          }),
        ],
      });
      mockGetImageDetail.mockResolvedValueOnce({ image: 'pic' });
      promotionModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createPromotions(dto);

      const payload = promotionModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.picture).toBeNull();
    });
  });

  describe('updatePromotions', () => {
    it('updates existing promotions', async () => {
      const dto = makeUpdateDto();
      mockGetImageDetail.mockResolvedValueOnce({ image: 'pic' });
      promotionModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.promotions[0]._id,
      });

      await service.updatePromotions(dto);

      expect(promotionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: new Types.ObjectId(String(dto.promotions[0]._id)) },
        expect.any(Object),
        { new: true },
      );
    });
  });

  describe('clonePromotion', () => {
    it('clones promotion into a draft copy', async () => {
      const promotionID = makeObjectId();
      const existingPromotion = {
        _id: promotionID,
        name: 'Original',
        picture: 'pic.png',
        pictureImageDetail: { image: 'detail.png' },
      };
      const existingDoc = {
        ...existingPromotion,
        toObject: jest.fn().mockReturnValue(existingPromotion),
      };
      jest
        .spyOn(service, 'findPromotionById')
        .mockResolvedValueOnce(existingDoc as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      promotionModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.clonePromotion(promotionID);

      const payload = promotionModel.create.mock.calls[0][0];
      expect(payload.name).toBe('Original (copia)');
      expect(payload.slug).toBe('unique-slug');
      expect(payload.status).toBe('draft');
    });
  });

  describe('findPromotionsByMonth', () => {
    it('aggregates promotions by month', async () => {
      promotionModel.aggregate.mockReturnValueOnce([]);

      await service.findPromotionsByMonth({ month: '2025-01' }, false);

      expect(promotionModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findPromotionsByDate', () => {
    it('aggregates promotions by date', async () => {
      promotionModel.aggregate.mockReturnValueOnce([]);

      await service.findPromotionsByDate(
        { start: '2025-01-01', end: '2025-01-31', search: '' },
        false,
      );

      expect(promotionModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('changePromotionStatus', () => {
    it('updates status field', async () => {
      const promotionID = makeObjectId();
      promotionModel.findOneAndUpdate.mockResolvedValueOnce({ _id: promotionID });

      await service.changePromotionStatus(promotionID, 'publish');

      expect(promotionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: promotionID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removePromotion', () => {
    it('soft deletes promotion', async () => {
      const promotionID = makeObjectId();
      promotionModel.findOneAndUpdate.mockResolvedValueOnce({ _id: promotionID });

      await service.removePromotion(promotionID);

      const payload = promotionModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('removePromotions', () => {
    it('soft deletes multiple promotions', async () => {
      const promotionID = makeObjectId();
      promotionModel.findOneAndUpdate.mockResolvedValueOnce({ _id: promotionID });

      await service.removePromotions({
        promotionsIDS: [promotionID],
      } as any);

      expect(promotionModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: promotionID },
        expect.objectContaining({ $set: expect.any(Object) }),
        { new: true },
      );
    });
  });

  describe('removeFiles', () => {
    it('removes picture or detail when present', async () => {
      const promotionID = makeObjectId();
      const imageUrl = `${ASContainerName}promotions/pic.png`;
      const detailUrl = `${ASContainerName}promotions/detail.png`;
      promotionModel.findById.mockReturnValueOnce(
        makeQueryMock({
          picture: imageUrl,
          pictureImageDetail: { image: detailUrl },
        }),
      );

      await service.removeFiles(promotionID);

      expect(azureService.remove).toHaveBeenCalledWith([
        { Key: imageUrl },
      ]);
    });

    it('removes detail when picture is missing', async () => {
      const promotionID = makeObjectId();
      const detailUrl = `${ASContainerName}promotions/detail.png`;
      promotionModel.findById.mockReturnValueOnce(
        makeQueryMock({
          picture: null,
          pictureImageDetail: { image: detailUrl },
        }),
      );

      await service.removeFiles(promotionID);

      expect(azureService.remove).toHaveBeenCalledWith([
        { Key: detailUrl },
      ]);
    });
  });
});
