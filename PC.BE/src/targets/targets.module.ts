import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { TargetsService } from './targets.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { TargetsResolver } from './targets.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Targets, TargetsSchema } from './schema/targets.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// IMPORT INTERCEPTOR
import { SlugTargetsInterceptor } from './interceptor/targets.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Targets.name, schema: TargetsSchema }]),
    SectionsModule,
  ],
  providers: [
    TargetsService,
    TargetsResolver,
    AzureBlobStorageService,
    SlugTargetsInterceptor,
  ],
  exports: [TargetsService],
})
export class TargetsModule {}
