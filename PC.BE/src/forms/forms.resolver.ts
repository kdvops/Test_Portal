import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateFormsDto } from './dto/create.forms.dto';
import { UpdateFormsDto } from './dto/update.forms.dto';
import { FormsType } from './dto/args.forms.dto';

// IMPORT SERVICES
import { FormsService } from './forms.service';

// IMPORT USER SCHEMA
import { Forms } from './schema/forms.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT INTERCEPTOR
import { SlugFormsInterceptor } from './interceptor/forms.slug.interceptor';
import {
  normalizeCreateFormsDto,
  validateFormsId,
  validateUpdateFormsDto,
} from './forms.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Forms)
export class FormsResolver {
  constructor(private formsService: FormsService) {}

  @Mutation(() => Forms)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateForms(@Args('UpdateFormsDto') updateFormsDto: UpdateFormsDto) {
    const normalizedDto = validateUpdateFormsDto(updateFormsDto);
    return this.formsService.updateForms(normalizedDto);
  }

  @Mutation(() => Forms)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async cloneForms(@Args('FormsID') formsID: string) {
    const normalizedId = validateFormsId(formsID);
    return this.formsService.cloneForms(normalizedId.toString());
  }

  @Mutation(() => Forms)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishForm(@Args('FormID') formID: string) {
    return this.formsService.changeFormsStatus(formID, 'publish');
  }

  @Mutation(() => Forms)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftForm(@Args('FormID') formID: string) {
    return this.formsService.changeFormsStatus(formID, 'draft');
  }

  @Mutation(() => Forms)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createForms(@Args('CreateFormsDto') createFormsDto: CreateFormsDto) {
    const normalizedDto = normalizeCreateFormsDto(createFormsDto);
    return this.formsService.createForms(normalizedDto);
  }

  @Mutation(() => Forms)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeForms(@Args('FormsID') formsID: string) {
    const normalizedId = validateFormsId(formsID);
    return this.formsService.removeForms(normalizedId.toString());
  }

  @UseInterceptors(SlugFormsInterceptor)
  @Query(() => [FormsType])
  @UseGuards(GqlAuthGuard, RolesGuard)
  //   @Roles(RolesUser.admin)
  async findForms() {
    return this.formsService.findForms();
  }

  @UseInterceptors(SlugFormsInterceptor)
  @Query(() => FormsType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findFormsById(@Args('FormsID') formsID: string) {
    const normalizedId = validateFormsId(formsID);
    return this.formsService.findFormsById(normalizedId.toString());
  }

  @Query(() => FormsType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findFormsBySlug(@Args('Slug') slug: string) {
    return this.formsService.findFormsBySlug(slug);
  }
      
  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueFormSlug(@Args('Slug') slug: string) {
    return this.formsService.findUniqueSlug(slug);
  }
}
