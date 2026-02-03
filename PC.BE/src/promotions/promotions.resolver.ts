import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreatePromotionDto } from './dto/create.promotion.dto';
import { UpdatePromotionDto } from './dto/update.promotion.dto';
import {
  PromotionByMonth,
  SearchArgs,
  ParamsByDate,
} from './dto/args.promotions.dto';

// IMPORT SERVICES
import { PromotionsService } from './promotions.service';

// IMPORT USER SCHEMA
import { Promotions } from './schema/promotions.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { RemovePromotionsDto } from './dto/remove.promotion.dto';
import {
  normalizeCreatePromotionsDto,
  validateParamsByDate,
  validatePromotionId,
  validateRemovePromotionsDto,
  validateSearchArgs,
  validateUpdatePromotionsDto,
} from './promotions.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Promotions)
export class PromotionsResolver {
  constructor(private promotionsService: PromotionsService) {}

  @Mutation(() => [Promotions])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updatePromotions(
    @Args('UpdatePromotionDto') updatePromotionDto: UpdatePromotionDto,
  ) {
    const normalizedDto = validateUpdatePromotionsDto(updatePromotionDto);
    return this.promotionsService.updatePromotions(normalizedDto);
  }

  @Mutation(() => [Promotions])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createPromotion(
    @Args('CreatePromotionDto') createPromotionDto: CreatePromotionDto,
  ) {
    const normalizedDto = normalizeCreatePromotionsDto(createPromotionDto);
    return this.promotionsService.createPromotions(normalizedDto);
  }

  @Query(() => [PromotionByMonth])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findPromotionsByMonth(
    @Args('SearchArgs') searchArgs: SearchArgs,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    validateSearchArgs(searchArgs);
    return this.promotionsService.findPromotionsByMonth(searchArgs, findAll);
  }

  @Mutation(() => Promotions)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  clonePromotion(@Args('PromotionID') promotionID: string) {
    const normalizedId = validatePromotionId(promotionID);
    return this.promotionsService.clonePromotion(normalizedId);
  }

  @Mutation(() => Promotions)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishPromotion(@Args('PromotionID') promotionID: string) {
    const normalizedId = validatePromotionId(promotionID);
    return this.promotionsService.changePromotionStatus(
      normalizedId,
      'publish',
    );
  }

  @Mutation(() => Promotions)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftPromotion(@Args('PromotionID') promotionID: string) {
    const normalizedId = validatePromotionId(promotionID);
    return this.promotionsService.changePromotionStatus(normalizedId, 'draft');
  }

  @Mutation(() => [Promotions])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  removePromotions(
    @Args('RemovePromotionsDto') removePromotionsDto: RemovePromotionsDto,
  ) {
    const normalizedDto = validateRemovePromotionsDto(removePromotionsDto);
    return this.promotionsService.removePromotions(normalizedDto);
  }

  @Mutation(() => Promotions)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  removePromotion(@Args('PromotionID') promotionID: string) {
    const normalizedId = validatePromotionId(promotionID);
    return this.promotionsService.removePromotion(normalizedId);
  }

  @Query(() => Promotions)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findPromotionById(@Args('PromotionID') promotionID: string) {
    const normalizedId = validatePromotionId(promotionID);
    return this.promotionsService.findPromotionById(normalizedId);
  }

  @Query(() => [Promotions])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findPromotionByDate(
    @Args('ParamsByDate') paramsByDate: ParamsByDate,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    validateParamsByDate(paramsByDate);
    return this.promotionsService.findPromotionsByDate(paramsByDate, findAll);
  }
}
