import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
import { Types } from 'mongoose';

// IMPORT INPUTS / DTO
import { CreateBusinessDto } from './dto/create.business.dto';
import { UpdateBusinessDto } from './dto/update.business.dto';
import {
  ArgsBusiness,
  BusinessByGroupType,
  BusinessPostType,
} from './dto/args.business.dto';

// IMPORT SERVICES
import { BusinessService } from './business.service';

// IMPORT USER SCHEMA
import { Business } from './schema/business.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT INTERCEPTOR
import { SlugBusinessInterceptor } from './interceptor/business.slug.interceptor';
import {
  normalizeCreateBusinessDto,
  validateArgsBusiness,
  validateBusinessId,
  validateUpdateBusinessDto,
} from './business.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Business)
export class BusinessResolver {
  constructor(private businessService: BusinessService) {}

  @Mutation(() => Business)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateBusiness(
    @Args('UpdateBusinessDto') updateBusinessDto: UpdateBusinessDto,
  ) {
    const normalizedDto = validateUpdateBusinessDto(updateBusinessDto);
    return this.businessService.updateBusiness(normalizedDto);
  }

  @Mutation(() => Business)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createBusiness(
    @Args('CreateBusinessDto') createBusinessDto: CreateBusinessDto,
  ) {
    const normalizedDto = normalizeCreateBusinessDto(createBusinessDto);
    return this.businessService.createBusiness(normalizedDto);
  }

  @Mutation(() => Business)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneBusiness(@Args('BusinessID') businessID: string) {
    const normalizedId = validateBusinessId(businessID);
    return this.businessService.cloneBusiness(normalizedId);
  }

  @Mutation(() => Business)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishBusiness(@Args('BusinessID') businessID: string) {
    const normalizedId = validateBusinessId(businessID);
    return this.businessService.changeBusinessStatus(normalizedId, 'publish');
  }

  @Mutation(() => Business)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftBusiness(@Args('BusinessID') businessID: string) {
    const normalizedId = validateBusinessId(businessID);
    return this.businessService.changeBusinessStatus(normalizedId, 'draft');
  }

  @Mutation(() => Business)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeBusiness(@Args('BusinessID') businessID: string) {
    const normalizedId = validateBusinessId(businessID);
    return this.businessService.removeBusiness(normalizedId);
  }

  @UseInterceptors(SlugBusinessInterceptor)
  @Query(() => [BusinessPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findBusinessByCategory(
    @Args('Category') category: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.businessService.findBusinessByCategory(category, findAll);
  }

  @UseInterceptors(SlugBusinessInterceptor)
  @Query(() => [BusinessPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findBusiness(@Args('ArgsBusiness') argsBusiness: ArgsBusiness) {
    validateArgsBusiness(argsBusiness);
    return this.businessService.findBusiness(argsBusiness);
  }

  @UseInterceptors(SlugBusinessInterceptor)
  @Query(() => [BusinessByGroupType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findBusinessGroupByType(
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.businessService.findBusinessGroupByType(findAll);
  }

  @UseInterceptors(SlugBusinessInterceptor)
  @Query(() => BusinessPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findBusinessById(@Args('BusinessID') businessID: string) {
    const normalizedId = validateBusinessId(businessID);
    return this.businessService.findBusinessById(normalizedId);
  }

  @UseInterceptors(SlugBusinessInterceptor)
  @Query(() => BusinessPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findBusinessBySlug(@Args('Slug') slug: string) {
    return this.businessService.findBusinessBySlug(slug);
  }
    
  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueBusinessSlug(@Args('Slug') slug: string) {
    return this.businessService.findUniqueSlug(slug);
  }
}
