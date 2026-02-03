import { Injectable } from '@nestjs/common';

// IMPORT BCRYPT
import { compare } from 'bcrypt';

// IMPORT USER SERVICES
import { UserService } from '../user/user.service';

// IMPORT DTO / INPUTS
import { CreateUserDto } from '../user/dto/create.user.dto';

// IMPORT JWT
import { JwtService } from '@nestjs/jwt';

// IMPORT SCHEMA
import { User } from '../user/schema/user.schema';

@Injectable()
export class AuthenticationService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findOneUser({ email: email });

    const validPassword =
      user && user.password ? await compare(password, user.password) : false;

    return user && validPassword ? user : null;
  }

  async login(user: User): Promise<any> {
    const expDateToken = Math.floor(Date.now() / 1000) + 60 * 60;
    return {
      token: {
        access_token: this.jwtService.sign({
          _id: user._id,
          email: user.email,
          roles: user.roles,
        }),
        expired_in: expDateToken,
        token_type: 'Bearer',
      },
    };
  }

  async register(createUserDto: CreateUserDto): Promise<any> {
    const user = await this.userService.findOneUser({
      email: createUserDto.email,
    });

    // VALIDATE EMAIL IN USE
    if (user) {
      throw new Error('Ya existe este correo registrado!');
    }

    return this.userService.createUser({ ...createUserDto });
  }
}
