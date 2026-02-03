import { Test, TestingModule } from '@nestjs/testing';

import { AuthenticationResolver } from './authentication.resolver';
import { AuthenticationService } from './authentication.service';

describe('AuthenticationResolver', () => {
  let resolver: AuthenticationResolver;
  let service: jest.Mocked<AuthenticationService>;

  beforeEach(async () => {
    const serviceMock: jest.Mocked<AuthenticationService> = {
      login: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthenticationResolver,
        { provide: AuthenticationService, useValue: serviceMock },
      ],
    }).compile();

    resolver = module.get<AuthenticationResolver>(AuthenticationResolver);
    service = module.get(
      AuthenticationService,
    ) as jest.Mocked<AuthenticationService>;
  });

  it('delegates login with context user', async () => {
    const user = { _id: 'id', email: 'user@example.com', roles: [] };
    const testPassword = 'test-password'; // NOSONAR - test-only credential
    service.login.mockResolvedValueOnce({
      token: { access_token: 'token' },
    } as any);

    await resolver.login(
      { email: 'user@example.com', password: testPassword } as any,
      {
        req: { user },
      } as any,
    );

    expect(service.login).toHaveBeenCalledWith(user);
  });
});
