import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { CategoriesService } from './categories.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { CategoriesResolver } from './categories.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Categories, CategoriesSchema } from './schema/categories.schema';

// IMPORT INTERCEPTOR
import { SlugCategoriesInterceptor } from './interceptor/categories.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Categories.name, schema: CategoriesSchema },
    ]),
  ],
  providers: [
    CategoriesService,
    CategoriesResolver,
    AzureBlobStorageService,
    SlugCategoriesInterceptor,
  ],
  exports: [CategoriesService],
})
export class CategoriesModule {}
