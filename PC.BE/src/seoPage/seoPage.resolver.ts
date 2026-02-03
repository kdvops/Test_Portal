import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
// IMPORT INPUTS / DTO
import { CreateSeoPageDto, CreateSeoPagesDto } from './dto/create.seoPage.dto';
import { UpdateSeoPageDto } from './dto/update.seoPage.dto';

// IMPORT SERVICES
import { SeoPageService } from './seoPage.service';

// IMPORT USER SCHEMA
import { SeoPage } from './schema/seoPage.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import {
  normalizeCreateSeoPageDto,
  normalizeCreateSeoPagesDto,
  normalizeUpdateSeoPageDto,
  validateSeoPageId,
  validateSeoPagePath,
} from './seoPage.validation';

@Resolver(() => SeoPage)
export class SeoPageResolver {
  constructor(private seoPageService: SeoPageService) {}

  @Mutation(() => SeoPage)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateSeoPage(
    @Args('UpdateSeoPageDto') updateSeoPageDto: UpdateSeoPageDto,
  ) {
    const normalized = normalizeUpdateSeoPageDto(updateSeoPageDto);
    return this.seoPageService.updateSeoPage(normalized);
  }

  @Mutation(() => SeoPage)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removeSeoPage(@Args('SeoPageId') seoPageId: string) {
    const normalizedId = validateSeoPageId(seoPageId);
    return this.seoPageService.removeSeoPage(normalizedId);
  }

  @Mutation(() => SeoPage)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createSeoPage(
    @Args('CreateSeoPageDto') createSeoPageDto: CreateSeoPageDto,
  ) {
    const normalized = normalizeCreateSeoPageDto(createSeoPageDto);
    return this.seoPageService.createSeoPage(normalized);
  }

  @Mutation(() => SeoPage)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createSeoPages(
    @Args('CreateSeoPagesDto') createSeoPagesDto: CreateSeoPagesDto,
  ) {
    const normalized = normalizeCreateSeoPagesDto(createSeoPagesDto);
    return this.seoPageService.createSeoPages(normalized);
  }

  @Query(() => [SeoPage])
  async seoPages() {
    return this.seoPageService.seoPages();
  }

  @Query(() => SeoPage)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findSeoPageById(@Args('SeoPageId') seoPageId: string) {
    const normalizedId = validateSeoPageId(seoPageId);
    return this.seoPageService.findSeoPageById(normalizedId);
  }

  @Query(() => SeoPage, { nullable: true })
  // @Roles(RolesUser.admin)
  findSeoPageByPath(@Args('Path') path: string) {
    validateSeoPagePath(path);
    return this.seoPageService.findSeoPageByPath(path);
  }
}
