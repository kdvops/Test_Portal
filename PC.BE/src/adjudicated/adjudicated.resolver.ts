import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateAdjudicatedDto } from './dto/create.adjudicated.dto';
import { UpdateAdjudicatedDto } from './dto/update.adjudicated.dto';
import {
  AdjudicatedProductsByGroupCategory,
  ArgsAdjudicated,
} from './dto/args.adjudicated.dto';

// IMPORT SERVICES
import { AdjudicatedService } from './adjudicated.service';

// IMPORT USER SCHEMA
import { Adjudicated } from './schema/adjudicated.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  normalizeCreateAdjudicatedDto,
  validateAdjudicatedId,
  validateArgsAdjudicated,
  validateUpdateAdjudicatedDto,
} from './adjudicated.validation';

@Resolver(() => Adjudicated)
export class AdjudicatedResolver {
  constructor(private adjudicatedService: AdjudicatedService) {}

  @Mutation(() => Adjudicated)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateAdjudicated(
    @Args('UpdateAdjudicatedDto') updateAdjudicatedDto: UpdateAdjudicatedDto,
  ) {
    const normalizedDto = validateUpdateAdjudicatedDto(updateAdjudicatedDto);
    return this.adjudicatedService.updateAdjudicated(normalizedDto);
  }

  @Mutation(() => Adjudicated)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneAdjudicated(@Args('AdjudicatedID') adjudicatedID: string) {
    const normalizedId = validateAdjudicatedId(adjudicatedID);
    return this.adjudicatedService.cloneAdjudicated(normalizedId);
  }

  @Mutation(() => Adjudicated)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishAdjudicated(@Args('AdjudicatedID') adjudicatedID: string) {
    const normalizedId = validateAdjudicatedId(adjudicatedID);
    return this.adjudicatedService.changeAdjudicatedStatus(
      normalizedId,
      'publish',
    );
  }

  @Mutation(() => Adjudicated)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftAdjudicated(@Args('AdjudicatedID') adjudicatedID: string) {
    const normalizedId = validateAdjudicatedId(adjudicatedID);
    return this.adjudicatedService.changeAdjudicatedStatus(
      normalizedId,
      'draft',
    );
  }

  @Mutation(() => Adjudicated)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeAdjudicated(@Args('AdjudicatedID') adjudicatedID: string) {
    const normalizedId = validateAdjudicatedId(adjudicatedID);
    return this.adjudicatedService.removeAdjudicated(normalizedId);
  }

  @Mutation(() => Adjudicated)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createAdjudicated(
    @Args('CreateAdjudicatedDto') createAdjudicatedDto: CreateAdjudicatedDto,
  ) {
    const normalizedDto = normalizeCreateAdjudicatedDto(createAdjudicatedDto);
    return this.adjudicatedService.createAdjudicated(normalizedDto);
  }

  @Query(() => [AdjudicatedProductsByGroupCategory])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findAdjudicatedProductsGroupByCategory(
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.adjudicatedService.findAdjudicatedProductsGroupByCategory(
      findAll,
    );
  }

  @Query(() => [Adjudicated])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findAdjudicated(
    @Args('ArgsAdjudicated') argsAdjudicated: ArgsAdjudicated,
  ) {
    validateArgsAdjudicated(argsAdjudicated);
    return this.adjudicatedService.findAdjudicated(argsAdjudicated);
  }

  @Query(() => Adjudicated)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findAdjudicatedById(@Args('AdjudicatedID') adjudicatedID: string) {
    const normalizedId = validateAdjudicatedId(adjudicatedID);
    return this.adjudicatedService.findAdjudicatedById(normalizedId);
  }
}
