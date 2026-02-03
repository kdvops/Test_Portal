import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { FinanciallyService } from './financially.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { FinanciallyResolver } from './financially.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Financially, FinanciallySchema } from './schema/financially.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// IMPORT INTERCEPTOR
import { SlugFinanciallyInterceptor } from './interceptor/financially.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Financially.name, schema: FinanciallySchema },
    ]),
    SectionsModule,
  ],
  providers: [
    FinanciallyService,
    FinanciallyResolver,
    AzureBlobStorageService,
    SlugFinanciallyInterceptor,
  ],
  exports: [FinanciallyService],
})
export class FinanciallyModule {}
