import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateEnterpriseDto } from './dto/create.enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update.enterprise.dto';
import {
  ArgsEnterprise,
  EnterpriseByGroupType,
  EnterprisePostType,
} from './dto/args.enterprise.dto';

// IMPORT SERVICES
import { EnterpriseService } from './enterprise.service';

// IMPORT USER SCHEMA
import { Enterprise } from './schema/enterprise.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SlugEnterpriseInterceptor } from './interceptor/enterprise.slug.interceptor';
import {
  normalizeCreateEnterpriseDto,
  validateArgsEnterprise,
  validateEnterpriseId,
  validateUpdateEnterpriseDto,
} from './enterprise.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Enterprise)
export class EnterpriseResolver {
  constructor(private enterpriseService: EnterpriseService) {}

  @Mutation(() => Enterprise)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateEnterprise(
    @Args('UpdateEnterpriseDto') updateEnterpriseDto: UpdateEnterpriseDto,
  ) {
    const normalizedDto = validateUpdateEnterpriseDto(updateEnterpriseDto);
    return this.enterpriseService.updateEnterprise(normalizedDto);
  }

  @Mutation(() => Enterprise)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createEnterprise(
    @Args('CreateEnterpriseDto') createEnterpriseDto: CreateEnterpriseDto,
  ) {
    const normalizedDto = normalizeCreateEnterpriseDto(createEnterpriseDto);
    return this.enterpriseService.createEnterprise(normalizedDto);
  }

  @Mutation(() => Enterprise)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneEnterprise(@Args('EnterpriseID') enterpriseID: string) {
    const normalizedId = validateEnterpriseId(enterpriseID);
    return this.enterpriseService.cloneEnterprise(normalizedId);
  }

  @Mutation(() => Enterprise)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishEnterprise(@Args('EnterpriseID') enterpriseID: string) {
    const normalizedId = validateEnterpriseId(enterpriseID);
    return this.enterpriseService.changeEnterpriseStatus(
      normalizedId,
      'publish',
    );
  }

  @Mutation(() => Enterprise)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftEnterprise(@Args('EnterpriseID') enterpriseID: string) {
    const normalizedId = validateEnterpriseId(enterpriseID);
    return this.enterpriseService.changeEnterpriseStatus(normalizedId, 'draft');
  }

  @Mutation(() => Enterprise)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeEnterprise(@Args('EnterpriseID') enterpriseID: string) {
    const normalizedId = validateEnterpriseId(enterpriseID);
    return this.enterpriseService.removeEnterprise(normalizedId);
  }

  @UseInterceptors(SlugEnterpriseInterceptor)
  @Query(() => [EnterprisePostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findEnterpriseByCategory(
    @Args('Category') category: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.enterpriseService.findEnterpriseByCategory(category, findAll);
  }

  @UseInterceptors(SlugEnterpriseInterceptor)
  @Query(() => [EnterprisePostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findEnterprise(@Args('ArgsEnterprise') argsEnterprise: ArgsEnterprise) {
    validateArgsEnterprise(argsEnterprise);
    return this.enterpriseService.findEnterprise(argsEnterprise);
  }

  @UseInterceptors(SlugEnterpriseInterceptor)
  @Query(() => [EnterpriseByGroupType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findEnterpriseGroupByType(    
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.enterpriseService.findEnterpriseGroupByType(findAll);
  }

  @UseInterceptors(SlugEnterpriseInterceptor)
  @Query(() => EnterprisePostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findEnterpriseById(@Args('EnterpriseID') enterpriseID: string) {
    const normalizedId = validateEnterpriseId(enterpriseID);
    return this.enterpriseService.findEnterpriseById(normalizedId);
  }

  @UseInterceptors(SlugEnterpriseInterceptor)
  @Query(() => EnterprisePostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findEnterpriseBySlug(@Args('Slug') slug: string) {
    return this.enterpriseService.findEnterpriseBySlug(slug);
  }
      
  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueEnterpriseSlug(@Args('Slug') slug: string) {
    return this.enterpriseService.findUniqueSlug(slug);
  }
}
