import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { FetchUsersArgsDto, UserType } from './dto/params.users.dto';

// IMPORT SERVICES
import { UserService } from './user.service';
import { AuthenticationService } from '../authentication/authentication.service';

// IMPORT USER SCHEMA
import { User } from './schema/user.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT DECORATORS
import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
import { RolesUser } from '../common/enums/roles.enum';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import {
  normalizeCreateUserDto,
  validateFetchUsersArgs,
  validateUpdateUserDto,
  validateUserId,
} from './user.validation';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private userService: UserService,
    private authenticationService: AuthenticationService,
  ) {}

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard)
  async updateUser(@Args('UpdateUserDto') updateUserDto: UpdateUserDto) {
    const normalized = validateUpdateUserDto(updateUserDto);
    return this.userService.updateUser(normalized);
  }

  @Mutation(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(RolesUser.admin)
  async createUser(@Args('CreateUserDto') createUserDto: CreateUserDto) {
    const normalized = normalizeCreateUserDto(createUserDto);
    return this.userService.createUser(normalized);
  }

  @Mutation(() => User)
  async register(@Args('CreateUserDto') createUserDto: CreateUserDto) {
    const normalized = normalizeCreateUserDto(createUserDto);
    return this.authenticationService.register(normalized);
  }

  @Query(() => [User])
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(RolesUser.admin)
  async users(@Args('FetchUsersArgsDto') fetchUsersArgsDto: FetchUsersArgsDto) {
    validateFetchUsersArgs(fetchUsersArgsDto);
    return this.userService.users(fetchUsersArgsDto);
  }

  @Query(() => UserType)
  @UseGuards(GqlAuthGuard)
  me(@CurrentUser() user: User) {
    return this.userService.findOneUser(user);
  }

  @Query(() => User)
  @UseGuards(GqlAuthGuard, RolesGuard)
  @Roles(RolesUser.admin)
  findUserById(@Args('userID') userID: string) {
    const normalizedId = validateUserId(userID);
    return this.userService.findUserById(normalizedId);
  }
}
