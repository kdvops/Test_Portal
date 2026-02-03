import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateTargetDto } from './dto/create.target.dto';
import { UpdateTargetDto } from './dto/update.target.dto';
import { TargetsList } from './dto/args.target.dto';

// IMPORT SERVICES
import { TargetsService } from './targets.service';

// IMPORT USER SCHEMA
import { Targets } from './schema/targets.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT INTERCEPTOR
import { SlugTargetsInterceptor } from './interceptor/targets.slug.interceptor';
import {
  normalizeCreateTargetDto,
  validateTargetId,
  validateUpdateTargetDto,
} from './targets.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Targets)
export class TargetsResolver {
  constructor(private targetsService: TargetsService) {}

  @Mutation(() => Targets)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateTarget(
    @Args('UpdateTargetDto') updateTargetDto: UpdateTargetDto,
  ) {
    const normalized = validateUpdateTargetDto(updateTargetDto);
    return this.targetsService.updateTarget(normalized);
  }

  @Mutation(() => Targets)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createTarget(
    @Args('CreateTargetDto') createTargetDto: CreateTargetDto,
  ) {
    const normalized = normalizeCreateTargetDto(createTargetDto);
    return this.targetsService.createTargets(normalized);
  }

  //   @UseInterceptors(SlugTargetsInterceptor)
  //   @Query(() => [TargetsList])
  //   // @UseGuards(GqlAuthGuard, RolesGuard)
  //   // @Roles(RolesUser.admin)
  //   async findTargetsByParentTargetCategory(
  //     @Args('ParentTarget') parentTarget: TargetParentCategories,
  //     @Args('FindAll', { nullable: true }) findAll: boolean = false,
  //   ) {
  //     return this.targetsService.findTargetsByParentTargetCategory(
  //       parentTarget,
  //       findAll,
  //     );
  //   }

  //   @Mutation(() => [Targets])
  //   @UseGuards(GqlAuthGuard, RolesGuard)
  //   // @Roles(RolesUser.admin)
  //   removeTargets(
  //     @Args('RemoveTargetsDto') removeTargetsDto: RemoveTargetsDto,
  //   ) {
  //     return this.targetsService.removeTargets(removeTargetsDto);
  //   }

  @Mutation(() => Targets)
  @UseGuards(GqlAuthGuard, RolesGuard)
  cloneTarget(@Args('TargetID') targetID: string) {
    const normalizedId = validateTargetId(targetID);
    return this.targetsService.cloneTarget(normalizedId);
  }

  @Mutation(() => Targets)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishTarget(@Args('TargetID') targetID: string) {
    const normalizedId = validateTargetId(targetID);
    return this.targetsService.changeTargetStatus(
      normalizedId,
      'publish',
    );
  }

  @Mutation(() => Targets)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftTarget(@Args('TargetID') targetID: string) {
    const normalizedId = validateTargetId(targetID);
    return this.targetsService.changeTargetStatus(
      normalizedId,
      'draft',
    );
  }

  @Mutation(() => Targets)
  @UseGuards(GqlAuthGuard, RolesGuard)
  removeTarget(@Args('TargetID') targetID: string) {
    const normalizedId = validateTargetId(targetID);
    return this.targetsService.removeTarget(normalizedId);
  }

  // @UseInterceptors(SlugTargetsInterceptor)
  @Query(() => [TargetsList])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findAllTargets(
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.targetsService.findAllTargets(findAll);
  }

  @UseInterceptors(SlugTargetsInterceptor)
  @Query(() => TargetsList)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findTargetById(@Args('targetID') targetID: string) {
    const normalizedId = validateTargetId(targetID);
    return this.targetsService.findTargetById(normalizedId);
  }

  @UseInterceptors(SlugTargetsInterceptor)
  @Query(() => TargetsList)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findTargetBySlug(@Args('slug') slug: string) {
    return this.targetsService.findTargetBySlug(slug);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueTargetSlug(@Args('Slug') slug: string) {
    return this.targetsService.findUniqueSlug(slug);
  }
  //   @Query(() => [Targets])
  //   // @UseGuards(GqlAuthGuard, RolesGuard)
  //   // @Roles(RolesUser.admin)
  //   findTargetByDate() {
  //     return this.targetsService.findTargetsByDate();
  //   }
}
