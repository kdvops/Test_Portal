import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { AdjudicatedService } from './adjudicated.service';
import { Adjudicated } from './schema/adjudicated.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { CreateAdjudicatedDto } from './dto/create.adjudicated.dto';
import { UpdateAdjudicatedDto } from './dto/update.adjudicated.dto';
import { cloneFiles, getImageDetail } from 'src/common/utils/fileHandler';
import { getUniqueSlug } from 'src/common/utils/slugBuilder';
import { StatusItem } from 'src/common/enums/status.enums';
import { TypeStatusAdjudicated } from 'src/common/enums/adjudicated.enum';

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
    lean: jest.fn().mockResolvedValue(value),
    exec: jest.fn().mockResolvedValue(value),
  };
  return query;
};

const makeImageDetailInput = (overrides: Record<string, any> = {}) => ({
  image: 'data:image/png;base64,abc',
  altText: null,
  ...overrides,
});

const makePictureInput = (overrides: Record<string, any> = {}) => ({
  image: [{ img: 'base64', filetype: 'png' }],
  isCover: false,
  ...overrides,
});

const makeBaseCreateDto = (): CreateAdjudicatedDto =>
  ({
    category: makeObjectId().toString(),
    item_status: StatusItem.draft,
    status: TypeStatusAdjudicated.available,
    name: 'Adjudicated item',
    link: '',
    excerpt: 'Excerpt',
    description: 'Description',
    pictures: [makePictureInput()],
    picturesImageDetail: [makeImageDetailInput()],
    price: 1000,
    address: 'Address',
    province: 'Province',
    phone: '555-0000',
    disabled: false,
  }) as CreateAdjudicatedDto;

const makeBaseUpdateDto = (): UpdateAdjudicatedDto =>
  ({
    adjudicatedID: makeObjectId(),
    adjudicated: {
      category: makeObjectId().toString(),
      status: TypeStatusAdjudicated.available,
      item_status: StatusItem.draft,
      name: 'Updated',
      link: '',
      excerpt: 'Excerpt',
      description: 'Description',
      pictures: [],
      picturesImageDetail: [],
      price: 1200,
      address: 'Address',
      province: 'Province',
      phone: '555-1111',
      disabled: false,
    },
  }) as UpdateAdjudicatedDto;

