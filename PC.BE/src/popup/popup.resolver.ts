import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreatePopupDto } from './dto/create.popup.dto';
import { UpdatePopupDto } from './dto/update.popup.dto';

// IMPORT SERVICES
import { PopupService } from './popup.service';

// IMPORT PROFITS SCHEMA
import { Popup } from './schema/popup.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  normalizeCreatePopupDto,
  validatePopupId,
  validateUpdatePopupDto,
} from './popup.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Popup)
export class PopupResolver {
  constructor(private popupsService: PopupService) {}

  @Mutation(() => Popup)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updatePopup(
    @Args('UpdatePopupDto')
    updatePopupDto: UpdatePopupDto,
  ) {
    const normalizedDto = validateUpdatePopupDto(updatePopupDto);
    return this.popupsService.updatePopup(normalizedDto);
  }

  @Mutation(() => Popup)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createPopup(
    @Args('CreatePopupDto')
    createPopupDto: CreatePopupDto,
  ) {
    const normalizedDto = normalizeCreatePopupDto(createPopupDto);
    return this.popupsService.createPopup(normalizedDto);
  }

  @Mutation(() => Popup)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  removePopup(@Args('popupID') popupID: string) {
    const normalizedId = validatePopupId(popupID);
    return this.popupsService.removePopup(normalizedId);
  }

  @Mutation(() => Popup)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  activePopup(@Args('popupID') popupID: string) {
    const normalizedId = validatePopupId(popupID);
    return this.popupsService.activePopup(normalizedId);
  }

  @Query(() => Popup)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findPopupByActive() {
    return this.popupsService.findPopupByActive();
  }

  @Query(() => [Popup])
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findPopups() {
    return this.popupsService.findPopups();
  }

  @Query(() => Popup)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findPopupById(@Args('popupID') popupID: string) {
    const normalizedId = validatePopupId(popupID);
    return this.popupsService.findPopupById(normalizedId);
  }
}
