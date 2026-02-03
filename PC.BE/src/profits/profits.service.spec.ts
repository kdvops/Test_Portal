import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { ProfitsService } from './profits.service';
import { Profits } from './schema/profits.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import {
  getUniqueExistingSlug,
  getUniqueSlug,
} from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';
import { ASContainerName } from 'src/common/constants';

jest.mock('src/common/utils/fileHandler', () => ({
  getImageDetail: jest.fn(),
  cloneFiles: jest.fn(),
}));

jest.mock('src/common/utils/slugBuilder', () => ({
  getUniqueExistingSlug: jest.fn(),
  getUniqueSlug: jest.fn(),
}));

const mockGetImageDetail = getImageDetail as jest.Mock;
const mockCloneFiles = cloneFiles as jest.Mock;
const mockGetUniqueSlug = getUniqueSlug as jest.Mock;
const mockGetUniqueExistingSlug = getUniqueExistingSlug as jest.Mock;

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

const makeProfit = (overrides: Record<string, any> = {}) => ({
  _id: makeObjectId(),
  name: 'Name',
  status: StatusItem.draft,
  percent: '10',
  color: '#fff',
  category: makeObjectId().toString(),
  description: null,
  devolution: 'text',
  condition: 'text',
  picture: null,
  pictureImageDetail: null,
  disabled: false,
  date: { start: new Date(), end: new Date() },
  ...overrides,
});

const makeCreateDto = (overrides: Record<string, any> = {}) =>
  ({
    profits: [makeProfit({ _id: undefined })],
    ...overrides,
  }) as any;

const makeUpdateDto = (overrides: Record<string, any> = {}) =>
  ({
    profits: [makeProfit({ picture: 'img' })],
    ...overrides,
  }) as any;

describe('ProfitsService', () => {
  let service: ProfitsService;
  let profitModel: any;
  let azureService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    profitModel = {
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
        ProfitsService,
        { provide: getModelToken(Profits.name), useValue: profitModel },
        { provide: AzureBlobStorageService, useValue: azureService },
      ],
    }).compile();

    service = module.get<ProfitsService>(ProfitsService);

    jest.clearAllMocks();
  });

  describe('createProfits', () => {
    it('creates profits with image details', async () => {
      const dto = makeCreateDto();
      mockGetImageDetail.mockResolvedValueOnce({ image: 'pic' });
      profitModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createProfits(dto);

      const payload = profitModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.picture).toBeNull();
    });
  });

  describe('updateProfits', () => {
    it('updates existing profits', async () => {
      const dto = makeUpdateDto();
      mockGetImageDetail.mockResolvedValueOnce({ image: 'pic' });
      profitModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.profits[0]._id,
      });

      await service.updateProfits(dto);

      expect(profitModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: dto.profits[0]._id },
        expect.objectContaining({ $set: dto.profits[0] }),
        { new: true },
      );
    });
  });

  describe('cloneProfits', () => {
    it('clones profit into a draft copy', async () => {
      const profitID = makeObjectId();
      const existingProfit = {
        _id: profitID,
        name: 'Original',
        picture: 'pic.png',
      };
      const existingDoc = {
        ...existingProfit,
        toObject: jest.fn().mockReturnValue(existingProfit),
      };
      jest
        .spyOn(service, 'findProfitById')
        .mockResolvedValueOnce(existingDoc as any);
      mockCloneFiles.mockResolvedValue('cloned.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      profitModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.cloneProfits(profitID);

      const payload = profitModel.create.mock.calls[0][0];
      expect(payload.name).toBe('Original (copia)');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('profitsGroupByCategory', () => {
    it('aggregates profits by category', async () => {
      profitModel.aggregate.mockReturnValueOnce([]);

      await service.profitsGroupByCategory(false);

      expect(profitModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findProfitsByCategory', () => {
    it('returns by category', async () => {
      profitModel.find.mockResolvedValueOnce([]);

      await service.findProfitsByCategory('category', false);

      expect(profitModel.find).toHaveBeenCalledWith(
        expect.objectContaining({ category: 'category' }),
      );
    });
  });

  describe('changeProfitsStatus', () => {
    it('updates status field', async () => {
      const profitID = makeObjectId();
      profitModel.findOneAndUpdate.mockResolvedValueOnce({ _id: profitID });

      await service.changeProfitsStatus(profitID, 'publish');

      expect(profitModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: profitID },
        { $set: { status: 'publish' } },
        { new: true },
      );
    });
  });

  describe('removeProfits', () => {
    it('soft deletes profit', async () => {
      const profitID = makeObjectId();
      profitModel.findOneAndUpdate.mockResolvedValueOnce({ _id: profitID });

      await service.removeProfits(profitID);

      const payload = profitModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
      expect(payload.$set.picture).toBe('');
    });
  });

  describe('removeFiles', () => {
    it('removes picture and detail when present', async () => {
      const profitID = makeObjectId();
      const imageUrl = `${ASContainerName}profits/pic.png`;
      const detailUrl = `${ASContainerName}profits/detail.png`;
      profitModel.findById.mockReturnValueOnce(
        makeQueryMock({
          picture: imageUrl,
          pictureImageDetail: { image: detailUrl },
        }),
      );

      await service.removeFiles(profitID);

      expect(azureService.remove).toHaveBeenCalledWith([
        { Key: imageUrl },
        { Key: detailUrl },
      ]);
    });

    it('skips removal when missing files', async () => {
      const profitID = makeObjectId();
      profitModel.findById.mockReturnValueOnce(makeQueryMock({}));

      await service.removeFiles(profitID);

      expect(azureService.remove).not.toHaveBeenCalled();
    });
  });

  describe('findUniqueSlug', () => {
    it('delegates to slug builder', async () => {
      mockGetUniqueExistingSlug.mockResolvedValueOnce('unique');

      await expect(service.findUniqueSlug('slug')).resolves.toBe('unique');
    });
  });
});
