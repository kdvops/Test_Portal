import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateFinanciallyDto } from './dto/create.financially.dto';
import { UpdateFinanciallyDto } from './dto/update.financially.dto';
import {
  ArgsFinancially,
  FinanciallyByGroupType,
  FinanciallyPostType,
} from './dto/args.financially.dto';

// IMPORT SERVICES
import { FinanciallyService } from './financially.service';

// IMPORT USER SCHEMA
import { Financially } from './schema/financially.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT INTERCEPTOR
import { SlugFinanciallyInterceptor } from './interceptor/financially.slug.interceptor';
import { FinanciallyPostPagination } from './financially.type';
import {
  normalizeCreateFinanciallyDto,
  validateArgsFinancially,
  validateFinanciallyId,
  validateUpdateFinanciallyDto,
} from './financially.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Financially)
export class FinanciallyResolver {
  constructor(private financiallyService: FinanciallyService) {}

  @Mutation(() => Financially)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateFinancially(
    @Args('UpdateFinanciallyDto') updateFinanciallyDto: UpdateFinanciallyDto,
  ) {
    const normalizedDto = validateUpdateFinanciallyDto(updateFinanciallyDto);
    return this.financiallyService.updateFinancially(normalizedDto);
  }

  @Mutation(() => Financially)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneFinancially(@Args('FinanciallyID') financiallyID: string) {
    const normalizedId = validateFinanciallyId(financiallyID);
    return this.financiallyService.cloneFinancially(normalizedId);
  }

  @Mutation(() => Financially)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishFinancially(@Args('FinanciallyID') financiallyID: string) {
    const normalizedId = validateFinanciallyId(financiallyID);
    return this.financiallyService.changeFinanciallyStatus(
      normalizedId,
      'publish',
    );
  }

  @Mutation(() => Financially)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftFinancially(@Args('FinanciallyID') financiallyID: string) {
    const normalizedId = validateFinanciallyId(financiallyID);
    return this.financiallyService.changeFinanciallyStatus(
      normalizedId,
      'draft',
    );
  }

  @Mutation(() => Financially)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createFinancially(
    @Args('CreateFinanciallyDto') createFinanciallyDto: CreateFinanciallyDto,
  ) {
    const normalizedDto = normalizeCreateFinanciallyDto(createFinanciallyDto);
    return this.financiallyService.createFinancially(normalizedDto);
  }

  @Mutation(() => Financially)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeFinancially(@Args('FinanciallyID') financiallyID: string) {
    const normalizedId = validateFinanciallyId(financiallyID);
    return this.financiallyService.removeFinancially(normalizedId);
  }

  @Mutation(() => Financially)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async toggleFinanciallyPin(@Args('FinanciallyID') financiallyID: string) {
    const normalizedId = validateFinanciallyId(financiallyID);
    return this.financiallyService.toggleFinanciallyPin(normalizedId);
  }

  @UseInterceptors(SlugFinanciallyInterceptor)
  @Query(() => [FinanciallyPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findFinancially(
    @Args('ArgsFinancially') argsFinancially: ArgsFinancially,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    validateArgsFinancially(argsFinancially);
    return this.financiallyService.findFinancially(argsFinancially, findAll);
  }

  @UseInterceptors(SlugFinanciallyInterceptor)
  @Query(() => FinanciallyPostPagination, {
    name: 'getFinanciallyPaginated',
  })
  async getFinanciallyPaginated(
    @Args('ArgsFinancially') argsFinancially: ArgsFinancially,
    @Args('findAll', { nullable: true }) findAll: boolean = false,
  ) {
    validateArgsFinancially(argsFinancially);
    return this.financiallyService.findFinanciallyPaginated(
      argsFinancially,
      findAll,
    );
  }

  @Query(() => [FinanciallyPostType])
  async getFinanciallyRelated(@Args('FinanciallyID') financiallyId: string) {
    const normalizedId = validateFinanciallyId(financiallyId);
    return this.financiallyService.getFinanciallyRelated(normalizedId);
  }

  @Query(() => [FinanciallyPostType])
  async getFinanciallyRecent(@Args('FinanciallyID') financiallyId: string) {
    const normalizedId = validateFinanciallyId(financiallyId);
    return this.financiallyService.getFinanciallyRecent(normalizedId);
  }

  @UseInterceptors(SlugFinanciallyInterceptor)
  @Query(() => [FinanciallyByGroupType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findFinanciallyGroupByType() {
    return this.financiallyService.findFinanciallyGroupByType();
  }

  @UseInterceptors(SlugFinanciallyInterceptor)
  @Query(() => FinanciallyPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findFinanciallyById(@Args('FinanciallyID') financiallyID: string) {
    const normalizedId = validateFinanciallyId(financiallyID);
    return this.financiallyService.findFinanciallyById(normalizedId);
  }

  @UseInterceptors(SlugFinanciallyInterceptor)
  @Query(() => FinanciallyPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findFinanciallyBySlug(@Args('Slug') slug: string) {
    return this.financiallyService.findFinanciallyBySlug(slug);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueFinanciallySlug(@Args('Slug') slug: string) {
    return this.financiallyService.findUniqueSlug(slug);
  }
}
