import { JwtStrategy } from './jwt.strategy';

describe('JwtStrategy', () => {
  it('returns user identity from payload', async () => {
    const strategy = new JwtStrategy();
    const payload = {
      _id: 'id',
      email: 'user@example.com',
      roles: ['admin'],
      extra: 'ignored',
    };

    await expect(strategy.validate(payload)).resolves.toEqual({
      _id: 'id',
      email: 'user@example.com',
      roles: ['admin'],
    });
  });
});
