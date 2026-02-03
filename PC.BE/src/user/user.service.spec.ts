import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { UserService } from './user.service';
import { User } from './schema/user.schema';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';
import { AuthenticationProvider } from 'src/authentication/providers/authentication.providers';

const makeObjectId = () => new Types.ObjectId();

const makeQueryMock = <T = any>(value: T) => {
  const query: any = {
    select: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(value),
  };
  return query;
};

describe('UserService', () => {
  let service: UserService;
  let userModel: any;
  let authProvider: jest.Mocked<AuthenticationProvider>;
  let azureService: jest.Mocked<AzureBlobStorageService>;
  const testPassword = 'test-password'; // NOSONAR - test-only credential
  const testHash = 'test-hash'; // NOSONAR - test-only hash

  beforeEach(async () => {
    userModel = {
      create: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      aggregate: jest.fn(),
      findOneAndUpdate: jest.fn(),
    };

    authProvider = {
      generateHash: jest.fn(),
    } as any;

    azureService = {
      upload: jest.fn(),
      remove: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: AuthenticationProvider, useValue: authProvider },
        { provide: AzureBlobStorageService, useValue: azureService },
      ],
    }).compile();

    service = module.get<UserService>(UserService);

    jest.clearAllMocks();
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) => ({
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    birthday: new Date('1990-01-01'),
    password: testPassword,
    country: 'DO',
    phone: '8090000000',
    ...overrides,
  });

  const makeUpdateDto = (overrides: Record<string, any> = {}) => ({
    userID: makeObjectId(),
    newUploadAvatar: [],
    user: {
      firstName: 'Jane',
      lastName: 'Doe',
      avatar: null,
    },
    ...overrides,
  });

  describe('createUser', () => {
    it('hashes password and builds display name', async () => {
      authProvider.generateHash.mockResolvedValueOnce(testHash);
      userModel.create.mockResolvedValueOnce({ _id: makeObjectId() });

      await service.createUser(makeCreateDto());

      const payload = userModel.create.mock.calls[0][0];
      expect(payload.password).toBe(testHash);
      expect(payload.displayName).toBe('JD');
    });
  });

  describe('findOneUser', () => {
    it('finds by email', async () => {
      userModel.findOne.mockReturnValueOnce(makeQueryMock({ _id: '1' }));

      await expect(service.findOneUser({ email: 'a@b.com' })).resolves.toEqual({
        _id: '1',
      });
    });
  });

  describe('findUserById', () => {
    it('finds by id', async () => {
      const id = makeObjectId();
      userModel.findById.mockReturnValueOnce(makeQueryMock({ _id: id }));

      await expect(service.findUserById(id)).resolves.toEqual({ _id: id });
    });
  });

  describe('users', () => {
    it('builds search pipeline', async () => {
      userModel.aggregate.mockReturnValueOnce([]);

      await service.users({ search: 'jane' } as any);

      expect(userModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('updateUser', () => {
    it('updates and uses existing avatar when no upload', async () => {
      const dto = makeUpdateDto({
        user: { ...makeUpdateDto().user, avatar: 'https://img/avatar.png' },
      });
      userModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ _id: dto.userID }),
      });

      await service.updateUser(dto as any);

      const payload = userModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.avatar).toBe('https://img/avatar.png');
    });

    it('uses uploaded avatar when provided', async () => {
      const dto = makeUpdateDto({
        newUploadAvatar: [{ img: 'base64', filetype: 'png' }],
      });
      userModel.findOneAndUpdate.mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ _id: dto.userID }),
      });
      jest
        .spyOn(service, 'checkUploadImageUser')
        .mockResolvedValueOnce('https://img/new.png');

      await service.updateUser(dto as any);

      const payload = userModel.findOneAndUpdate.mock.calls[0][1];
      expect(payload.avatar).toBe('https://img/new.png');
    });
  });

  describe('removeFiles', () => {
    it('skips removal when user is missing', async () => {
      userModel.findById.mockReturnValueOnce(makeQueryMock(null));

      await service.removeFiles('avatar', null, makeObjectId());

      expect(azureService.remove).not.toHaveBeenCalled();
    });
  });
});
