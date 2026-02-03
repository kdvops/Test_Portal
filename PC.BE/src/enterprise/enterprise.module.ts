import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { EnterpriseService } from './enterprise.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { EnterpriseResolver } from './enterprise.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Enterprise, EnterpriseSchema } from './schema/enterprise.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// IMPORT INTERCEPTOR
import { SlugEnterpriseInterceptor } from './interceptor/enterprise.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Enterprise.name, schema: EnterpriseSchema },
    ]),
    SectionsModule,
  ],
  providers: [
    EnterpriseService,
    EnterpriseResolver,
    AzureBlobStorageService,
    SlugEnterpriseInterceptor,
  ],
  exports: [EnterpriseService],
})
export class EnterpriseModule {}
