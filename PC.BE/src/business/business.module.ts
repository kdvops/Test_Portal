import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { BusinessService } from './business.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { BusinessResolver } from './business.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Business, BusinessSchema } from './schema/business.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// IMPORT INTERCEPTOR
import { SlugBusinessInterceptor } from './interceptor/business.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Business.name, schema: BusinessSchema },
    ]),
    SectionsModule,
  ],
  providers: [
    BusinessService,
    BusinessResolver,
    AzureBlobStorageService,
    SlugBusinessInterceptor,
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
