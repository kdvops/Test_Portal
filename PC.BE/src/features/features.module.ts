import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { FeaturesService } from './features.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { FeaturesResolver } from './features.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Features, FeaturesSchema } from './schema/features.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Features.name, schema: FeaturesSchema },
    ]),
  ],
  providers: [FeaturesService, FeaturesResolver, AzureBlobStorageService],
  exports: [FeaturesService],
})
export class FeaturesModule {}
