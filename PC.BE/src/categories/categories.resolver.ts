import {
  Args,
  Mutation,
  Resolver,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import {
  CategoriesAndSubcategories,
  CategoriesByParent,
  ParentAndTargetDto,
} from './dto/args.category.dto';

// IMPORT SERVICES
import { CategoriesService } from './categories.service';

// IMPORT CATEGORY SCHEMA
import { Categories } from './schema/categories.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT INTERCEPTOR SLUG
import { SlugCategoriesInterceptor } from './interceptor/categories.slug.interceptor';
import {
  normalizeCreateCategoryDto,
  validateCategoryId,
  validateParentAndTargetDto,
  validateTargetCategory,
  validateTargetId,
  validateUpdateCategoryDto,
} from './categories.validation';

// IMPORT ENUMS
import {
  TargetCategories,
  TargetParentCategories,
} from 'src/common/enums/target.enum';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Categories)
export class CategoriesResolver {
  constructor(private categoriesService: CategoriesService) {}

  @Mutation(() => Categories)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateCategories(
    @Args('UpdateCategoryDto') updateCategoryDto: UpdateCategoryDto,
  ) {
    const normalizedDto = validateUpdateCategoryDto(updateCategoryDto);
    return this.categoriesService.updateCategories(normalizedDto);
  }

  @Mutation(() => Categories)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createCategory(
    @Args('CreateCategoryDto') createCategoryDto: CreateCategoryDto,
  ) {
    const normalizedDto = normalizeCreateCategoryDto(createCategoryDto);
    return this.categoriesService.createCategories(normalizedDto);
  }

  @Mutation(() => Categories)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  cloneCategories(@Args('CategoryID') categoryID: string) {
    const normalizedId = validateCategoryId(categoryID);
    return this.categoriesService.cloneCategories(normalizedId);
  }

  @Mutation(() => Categories)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishCategory(@Args('CategoryID') categoryID: string) {
    const normalizedId = validateCategoryId(categoryID);
    return this.categoriesService.changeCategoryStatus(normalizedId, 'publish');
  }

  @Mutation(() => Categories)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftCategory(@Args('CategoryID') categoryID: string) {
    const normalizedId = validateCategoryId(categoryID);
    return this.categoriesService.changeCategoryStatus(normalizedId, 'draft');
  }

  @Mutation(() => Categories)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  removeCategories(@Args('CategoryID') categoryID: string) {
    const normalizedId = validateCategoryId(categoryID);
    return this.categoriesService.removeCategories(normalizedId);
  }

  @UseInterceptors(SlugCategoriesInterceptor)
  @Query(() => CategoriesAndSubcategories)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findCategoryById(@Args('CategoryID') categoryID: string) {
    const normalizedId = validateCategoryId(categoryID);
    return this.categoriesService.findCategoryById(normalizedId);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueCategorySlug(@Args('Slug') slug: string) {
    return this.categoriesService.findUniqueSlug(slug);
  }

  @UseInterceptors(SlugCategoriesInterceptor)
  @Query(() => CategoriesAndSubcategories)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findCategoryBySlug(@Args('Slug') slug: string) {
    return this.categoriesService.findCategoryBySlug(slug);
  }

  @UseInterceptors(SlugCategoriesInterceptor)
  @Query(() => [CategoriesAndSubcategories])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findCategoryByTarget(
    @Args('Target') target: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    const normalizedTarget = validateTargetCategory(target);
    return this.categoriesService.findCategoriesByTarget(
      normalizedTarget,
      findAll,
    );
  }

  @UseInterceptors(SlugCategoriesInterceptor)
  @Query(() => [CategoriesAndSubcategories])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findCategoriesByTargetId(
    @Args('targetID') targetID: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    const normalizedId = validateTargetId(targetID);
    return this.categoriesService.findCategoriesByTargetId(
      normalizedId.toString(),
      findAll,
    );
  }

  @UseInterceptors(SlugCategoriesInterceptor)
  @Query(() => [Categories])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findCategoryByParentAndTarget(
    @Args('ParentAndTargetDto') parentAndTargetDto: ParentAndTargetDto,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    const normalizedDto = validateParentAndTargetDto(parentAndTargetDto);
    return this.categoriesService.findCategoryByParentAndTarget(
      normalizedDto,
      findAll,
    );
  }

  @UseInterceptors(SlugCategoriesInterceptor)
  @Query(() => [CategoriesByParent])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findCategoriesByParents(
    @Args('parentTarget') parentTarget: TargetCategories,
  ) {
    return this.categoriesService.findCategoriesByParents(parentTarget);
  }

  @ResolveField(() => TargetCategories, { nullable: true })
  target(@Parent() category: Categories): TargetCategories | null {
    // Convert empty string or undefined to null to avoid enum serialization errors
    const targetValue = category.target;
    if (typeof targetValue !== 'string' || targetValue.trim() === '') {
      return null;
    }
    // Check that the value is a valid enum value
    const enumValues = Object.values(TargetCategories) as string[];
    if (enumValues.includes(targetValue as string)) {
      return targetValue as TargetCategories;
    }
    return null;
  }

  @ResolveField(() => TargetParentCategories, { nullable: true })
  parentTarget(@Parent() category: Categories): TargetParentCategories | null {
    // Convert empty string or undefined to null to avoid enum serialization errors
    const parentTargetValue = category.parentTarget;
    if (
      typeof parentTargetValue !== 'string' ||
      parentTargetValue.trim() === ''
    ) {
      return null;
    }
    // Check that the value is a valid enum value
    const enumValues = Object.values(TargetParentCategories) as string[];
    if (enumValues.includes(parentTargetValue as string)) {
      return parentTargetValue as TargetParentCategories;
    }
    return null;
  }
}
