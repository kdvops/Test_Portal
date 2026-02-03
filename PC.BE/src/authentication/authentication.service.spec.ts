import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';

import { AuthenticationService } from './authentication.service';
import { UserService } from '../user/user.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const mockCompare = compare as jest.Mock;

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let userService: jest.Mocked<UserService>;
  let jwtService: jest.Mocked<JwtService>;
  const testPassword = 'test-password'; // NOSONAR - test-only credential
  const testHash = 'test-hash'; // NOSONAR - test-only hash

  beforeEach(async () => {
    const userServiceMock: jest.Mocked<UserService> = {
      findOneUser: jest.fn(),
      createUser: jest.fn(),
    } as any;
    const jwtServiceMock: jest.Mocked<JwtService> = {
      sign: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationService,
        { provide: UserService, useValue: userServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthenticationService>(AuthenticationService);
    userService = module.get(UserService) as jest.Mocked<UserService>;
    jwtService = module.get(JwtService) as jest.Mocked<JwtService>;

    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('returns null when user does not exist', async () => {
      userService.findOneUser.mockResolvedValueOnce(null as any);

      await expect(
        service.validateUser('user@example.com', testPassword),
      ).resolves.toBeNull();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it('returns null when user has no password', async () => {
      userService.findOneUser.mockResolvedValueOnce({
        email: 'a@b.com',
      } as any);

      await expect(
        service.validateUser('user@example.com', testPassword),
      ).resolves.toBeNull();
      expect(mockCompare).not.toHaveBeenCalled();
    });

    it('returns null when password comparison fails', async () => {
      userService.findOneUser.mockResolvedValueOnce({
        email: 'user@example.com',
        password: testHash,
      } as any);
      mockCompare.mockResolvedValueOnce(false);

      await expect(
        service.validateUser('user@example.com', testPassword),
      ).resolves.toBeNull();
    });

    it('returns user when password comparison succeeds', async () => {
      const user = {
        _id: 'user-id',
        email: 'user@example.com',
        password: testHash,
      };
      userService.findOneUser.mockResolvedValueOnce(user as any);
      mockCompare.mockResolvedValueOnce(true);

      await expect(
        service.validateUser('user@example.com', testPassword),
      ).resolves.toBe(user);
    });
  });

  describe('login', () => {
    it('returns a token payload with expiration', async () => {
      const nowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);
      jwtService.sign.mockReturnValueOnce('signed-token');
      const user = { _id: 'id', email: 'user@example.com', roles: ['admin'] };

      const result = await service.login(user as any);

      expect(jwtService.sign).toHaveBeenCalledWith({
        _id: user._id,
        email: user.email,
        roles: user.roles,
      });
      expect(result.token.access_token).toBe('signed-token');
      expect(result.token.token_type).toBe('Bearer');
      expect(result.token.expired_in).toBe(4600);
      nowSpy.mockRestore();
    });
  });

  describe('register', () => {
    it('throws when email is already registered', async () => {
      userService.findOneUser.mockResolvedValueOnce({ _id: 'id' } as any);

      await expect(
        service.register({ email: 'user@example.com' } as any),
      ).rejects.toThrow('Ya existe este correo registrado!');
      expect(userService.createUser).not.toHaveBeenCalled();
    });

    it('creates user when email is available', async () => {
      const dto = { email: 'user@example.com', password: testPassword };
      userService.findOneUser.mockResolvedValueOnce(null as any);
      userService.createUser.mockResolvedValueOnce({ _id: 'id' } as any);

      await service.register(dto as any);

      expect(userService.createUser).toHaveBeenCalledWith(dto);
    });
  });
});
