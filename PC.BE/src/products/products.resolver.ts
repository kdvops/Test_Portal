import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreateProductDto } from './dto/create.product.dto';
import { UpdateProductDto } from './dto/update.product.dto';
import { ProductsByParentTarget } from './dto/args.products.dto';
// import { UpdateProductDto } from './dto/update.product.dto';
// import { findProductsByDateDto } from './dto/args.products.dto';

// IMPORT SERVICES
import { ProductsService } from './products.service';

// IMPORT USER SCHEMA
import { Products } from './schema/products.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { TargetParentCategories } from 'src/common/enums/target.enum';

// IMPORT INTERCEPTOR
import { SlugProductsInterceptor } from './interceptor/products.slug.interceptor';
import {
  normalizeCreateProductDto,
  validateProductId,
  validateUpdateProductDto,
} from './products.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Products)
export class ProductsResolver {
  constructor(private productsService: ProductsService) {}

  @Mutation(() => Products)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updateProduct(
    @Args('UpdateProductDto') updateProductDto: UpdateProductDto,
  ) {
    const normalizedDto = validateUpdateProductDto(updateProductDto);
    return this.productsService.updateProduct(normalizedDto);
  }

  @Mutation(() => Products)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createProduct(
    @Args('CreateProductDto') createProductDto: CreateProductDto,
  ) {
    const normalizedDto = normalizeCreateProductDto(createProductDto);
    return this.productsService.createProducts(normalizedDto);
  }

  @UseInterceptors(SlugProductsInterceptor)
  @Query(() => [ProductsByParentTarget])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findProductsByParentTargetCategory(
    @Args('ParentTarget') parentTarget: TargetParentCategories,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.productsService.findProductsByParentTargetCategory(
      parentTarget,
      findAll,
    );
  }

  @UseInterceptors(SlugProductsInterceptor)
  @Query(() => [Products])
  //@UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findProductsByCategory(
    @Args('CategoryID') categoryID: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.productsService.findProductsByCategory(categoryID, findAll);
  }

  //   @Mutation(() => [Products])
  //   @UseGuards(GqlAuthGuard, RolesGuard)
  //   // @Roles(RolesUser.admin)
  //   removeProducts(
  //     @Args('RemoveProductsDto') removeProductsDto: RemoveProductsDto,
  //   ) {
  //     return this.productsService.removeProducts(removeProductsDto);
  //   }

  @Mutation(() => Products)
  @UseGuards(GqlAuthGuard, RolesGuard)
  cloneProduct(@Args('ProductID') productID: string) {
    const normalizedId = validateProductId(productID);
    return this.productsService.cloneProduct(normalizedId);
  }

  @Mutation(() => Products)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishProduct(@Args('ProductID') productID: string) {
    const normalizedId = validateProductId(productID);
    return this.productsService.changeProductStatus(normalizedId, 'publish');
  }
  
  @Mutation(() => Products)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftProduct(@Args('ProductID') productID: string) {
    const normalizedId = validateProductId(productID);
    return this.productsService.changeProductStatus(normalizedId, 'draft');
  }

  @Mutation(() => Products)
  @UseGuards(GqlAuthGuard, RolesGuard)
  removeProduct(@Args('ProductID') productID: string) {
    const normalizedId = validateProductId(productID);
    return this.productsService.removeProduct(normalizedId);
  }

  @UseInterceptors(SlugProductsInterceptor)
  @Query(() => ProductsByParentTarget)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findProductById(@Args('ProductID') productID: string) {
    return this.productsService.findProductById(productID);
  }

  @UseInterceptors(SlugProductsInterceptor)
  @Query(() => ProductsByParentTarget)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findProductBySlug(@Args('slug') slug: string) {
    return this.productsService.findProductBySlug(slug);
  }
  
  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniqueProductSlug(@Args('Slug') slug: string) {
    return this.productsService.findUniqueSlug(slug);
  }
  //   @Query(() => [Products])
  //   // @UseGuards(GqlAuthGuard, RolesGuard)
  //   // @Roles(RolesUser.admin)
  //   findProductByDate() {
  //     return this.productsService.findProductsByDate();
  //   }
}
