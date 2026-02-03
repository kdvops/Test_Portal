import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { InsuranceService } from './insurance.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { InsuranceResolver } from './insurance.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Insurance, InsuranceSchema } from './schema/insurance.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// IMPORT INTERCEPTOR
import { SlugInsuranceInterceptor } from './interceptor/insurance.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Insurance.name, schema: InsuranceSchema },
    ]),
    SectionsModule,
  ],
  providers: [
    InsuranceService,
    InsuranceResolver,
    AzureBlobStorageService,
    SlugInsuranceInterceptor,
  ],
  exports: [InsuranceService],
})
export class InsuranceModule {}
