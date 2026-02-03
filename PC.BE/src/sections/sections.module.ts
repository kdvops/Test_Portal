import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { SectionsService } from './sections.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { SectionsResolver } from './sections.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Sections, SectionsSchema } from './schema/sections.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Sections.name, schema: SectionsSchema },
    ]),
  ],
  providers: [SectionsService, SectionsResolver, AzureBlobStorageService],
  exports: [SectionsService],
})
export class SectionsModule {}
