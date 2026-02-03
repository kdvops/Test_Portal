import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateSliderDto } from './dto/create.slider.dto';
import { UpdatePositionsSliderDto } from './dto/update-positions.slider.dto';

// IMPORT SERVICES
import { SlidersService } from './sliders.service';

// IMPORT USER SCHEMA
import { Sliders } from './schema/sliders.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UpdateSlider } from './dto/update.slider.dto';
import {
  normalizeCreateSliderDto,
  normalizeUpdateSliderDto,
  validateSliderId,
  validateSliderTarget,
  validateUpdatePositionsDto,
} from './sliders.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Sliders)
export class SlidersResolver {
  constructor(private slidersService: SlidersService) {}

  @Mutation(() => Sliders)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateSlider(@Args('UpdateSlider') updateSliderDto: UpdateSlider) {
    const normalized = normalizeUpdateSliderDto(updateSliderDto);
    return this.slidersService.updateSliders(normalized);
  }

  @Mutation(() => Sliders)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createSlider(
    @Args('CreateSliderDto') createSliderDto: CreateSliderDto,
  ) {
    const normalized = normalizeCreateSliderDto(createSliderDto);
    return this.slidersService.createSliders(normalized);
  }

  @Query(() => [Sliders])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async sliders() {
    return this.slidersService.sliders();
  }

  @Mutation(() => Sliders)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  removeSlider(@Args('sliderID') sliderID: string) {
    const normalizedId = validateSliderId(sliderID);
    return this.slidersService.removeSliders(normalizedId);
  }

  @Query(() => Sliders)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findSliderById(@Args('sliderID') sliderID: string) {
    const normalizedId = validateSliderId(sliderID);
    return this.slidersService.findSliderById(normalizedId);
  }

  @Query(() => [Sliders])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findSliderByTarget(@Args('target') target: string) {
    validateSliderTarget(target);
    return this.slidersService.findSlidersByTarget(target);
  }

  @Query(() => [Sliders])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findSliderByTargetId(@Args('targetID') targetID: string) {
    return this.slidersService.findSliderByTargetId(targetID);
  }

  @Mutation(() => [Sliders])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateSlidersPositions(
    @Args('UpdatePositionsSliderDto')
    updatePositionsDto: UpdatePositionsSliderDto,
  ) {
    const normalized = validateUpdatePositionsDto(updatePositionsDto);
    return this.slidersService.updateSlidersPositions(normalized);
  }
}
