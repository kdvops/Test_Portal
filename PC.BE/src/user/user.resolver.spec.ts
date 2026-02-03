import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';

import { UserResolver } from './user.resolver';
import { UserService } from './user.service';
import { AuthenticationService } from '../authentication/authentication.service';
import { User } from './schema/user.schema';

describe('UserResolver', () => {
  let resolver: UserResolver;
  let userService: jest.Mocked<UserService>;
  let authService: jest.Mocked<AuthenticationService>;
  const testPassword = 'test-password'; // NOSONAR - test-only credential

  beforeEach(async () => {
    const userServiceMock: jest.Mocked<UserService> = {
      updateUser: jest.fn(),
      createUser: jest.fn(),
      findOneUser: jest.fn(),
      users: jest.fn(),
      findUserById: jest.fn(),
      findUserByRoles: jest.fn(),
    } as any;

    const authServiceMock: jest.Mocked<AuthenticationService> = {
      register: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserResolver,
        { provide: UserService, useValue: userServiceMock },
        { provide: AuthenticationService, useValue: authServiceMock },
        { provide: getModelToken(User.name), useValue: {} },
      ],
    }).compile();

    resolver = module.get<UserResolver>(UserResolver);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    authService = module.get(
      AuthenticationService,
    ) as jest.Mocked<AuthenticationService>;
  });

  const makeCreateDto = (overrides: Record<string, any> = {}) =>
    ({
      firstName: 'Jane',
      lastName: 'Doe',
      email: 'jane@example.com',
      birthday: new Date('1990-01-01'),
      password: testPassword,
      country: 'DO',
      phone: '8090000000',
      ...overrides,
    }) as any;

  const makeUpdateDto = (overrides: Record<string, any> = {}) =>
    ({
      userID: new Types.ObjectId(),
      newUploadAvatar: [],
      user: {
        firstName: 'Jane',
        lastName: 'Doe',
        avatar: null,
      },
      ...overrides,
    }) as any;

  describe('invalid ids', () => {
    it('rejects findUserById', () => {
      expect(() => resolver.findUserById('not-an-id')).toThrow(
        'Invalid userID',
      );
      expect(userService.findUserById).not.toHaveBeenCalled();
    });
  });

  describe('createUser', () => {
    it('delegates with valid payload', async () => {
      userService.createUser.mockResolvedValueOnce({} as any);

      await resolver.createUser(makeCreateDto());

      expect(userService.createUser).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com' }),
      );
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.createUser(makeCreateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(userService.createUser).not.toHaveBeenCalled();
    });
  });

  describe('register', () => {
    it('delegates with valid payload', async () => {
      authService.register.mockResolvedValueOnce({} as any);

      await resolver.register(makeCreateDto());

      expect(authService.register).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'jane@example.com' }),
      );
    });
  });

  describe('updateUser', () => {
    it('delegates with valid payload', async () => {
      const dto = makeUpdateDto();
      userService.updateUser.mockResolvedValueOnce({} as any);

      await resolver.updateUser(dto);

      expect(userService.updateUser).toHaveBeenCalledWith(dto);
    });

    it('rejects extra fields', async () => {
      await expect(
        resolver.updateUser(makeUpdateDto({ extra: 'bad' })),
      ).rejects.toThrow(BadRequestException);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });

    it('rejects extra user fields', async () => {
      await expect(
        resolver.updateUser(
          makeUpdateDto({
            user: { ...makeUpdateDto().user, extra: 'bad' },
          }),
        ),
      ).rejects.toThrow(BadRequestException);
      expect(userService.updateUser).not.toHaveBeenCalled();
    });
  });

  describe('users', () => {
    it('rejects missing args', async () => {
      await expect(resolver.users(undefined as any)).rejects.toThrow(
        BadRequestException,
      );
      expect(userService.users).not.toHaveBeenCalled();
    });

    it('rejects extra query fields', async () => {
      await expect(
        resolver.users({ search: '', extra: 'bad' } as any),
      ).rejects.toThrow(BadRequestException);
      expect(userService.users).not.toHaveBeenCalled();
    });

    it('delegates with valid args', async () => {
      userService.users.mockResolvedValueOnce([]);

      await resolver.users({ search: 'jane' } as any);

      expect(userService.users).toHaveBeenCalledWith({ search: 'jane' });
    });
  });
});
