import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { MessagesService } from './messages.service';
import { Messages } from './schema/messages.schema';

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    populate: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
    exec: jest.fn().mockResolvedValue(value),
  };
  return query;
};

describe('MessagesService', () => {
  let service: MessagesService;
  let messagesModel: any;

  beforeEach(async () => {
    messagesModel = {
      create: jest.fn(),
      findOneAndUpdate: jest.fn(),
      findById: jest.fn(),
      aggregate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        { provide: getModelToken(Messages.name), useValue: messagesModel },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);

    jest.clearAllMocks();
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      createdAt: new Date(),
      form: makeObjectId().toString(),
      values: [],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      messagesID: makeObjectId(),
      messages: {
        form: makeObjectId().toString(),
        values: [],
      },
      ...overrides,
    }) as any;

  const makeArgs = (overrides: Record<string, any> = {}) =>
    ({
      date: { start: new Date(), end: new Date() },
      formRef: '',
      search: '',
      ...overrides,
    }) as any;

  describe('createMessages', () => {
    it('creates a message with new id', async () => {
      const dto = makeCreateDto();
      messagesModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createMessages(dto);

      const payload = messagesModel.create.mock.calls[0][0];
      expect(payload._id).toBeDefined();
      expect(payload.form).toBe(dto.form);
    });
  });

  describe('updateMessages', () => {
    it('updates message fields', async () => {
      const dto = makeUpdateDto();
      messagesModel.findOneAndUpdate.mockResolvedValueOnce({
        _id: dto.messagesID,
      });

      await service.updateMessages(dto);

      expect(messagesModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: dto.messagesID },
        expect.objectContaining({ $set: dto.messages }),
        { new: true },
      );
    });
  });

  describe('findMessagesById', () => {
    it('returns a message', async () => {
      const messagesID = makeObjectId();
      messagesModel.findById.mockReturnValueOnce(
        makeQueryMock({ _id: messagesID }),
      );

      await expect(service.findMessagesById(messagesID)).resolves.toEqual({
        _id: messagesID,
      });
    });
  });

  describe('findMessages', () => {
    it('aggregates messages', async () => {
      messagesModel.aggregate.mockReturnValueOnce([]);

      await service.findMessages(makeArgs());

      expect(messagesModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findMessagesAndDownloadFile', () => {
    it('aggregates messages for downloads', async () => {
      messagesModel.aggregate.mockReturnValueOnce([]);

      await service.findMessagesAndDownloadFile(makeArgs());

      expect(messagesModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });
});
