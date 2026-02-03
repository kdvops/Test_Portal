import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { AdjudicatedService } from './adjudicated.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { AdjudicatedResolver } from './adjudicated.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Adjudicated, AdjudicatedSchema } from './schema/adjudicated.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Adjudicated.name, schema: AdjudicatedSchema },
    ])
  ],
  providers: [AdjudicatedService, AdjudicatedResolver, AzureBlobStorageService],
  exports: [AdjudicatedService],
})
export class AdjudicatedModule { }
