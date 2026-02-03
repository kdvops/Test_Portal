import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { PromotionsService } from './promotions.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { PromotionsResolver } from './promotions.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Promotions, PromotionsSchema } from './schema/promotions.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Promotions.name, schema: PromotionsSchema },
    ]),
  ],
  providers: [PromotionsService, PromotionsResolver, AzureBlobStorageService],
  exports: [PromotionsService],
})
export class PromotionsModule {}
