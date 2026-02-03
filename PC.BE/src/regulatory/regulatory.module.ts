import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { RegulatoryService } from './regulatory.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { RegulatoryResolver } from './regulatory.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Regulatory, RegulatorySchema } from './schema/regulatory.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// IMPORT INTERCEPTOR
import { SlugRegulatoryInterceptor } from './interceptor/regulatory.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Regulatory.name, schema: RegulatorySchema },
    ]),
    SectionsModule,
  ],
  providers: [
    RegulatoryService,
    RegulatoryResolver,
    AzureBlobStorageService,
    SlugRegulatoryInterceptor,
  ],
  exports: [RegulatoryService],
})
export class RegulatoryModule {}
