import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateProfitDto } from './dto/create.profit.dto';
import { UpdateProfitsDto } from './dto/update.profit.dto';
import { ProfitsGroupByCategoryDto } from './dto/args.profits.dto';

// IMPORT SERVICES
import { ProfitsService } from './profits.service';

// IMPORT PROFITS SCHEMA
import { Profits } from './schema/profits.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  normalizeCreateProfitsDto,
  validateProfitId,
  validateUpdateProfitsDto,
} from './profits.validation';
// import { RemoveProfitsDto } from './dto/remove.profit.dto';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Profits)
export class ProfitsResolver {
  constructor(private profitsService: ProfitsService) {}

  @Mutation(() => [Profits])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateProfits(
    @Args('UpdateProfitsDto') updateProfitsDto: UpdateProfitsDto,
  ) {
    const normalizedDto = validateUpdateProfitsDto(updateProfitsDto);
    return this.profitsService.updateProfits(normalizedDto);
  }

  @Mutation(() => [Profits])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createProfit(
    @Args('CreateProfitDto') createProfitDto: CreateProfitDto,
  ) {
    const normalizedDto = normalizeCreateProfitsDto(createProfitDto);
    return this.profitsService.createProfits(normalizedDto);
  }

  @Mutation(() => Profits)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  cloneProfits(@Args('ProfitID') profitID: string) {
    const normalizedId = validateProfitId(profitID);
    return this.profitsService.cloneProfits(normalizedId);
  }

  @Mutation(() => Profits)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishProfits(@Args('ProfitID') profitID: string) {
    const normalizedId = validateProfitId(profitID);
    return this.profitsService.changeProfitsStatus(normalizedId, 'publish');
  }

  @Mutation(() => Profits)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftProfits(@Args('ProfitID') profitID: string) {
    const normalizedId = validateProfitId(profitID);
    return this.profitsService.changeProfitsStatus(normalizedId, 'draft');
  }

  @Mutation(() => Profits)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  removeProfits(@Args('ProfitID') profitID: string) {
    const normalizedId = validateProfitId(profitID);
    return this.profitsService.removeProfits(normalizedId);
  }

  @Query(() => [ProfitsGroupByCategoryDto])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  profitsGroupByCategory(
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.profitsService.profitsGroupByCategory(findAll);
  }

  @Query(() => Profits)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findProfitById(@Args('ProfitID') profitID: string) {
    const normalizedId = validateProfitId(profitID);
    return this.profitsService.findProfitById(normalizedId);
  }

  @Query(() => [Profits])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findProfitsByCategory(
    @Args('categoryID') categoryID: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.profitsService.findProfitsByCategory(categoryID, findAll);
  }
      
  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueProfitSlug(@Args('Slug') slug: string) {
    return this.profitsService.findUniqueSlug(slug);
  }
}
