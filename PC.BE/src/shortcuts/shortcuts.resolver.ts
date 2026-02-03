import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import {
  normalizeCreateShortcutsDto,
  validateShortcutId,
  validateShortcutTarget,
  validateTargetId,
  validateUpdateShortcutsDto,
} from './shortcuts.validation';

// IMPORT INPUTS / DTO
import { CreateShortcutsDto } from './dto/create.shortcuts.dto';
import { ShortcutsGroupByTarget } from './dto/args.shortcuts.dto';
import { UpdateShortcutsDto } from './dto/update.shortcuts.dto';

// IMPORT SERVICES
import { ShortcutsService } from './shortcuts.service';

// IMPORT USER SCHEMA
import { Shortcuts } from './schema/shortcuts.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Shortcuts)
export class ShortcutsResolver {
  constructor(private shortcutsService: ShortcutsService) {}

  @Mutation(() => Shortcuts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateShortcuts(
    @Args('UpdateShortcutsDto') updateShortcutsDto: UpdateShortcutsDto,
  ) {
    const normalized = validateUpdateShortcutsDto(updateShortcutsDto);
    return this.shortcutsService.updateShortcuts(normalized);
  }

  @Mutation(() => Shortcuts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createShortcuts(
    @Args('CreateShortcutsDto') createShortcutsDto: CreateShortcutsDto,
  ) {
    const normalized = normalizeCreateShortcutsDto(createShortcutsDto);
    return this.shortcutsService.createShortcuts(normalized);
  }

  @Mutation(() => Shortcuts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  removeShortcuts(@Args('ShortcutsID') shortcutsID: string) {
    const normalizedId = validateShortcutId(shortcutsID);
    return this.shortcutsService.removeShortcuts(normalizedId);
  }

  @Query(() => [Shortcuts])
  //@UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findShortcutsByTarget(@Args('Target') target: string) {
    validateShortcutTarget(target);
    return this.shortcutsService.findShortcutsByTarget(target);
  }

  @Query(() => [Shortcuts])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findShortcutsByTargetId(@Args('targetId') targetId: string) {
    const normalizedId = validateTargetId(targetId);
    return this.shortcutsService.findShortcutsByTargetId(normalizedId);
  }

  @Query(() => [ShortcutsGroupByTarget])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findShortcutsGroupByTarget() {
    return this.shortcutsService.shortcutsGroupByTarget();
  }

  @Query(() => [ShortcutsGroupByTarget])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findShortcutsGroupByTargetId(
    @Args('targetID') targetID: string,
    @Args('findAll') findAll: boolean = false,
  ) {
    const normalizedId = validateTargetId(targetID);
    return this.shortcutsService.findShortcutsGroupByTargetId(
      normalizedId,
      findAll,
    );
  }

  @Query(() => Shortcuts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findShortcutById(@Args('ShortcutID') shortcutID: string) {
    const normalizedId = validateShortcutId(shortcutID);
    return this.shortcutsService.findShortcutById(normalizedId);
  }

  @Query(() => [Shortcuts])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findShortcuts() {
    return this.shortcutsService.findShortcuts();
  }
}
