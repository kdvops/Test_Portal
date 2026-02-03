import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateLocationDto } from './dto/create.location.dto';
import { UpdateLocationDto } from './dto/update.location.dto';

// IMPORT SERVICES
import { LocationsService } from './locations.service';

// IMPORT USER SCHEMA
import { Locations } from './schema/locations.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  normalizeCreateLocationDto,
  validateLocationId,
  validateUpdateLocationDto,
} from './locations.validation';

@Resolver(() => Locations)
export class LocationsResolver {
  constructor(private locationsService: LocationsService) {}

  @Mutation(() => Locations)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateLocation(
    @Args('UpdateLocationDto') updateLocationDto: UpdateLocationDto,
  ) {
    const normalizedDto = validateUpdateLocationDto(updateLocationDto);
    return this.locationsService.updateLocation(normalizedDto);
  }

  @Mutation(() => Locations)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeLocation(@Args('LocationID') locationID: string) {
    const normalizedId = validateLocationId(locationID);
    return this.locationsService.removeLocation(normalizedId);
  }

  @Mutation(() => Locations)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createLocation(
    @Args('CreateLocationDto') createLocationDto: CreateLocationDto,
  ) {
    const normalizedDto = normalizeCreateLocationDto(createLocationDto);
    return this.locationsService.createLocations(normalizedDto);
  }

  @Query(() => [Locations])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async locations() {
    return this.locationsService.locations();
  }

  @Query(() => Locations)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findLocationById(@Args('LocationID') locationID: string) {
    const normalizedId = validateLocationId(locationID);
    return this.locationsService.findLocationById(normalizedId);
  }
}
