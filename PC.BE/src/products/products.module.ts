import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { ProductsService } from './products.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { ProductsResolver } from './products.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Products, ProductsSchema } from './schema/products.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// IMPORT INTERCEPTOR
import { SlugProductsInterceptor } from './interceptor/products.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Products.name, schema: ProductsSchema },
    ]),
    SectionsModule,
  ],
  providers: [
    ProductsService,
    ProductsResolver,
    AzureBlobStorageService,
    SlugProductsInterceptor,
  ],
  exports: [ProductsService],
})
export class ProductsModule {}
