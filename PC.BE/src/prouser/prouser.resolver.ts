import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateProuserDto } from './dto/create.prouser.dto';
import { UpdateProuserDto } from './dto/update.prouser.dto';
import {
  ArgsProuser,
  ProuserByGroupType,
  ProuserPostType,
  ProuserValidateDocumentType,
} from './dto/args.prouser.dto';

// IMPORT SERVICES
import { ProuserService } from './prouser.service';

// IMPORT USER SCHEMA
import { Prouser } from './schema/prouser.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SlugProuserInterceptor } from './interceptor/prouser.slug.interceptor';
import {
  normalizeCreateProuserDto,
  validateArgsProuser,
  validateProuserId,
  validateUpdateProuserDto,
} from './prouser.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Prouser)
export class ProuserResolver {
  constructor(private prouserService: ProuserService) {}

  @Mutation(() => Prouser)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateProuser(
    @Args('UpdateProuserDto') updateProuserDto: UpdateProuserDto,
  ) {
    const normalizedDto = validateUpdateProuserDto(updateProuserDto);
    return this.prouserService.updateProuser(normalizedDto);
  }

  @Mutation(() => Prouser)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createProuser(
    @Args('CreateProuserDto') createProuserDto: CreateProuserDto,
  ) {
    const normalizedDto = normalizeCreateProuserDto(createProuserDto);
    return this.prouserService.createProuser(normalizedDto);
  }

  @Mutation(() => Prouser)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneProuser(@Args('ProuserID') prouserID: string) {
    const normalizedId = validateProuserId(prouserID);
    return this.prouserService.cloneProuser(normalizedId);
  }

  @Mutation(() => Prouser)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishProuser(@Args('ProuserID') prouserID: string) {
    const normalizedId = validateProuserId(prouserID);
    return this.prouserService.changeProuserStatus(normalizedId, 'publish');
  }

  @Mutation(() => Prouser)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftProuser(@Args('ProuserID') prouserID: string) {
    const normalizedId = validateProuserId(prouserID);
    return this.prouserService.changeProuserStatus(normalizedId, 'draft');
  }

  @Mutation(() => Prouser)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeProuser(@Args('ProuserID') prouserID: string) {
    const normalizedId = validateProuserId(prouserID);
    return this.prouserService.removeProuser(normalizedId);
  }

  @UseInterceptors(SlugProuserInterceptor)
  @Query(() => [ProuserPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findProuserByCategory(
    @Args('Category') category: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.prouserService.findProuserByCategory(category, findAll);
  }

  @UseInterceptors(SlugProuserInterceptor)
  @Query(() => ProuserValidateDocumentType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findProuserValidationDocument(
    @Args('DocumentNumber') documentNumber: string,
  ) {
    return this.prouserService.findProuserValidationDocument(documentNumber);
  }

  @UseInterceptors(SlugProuserInterceptor)
  @Query(() => [ProuserPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findProuser(@Args('ArgsProuser') argsProuser: ArgsProuser) {
    validateArgsProuser(argsProuser);
    return this.prouserService.findProuser(argsProuser);
  }

  @UseInterceptors(SlugProuserInterceptor)
  @Query(() => [ProuserByGroupType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findProuserGroupByType(
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.prouserService.findProuserGroupByType(findAll);
  }

  @UseInterceptors(SlugProuserInterceptor)
  @Query(() => ProuserPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findProuserById(@Args('ProuserID') prouserID: string) {
    const normalizedId = validateProuserId(prouserID);
    return this.prouserService.findProuserById(normalizedId);
  }

  @UseInterceptors(SlugProuserInterceptor)
  @Query(() => ProuserPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findProuserBySlug(@Args('Slug') slug: string) {
    return this.prouserService.findProuserBySlug(slug);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueProuserSlug(@Args('Slug') slug: string) {
    return this.prouserService.findUniqueSlug(slug);
  }
}
