import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { PostsService } from './posts.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { PostsResolver } from './posts.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Posts, PostsSchema } from './schema/post.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';
import { CategoriesModule } from 'src/categories/categories.module';

// IMPORT INTERCEPTOR
import { SlugPostsInterceptor } from './interceptor/posts.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }]),
    SectionsModule,
    CategoriesModule,
  ],
  providers: [
    PostsService,
    PostsResolver,
    AzureBlobStorageService,
    SlugPostsInterceptor,
  ],
  exports: [PostsService],
})
export class PostsModule {}