describe('AdjudicatedService', () => {
  let service: AdjudicatedService;
  let adjudicatedModel: any;
  let azureBlobStorageService: jest.Mocked<AzureBlobStorageService>;

  beforeEach(async () => {
    adjudicatedModel = {
      create: jest.fn(),
      findById: jest.fn(),
      findOneAndUpdate: jest.fn(),
      aggregate: jest.fn(),
    };

    azureBlobStorageService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdjudicatedService,
        {
          provide: getModelToken(Adjudicated.name),
          useValue: adjudicatedModel,
        },
        { provide: AzureBlobStorageService, useValue: azureBlobStorageService },
      ],
    }).compile();

    service = module.get<AdjudicatedService>(AdjudicatedService);
    jest.clearAllMocks();
  });

  describe('createAdjudicated', () => {
    it('creates an adjudicated with pictures image detail', async () => {
      const dto = makeBaseCreateDto();
      mockGetImageDetail.mockResolvedValueOnce({ image: 'stored.png' });
      adjudicatedModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createAdjudicated(dto);

      expect(mockGetImageDetail).toHaveBeenCalledTimes(1);
      const payload = adjudicatedModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.pictures).toBeNull();
      expect(payload.picturesImageDetail).toHaveLength(1);
      expect(payload.picturesImageDetail[0]._id).toBeDefined();
    });

    it('allows empty pictures image detail arrays', async () => {
      const dto = { ...makeBaseCreateDto(), picturesImageDetail: [] };
      adjudicatedModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createAdjudicated(dto);

      expect(mockGetImageDetail).not.toHaveBeenCalled();
      const payload = adjudicatedModel.create.mock.calls[0][0];
      expect(payload.picturesImageDetail).toEqual([]);
    });
  });

  describe('updateAdjudicated', () => {
    it('handles create, update, delete, and keep actions in pictures', async () => {
      const adjudicatedID = makeObjectId();
      const deletedId = makeObjectId();
      const keepId = makeObjectId();
      const updateId = makeObjectId();
      const dto = makeBaseUpdateDto();
      dto.adjudicatedID = adjudicatedID;
      dto.adjudicated.picturesImageDetail = [
        makeImageDetailInput(),
        { _id: updateId, image: 'existing', updatedAt: new Date() },
        { _id: deletedId, image: 'to-delete', deletedAt: new Date() },
        { _id: keepId, image: 'keep', isCover: false },
      ] as any;

      mockGetImageDetail
        .mockResolvedValueOnce({ image: 'created.png' })
        .mockResolvedValueOnce({ image: 'updated.png' });
      const removeSpy = jest
        .spyOn(service, 'removeFiles')
        .mockResolvedValueOnce(undefined as any);
      adjudicatedModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: adjudicatedID,
      });

      await service.updateAdjudicated(dto);

      expect(mockGetImageDetail).toHaveBeenCalledTimes(2);
      expect(removeSpy).toHaveBeenCalledWith(adjudicatedID, deletedId);
      const payload = adjudicatedModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.pictures).toBeNull();
      expect(payload.picturesImageDetail).toEqual(
        expect.arrayContaining([
          '',
          { _id: keepId, image: 'keep', isCover: false },
        ]),
      );
    });
  });

  describe('cloneAdjudicated', () => {
    it('clones images and creates a draft copy', async () => {
      const adjudicatedID = makeObjectId();
      const source = {
        _id: adjudicatedID,
        name: 'Original',
        slug: 'original',
        pictures: null,
        picturesImageDetail: [{ image: 'img-1' }],
      } as any;

      jest.spyOn(service, 'findAdjudicatedById').mockResolvedValueOnce(source);
      mockCloneFiles.mockResolvedValueOnce('cloned-1.png');
      mockGetUniqueSlug.mockResolvedValueOnce('unique-slug');
      adjudicatedModel.create.mockResolvedValueOnce({
        _id: makeObjectId(),
      });

      await service.cloneAdjudicated(adjudicatedID);

      expect(mockCloneFiles).toHaveBeenCalledTimes(1);
      const payload = adjudicatedModel.create.mock.calls[0][0];
      expect(payload.name).toBe('Original (copia)');
      expect(payload.item_status).toBe('draft');
      expect(payload.slug).toBe('unique-slug');
    });
  });

  describe('findAdjudicatedById', () => {
    it('returns a single adjudicated', async () => {
      const adjudicatedID = makeObjectId();
      const record = { _id: adjudicatedID };
      adjudicatedModel.findById.mockReturnValueOnce(makeQueryMock(record));

      await expect(service.findAdjudicatedById(adjudicatedID)).resolves.toEqual(
        record,
      );
    });
  });

  describe('findAdjudicated', () => {
    it('builds a search pipeline with args', async () => {
      const args = {
        search: 'search',
        category: 'category',
        province: 'province',
        priceMin: 10,
        priceMax: 20,
      };
      adjudicatedModel.aggregate.mockResolvedValueOnce([]);

      await service.findAdjudicated(args);

      expect(adjudicatedModel.aggregate).toHaveBeenCalledTimes(1);
      const pipeline = adjudicatedModel.aggregate.mock.calls[0][0];
      expect(pipeline[0].$match).toBeDefined();
    });
  });

  describe('removeAdjudicated', () => {
    it('soft deletes adjudicated', async () => {
      const adjudicatedID = makeObjectId();
      adjudicatedModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: adjudicatedID,
      });

      await service.removeAdjudicated(adjudicatedID);

      const payload = adjudicatedModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('changeAdjudicatedStatus', () => {
    it('changes item status', async () => {
      const adjudicatedID = makeObjectId();
      adjudicatedModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: adjudicatedID,
      });

      await service.changeAdjudicatedStatus(adjudicatedID, 'publish');

      expect(adjudicatedModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: adjudicatedID },
        { $set: { item_status: 'publish' } },
        { new: true },
      );
      const payload = adjudicatedModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set).not.toHaveProperty('status');
    });
  });

  describe('findAdjudicatedProductsGroupByCategory', () => {
    it('aggregates products by category', async () => {
      adjudicatedModel.aggregate.mockReturnValueOnce(makeQueryMock([]));

      await service.findAdjudicatedProductsGroupByCategory(false);

      expect(adjudicatedModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });
});
