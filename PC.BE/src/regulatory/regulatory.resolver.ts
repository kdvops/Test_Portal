import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateRegulatoryDto } from './dto/create.regulatory.dto';
import { UpdateRegulatoryDto } from './dto/update.regulatory.dto';
import {
  ArgsRegulatory,
  RegulatoryByGroupType,
  RegulatoryPostType,
} from './dto/args.regulatory.dto';

// IMPORT SERVICES
import { RegulatoryService } from './regulatory.service';

// IMPORT USER SCHEMA
import { Regulatory } from './schema/regulatory.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT INTERCEPTOR
import { SlugRegulatoryInterceptor } from './interceptor/regulatory.slug.interceptor';
import {
  normalizeCreateRegulatoryDto,
  validateArgsRegulatory,
  validateRegulatoryId,
  validateUpdateRegulatoryDto,
} from './regulatory.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Regulatory)
export class RegulatoryResolver {
  constructor(private regulatoryService: RegulatoryService) {}

  @Mutation(() => Regulatory)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateRegulatory(
    @Args('UpdateRegulatoryDto') updateRegulatoryDto: UpdateRegulatoryDto,
  ) {
    const normalized = validateUpdateRegulatoryDto(updateRegulatoryDto);
    return this.regulatoryService.updateRegulatory(normalized);
  }

  @Mutation(() => Regulatory)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createRegulatory(
    @Args('CreateRegulatoryDto') createRegulatoryDto: CreateRegulatoryDto,
  ) {
    const normalized = normalizeCreateRegulatoryDto(createRegulatoryDto);
    return this.regulatoryService.createRegulatory(normalized);
  }

  @Mutation(() => Regulatory)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneRegulatory(@Args('RegulatoryID') regulatoryID: string) {
    const normalizedId = validateRegulatoryId(regulatoryID);
    return this.regulatoryService.cloneRegulatory(normalizedId);
  }

  @Mutation(() => Regulatory)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishRegulatory(@Args('RegulatoryID') regulatoryID: string) {
    const normalizedId = validateRegulatoryId(regulatoryID);
    return this.regulatoryService.changeRegulatoryStatus(
      normalizedId,
      'publish',
    );
  }

  @Mutation(() => Regulatory)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftRegulatory(@Args('RegulatoryID') regulatoryID: string) {
    const normalizedId = validateRegulatoryId(regulatoryID);
    return this.regulatoryService.changeRegulatoryStatus(
      normalizedId,
      'draft',
    );
  }

  @Mutation(() => Regulatory)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeRegulatory(@Args('RegulatoryID') regulatoryID: string) {
    const normalizedId = validateRegulatoryId(regulatoryID);
    return this.regulatoryService.removeRegulatory(normalizedId);
  }

  @UseInterceptors(SlugRegulatoryInterceptor)
  @Query(() => [RegulatoryPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findRegulatoryByCategory(
    @Args('Category') category: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.regulatoryService.findRegulatoryByCategory(category, findAll);
  }

  @UseInterceptors(SlugRegulatoryInterceptor)
  @Query(() => [RegulatoryPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findRegulatory(@Args('ArgsRegulatory') argsRegulatory: ArgsRegulatory) {
    validateArgsRegulatory(argsRegulatory);
    return this.regulatoryService.findRegulatory(argsRegulatory);
  }

  @UseInterceptors(SlugRegulatoryInterceptor)
  @Query(() => [RegulatoryByGroupType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findRegulatoryGroupByType(
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.regulatoryService.findRegulatoryGroupByType(findAll);
  }

  @UseInterceptors(SlugRegulatoryInterceptor)
  @Query(() => RegulatoryPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findRegulatoryById(@Args('RegulatoryID') regulatoryID: string) {
    const normalizedId = validateRegulatoryId(regulatoryID);
    return this.regulatoryService.findRegulatoryById(normalizedId);
  }

  @UseInterceptors(SlugRegulatoryInterceptor)
  @Query(() => RegulatoryPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findRegulatoryBySlug(@Args('Slug') slug: string) {
    return this.regulatoryService.findRegulatoryBySlug(slug);
  }
      
  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueRegulatorySlug(@Args('Slug') slug: string) {
    return this.regulatoryService.findUniqueSlug(slug);
  }
}
