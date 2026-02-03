import { UnauthorizedException } from '@nestjs/common';

import { LocalStrategy } from './local.strategy';
import { AuthenticationService } from '../authentication.service';

describe('LocalStrategy', () => {
  let strategy: LocalStrategy;
  let authenticationService: jest.Mocked<AuthenticationService>;

  beforeEach(() => {
    authenticationService = {
      validateUser: jest.fn(),
    } as any;
    strategy = new LocalStrategy(authenticationService);
  });

  it('throws when credentials are invalid', async () => {
    authenticationService.validateUser.mockResolvedValueOnce(null);

    await expect(strategy.validate('user@example.com', 'bad')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('returns user when credentials are valid', async () => {
    const user = { _id: 'id' };
    authenticationService.validateUser.mockResolvedValueOnce(user as any);

    await expect(
      strategy.validate('user@example.com', 'good'),
    ).resolves.toBe(user);
  });
});
