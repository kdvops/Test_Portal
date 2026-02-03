import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { MessagesResolver } from './messages.resolver';
import { MessagesService } from './messages.service';
import { Messages } from './schema/messages.schema';

describe('MessagesResolver', () => {
  let resolver: MessagesResolver;
  let service: jest.Mocked<MessagesService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<MessagesService> = {
      updateMessages: jest.fn(),
      createMessages: jest.fn(),
      removeMessages: jest.fn(),
      findMessagesAndDownloadFile: jest.fn(),
      findMessages: jest.fn(),
      findMessagesById: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesResolver,
        { provide: MessagesService, useValue: serviceMock },
        { provide: getModelToken(Messages.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<MessagesResolver>(MessagesResolver);
    service = module.get(MessagesService) as jest.Mocked<MessagesService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      createdAt: new Date(),
      form: new Types.ObjectId().toString(),
      values: [],
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      messagesID: new Types.ObjectId().toString(),
      messages: {
        form: new Types.ObjectId().toString(),
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

  describe('invalid ids', () => {
    it('rejects removeMessages', async () => {
      await expect(resolver.removeMessages('not-an-id')).rejects.toThrow(
        'Invalid messagesID',
      );
      expect(service.removeMessages).not.toHaveBeenCalled();
    });

    it('rejects findMessagesById', () => {
      expect(() => resolver.findMessagesById('not-an-id')).toThrow(
        'Invalid messagesID',
      );
      expect(service.findMessagesById).not.toHaveBeenCalled();
    });
  });

  describe('createMessages', () => {
    it('delegates with valid payload', async () => {
      service.createMessages.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.createMessages(makeCreateDto());

      expect(service.createMessages).toHaveBeenCalledWith(
        expect.objectContaining({ form: expect.any(String) }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createMessages(makeCreateDto({ extraField: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createMessages).not.toHaveBeenCalled();
    });

    it('rejects null values', async () => {
      await expect(
        resolver.createMessages(makeCreateDto({ values: null })),
      ).rejects.toThrow(BadRequestException);
      expect(service.createMessages).not.toHaveBeenCalled();
    });
  });

  describe('updateMessages', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      service.updateMessages.mockResolvedValueOnce({
        _id: new Types.ObjectId(),
      } as any);

      await resolver.updateMessages(dto);

      expect(service.updateMessages).toHaveBeenCalledWith(dto);
    });

    it('rejects extra root fields', async () => {
      await expect(
        resolver.updateMessages(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(service.updateMessages).not.toHaveBeenCalled();
    });

    it('rejects extra messages fields', async () => {
      const dto = makeUpdateDto({
        messages: { ...makeUpdateDto().messages, extra: 'bad' },
      });

      await expect(resolver.updateMessages(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateMessages).not.toHaveBeenCalled();
    });

    it('rejects null values', async () => {
      const dto = makeUpdateDto({
        messages: { ...makeUpdateDto().messages, values: null },
      });

      await expect(resolver.updateMessages(dto)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.updateMessages).not.toHaveBeenCalled();
    });
  });

  describe('findMessages', () => {
    it('rejects missing args', async () => {
      await expect(resolver.findMessages(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findMessages).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(resolver.findMessages(makeArgs({ extra: 'bad' }))).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findMessages).not.toHaveBeenCalled();
    });

    it('rejects missing date', async () => {
      await expect(resolver.findMessages(makeArgs({ date: null }))).rejects.toThrow(
        BadRequestException,
      );
      expect(service.findMessages).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findMessages.mockResolvedValueOnce([]);

      await resolver.findMessages(args);

      expect(service.findMessages).toHaveBeenCalledWith(args);
    });
  });

  describe('findMessagesAndDownloadFile', () => {
    it('delegates with valid args', async () => {
      const args = makeArgs();
      service.findMessagesAndDownloadFile.mockResolvedValueOnce([]);

      await resolver.findMessagesAndDownloadFile(args);

      expect(service.findMessagesAndDownloadFile).toHaveBeenCalledWith(args);
    });
  });
});
