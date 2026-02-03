import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards, UseInterceptors } from '@nestjs/common';

// IMPORT INPUTS / DTO
import { CreatePostDto } from './dto/create.post.dto';
import { UpdatePostDto } from './dto/update.post.dto';
import {
  ArgsPosts,
  PostsByGroupType,
  PostsPostType,
} from './dto/args.post.dto';

// IMPORT SERVICES
import { PostsService } from './posts.service';

// IMPORT USER SCHEMA
import { Posts } from './schema/post.schema';

// IMPORT GUARDS
import { GqlAuthGuard } from '../common/guards/jwt.guard';
import { RolesGuard } from '../common/guards/roles.guard';

// IMPORT INTERCEPTOR
import { SlugPostsInterceptor } from './interceptor/posts.slug.interceptor';
import {
  normalizeCreatePostDto,
  validateArgsPosts,
  validatePostId,
  validateUpdatePostDto,
} from './posts.validation';

// IMPORT DECORATORS
// import { Roles } from '../common/decorators/roles.decorator';

// IMPORT ENUMS
// import { RolesUser } from '../common/enums/roles.enum';

@Resolver(() => Posts)
export class PostsResolver {
  constructor(private postsService: PostsService) {}

  @Mutation(() => Posts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async updatePost(@Args('UpdatePostDto') updatePostDto: UpdatePostDto) {
    const normalizedDto = validateUpdatePostDto(updatePostDto);
    return this.postsService.updatePost(normalizedDto);
  }

  @Mutation(() => Posts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async createPost(@Args('CreatePostDto') createPostDto: CreatePostDto) {
    const normalizedDto = normalizeCreatePostDto(createPostDto);
    return this.postsService.createPost(normalizedDto);
  }

  @Mutation(() => Posts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async clonePost(@Args('PostID') postID: string) {
    const normalizedId = validatePostId(postID);
    return this.postsService.clonePost(normalizedId);
  }

  @Mutation(() => Posts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  publishPost(@Args('PostID') postID: string) {
    const normalizedId = validatePostId(postID);
    return this.postsService.changePostStatus(normalizedId, 'publish');
  }

  @Mutation(() => Posts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  draftPost(@Args('PostID') postID: string) {
    const normalizedId = validatePostId(postID);
    return this.postsService.changePostStatus(normalizedId, 'draft');
  }

  @Mutation(() => Posts)
  @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async removePost(@Args('PostID') postID: string) {
    const normalizedId = validatePostId(postID);
    return this.postsService.removePost(normalizedId);
  }

  @UseInterceptors(SlugPostsInterceptor)
  @Query(() => [PostsPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findPostsByCategory(
    @Args('CategoryID') categoryID: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.postsService.findPostsByCategory(categoryID, findAll);
  }

  @UseInterceptors(SlugPostsInterceptor)
  @Query(() => [PostsPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findPostsByCategoryId(
    @Args('CategoryId') categoryId: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = true,
  ) {
    return this.postsService.findPostsByCategoryId(categoryId, findAll);
  }

  @UseInterceptors(SlugPostsInterceptor)
  @Query(() => [PostsByGroupType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findPostsGroupByCategory(
    @Args('TargetId') targetId: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.postsService.findPostsGroupByCategory(targetId, findAll);
  }

  @UseInterceptors(SlugPostsInterceptor)
  @Query(() => [PostsPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findPostsByTargetId(
    @Args('TargetID') targetID: string,
    @Args('FindAll', { nullable: true }) findAll: boolean = false,
  ) {
    return this.postsService.findPostsByTargetId(targetID, findAll);
  }

  @UseInterceptors(SlugPostsInterceptor)
  @Query(() => [PostsPostType])
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  async findPosts(@Args('ArgsPosts') argsPosts: ArgsPosts) {
    validateArgsPosts(argsPosts);
    return this.postsService.findPosts(argsPosts);
  }

  @UseInterceptors(SlugPostsInterceptor)
  @Query(() => PostsPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findPostById(@Args('PostId') postId: string) {
    const normalizedId = validatePostId(postId);
    return this.postsService.findPostById(normalizedId);
  }

  @UseInterceptors(SlugPostsInterceptor)
  @Query(() => PostsPostType)
  // @UseGuards(GqlAuthGuard, RolesGuard)
  // @Roles(RolesUser.admin)
  findPostsBySlug(@Args('Slug') slug: string) {
    return this.postsService.findPostsBySlug(slug);
  }

  @Query(() => String)
  @UseGuards(GqlAuthGuard, RolesGuard)
  findUniquePostsSlug(@Args('Slug') slug: string) {
    return this.postsService.findUniqueSlug(slug);
  }
}
