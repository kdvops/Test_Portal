import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT OBJECT TYPE
import { LoginDto, LoginResponse } from './dto/login.dto';

// IMPORT GUARD AUTH
import { AuthenticationGuard } from '../common/guards/local.guard';

// IMPORT SERVICES
import { AuthenticationService } from './authentication.service';

@Resolver()
export class AuthenticationResolver {
  constructor(private authenticationService: AuthenticationService) {}

  @Mutation(() => LoginResponse)
  @UseGuards(AuthenticationGuard)
  login(@Args('LoginDto') loginDto: LoginDto, @Context() context) {
    return this.authenticationService.login(context.req.user);
  }
}
