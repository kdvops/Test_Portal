import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken, getConnectionToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { SeoPageService } from './seoPage.service';
import { SeoPage } from './schema/seoPage.schema';

const makeObjectId = () => new Types.ObjectId();

describe('SeoPageService', () => {
  let service: SeoPageService;
  let seoPageModel: any;
  let connection: any;

  beforeEach(async () => {
    seoPageModel = {
      create: jest.fn(),
      insertMany: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
    };

    connection = {
      startSession: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeoPageService,
        { provide: getModelToken(SeoPage.name), useValue: seoPageModel },
        { provide: getConnectionToken(), useValue: connection },
      ],
    }).compile();

    service = module.get<SeoPageService>(SeoPageService);
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) => ({
    path: '/home',
    meta: { title: 'Home', description: 'Desc', image: '' },
    ...overrides,
  });

  describe('createSeoPage', () => {
    it('creates a seo page with new id', async () => {
      seoPageModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createSeoPage(makeCreateDto() as any);

      const payload = seoPageModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.path).toBe('/home');
    });
  });

  describe('createSeoPages', () => {
    it('inserts pages in a transaction', async () => {
      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      connection.startSession.mockResolvedValueOnce(session);

      await service.createSeoPages({
        pages: [makeCreateDto(), makeCreateDto({ path: '/about' })],
      } as any);

      expect(seoPageModel.insertMany).toHaveBeenCalledWith(
        expect.any(Array),
        { session },
      );
      expect(session.commitTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });

    it('aborts transaction on insert error', async () => {
      const session = {
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        abortTransaction: jest.fn(),
        endSession: jest.fn(),
      };
      connection.startSession.mockResolvedValueOnce(session);
      seoPageModel.insertMany.mockRejectedValueOnce(new Error('fail'));

      await expect(
        service.createSeoPages({ pages: [makeCreateDto()] } as any),
      ).rejects.toThrow('fail');

      expect(session.abortTransaction).toHaveBeenCalled();
      expect(session.endSession).toHaveBeenCalled();
    });
  });

  describe('updateSeoPage', () => {
    it('updates by id', async () => {
      const dto = { _id: makeObjectId(), ...makeCreateDto() };
      seoPageModel.findOneAndUpdate.mockResolvedValueOnce({ _id: dto._id });

      await service.updateSeoPage(dto as any);

      expect(seoPageModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: dto._id },
        expect.objectContaining({ $set: expect.any(Object) }),
        { new: true },
      );
    });
  });

  describe('removeSeoPage', () => {
    it('soft deletes by id', async () => {
      const seoPageId = makeObjectId();
      seoPageModel.findOneAndUpdate.mockResolvedValueOnce({ _id: seoPageId });

      await service.removeSeoPage(seoPageId);

      const payload = seoPageModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.$set.deletedAt).toBeInstanceOf(Date);
    });
  });

  describe('findSeoPageById', () => {
    it('returns page by id', async () => {
      const seoPageId = makeObjectId();
      seoPageModel.findById.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ _id: seoPageId }),
      });

      await expect(service.findSeoPageById(seoPageId)).resolves.toEqual({
        _id: seoPageId,
      });
    });
  });

  describe('findSeoPageByPath', () => {
    it('returns page by path', async () => {
      seoPageModel.findOne.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue({ path: '/home' }),
      });

      await expect(service.findSeoPageByPath('/home')).resolves.toEqual({
        path: '/home',
      });
    });
  });

  describe('seoPages', () => {
    it('returns list of pages', async () => {
      seoPageModel.find.mockReturnValueOnce({
        lean: jest.fn().mockResolvedValue([]),
      });

      await expect(service.seoPages()).resolves.toEqual([]);
    });
  });
});
