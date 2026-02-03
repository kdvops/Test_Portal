import * as bcrypt from 'bcrypt';

export class AuthenticationProvider {
  async generateHash(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}
