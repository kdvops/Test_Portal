import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';
// IMPORT INPUTS / DTO
import { CreateInsuranceDto } from './dto/create.insurance.dto';
import { UpdateInsuranceDto } from './dto/update.insurance.dto';
import {
  ArgsInsurance,
  InsuranceByGroupType,
  InsurancePostType,
} from './dto/args.insurance.dto';

// IMPORT SERVICES
import { InsuranceService } from './insurance.service';

// IMPORT USER SCHEMA
import { Insurance } from './schema/insurance.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { SlugInsuranceInterceptor } from './interceptor/insurance.slug.interceptor';
import {
  normalizeCreateInsuranceDto,
  validateArgsInsurance,
  validateInsuranceId,
  validateUpdateInsuranceDto,
} from './insurance.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Insurance)
export class InsuranceResolver {
  constructor(private insuranceService: InsuranceService) {}

  @Mutation(() => Insurance)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateInsurance(
    @Args('UpdateInsuranceDto') updateInsuranceDto: UpdateInsuranceDto,
  ) {
    const normalizedDto = validateUpdateInsuranceDto(updateInsuranceDto);
    return this.insuranceService.updateInsurance(normalizedDto);
  }

  @Mutation(() => Insurance)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createInsurance(
    @Args('CreateInsuranceDto') createInsuranceDto: CreateInsuranceDto,
  ) {
    const normalizedDto = normalizeCreateInsuranceDto(createInsuranceDto);
    return this.insuranceService.createInsurance(normalizedDto);
  }

  @Mutation(() => Insurance)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneInsurance(@Args('InsuranceID') insuranceID: string) {
    const normalizedId = validateInsuranceId(insuranceID);
    return this.insuranceService.cloneInsurance(normalizedId);
  }

  @Mutation(() => Insurance)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishInsurance(@Args('InsuranceID') insuranceID: string) {
    const normalizedId = validateInsuranceId(insuranceID);
    return this.insuranceService.changeInsuranceStatus(normalizedId, 'publish');
  }

  @Mutation(() => Insurance)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftInsurance(@Args('InsuranceID') insuranceID: string) {
    const normalizedId = validateInsuranceId(insuranceID);
    return this.insuranceService.changeInsuranceStatus(normalizedId, 'draft');
  }

  @Mutation(() => Insurance)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeInsurance(@Args('InsuranceID') insuranceID: string) {
    const normalizedId = validateInsuranceId(insuranceID);
    return this.insuranceService.removeInsurance(normalizedId);
  }

  @UseInterceptors(SlugInsuranceInterceptor)
  @Query(() => [InsurancePostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findInsuranceByCategory(
    @Args('Category') category: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.insuranceService.findInsuranceByCategory(category, findAll);
  }

  @UseInterceptors(SlugInsuranceInterceptor)
  @Query(() => [InsurancePostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findInsurance(@Args('ArgsInsurance') argsInsurance: ArgsInsurance) {
    validateArgsInsurance(argsInsurance);
    return this.insuranceService.findInsurance(argsInsurance);
  }

  @UseInterceptors(SlugInsuranceInterceptor)
  @Query(() => [InsuranceByGroupType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findInsuranceGroupByType(
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.insuranceService.findInsuranceGroupByType(findAll);
  }

  @UseInterceptors(SlugInsuranceInterceptor)
  @Query(() => InsurancePostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findInsuranceById(@Args('InsuranceID') insuranceID: string) {
    const normalizedId = validateInsuranceId(insuranceID);
    return this.insuranceService.findInsuranceById(normalizedId);
  }

  @Query(() => InsurancePostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findInsuranceBySlug(@Args('Slug') slug: string) {
    return this.insuranceService.findInsuranceBySlug(slug);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueInsuranceSlug(@Args('Slug') slug: string) {
    return this.insuranceService.findUniqueSlug(slug);
  }
}
