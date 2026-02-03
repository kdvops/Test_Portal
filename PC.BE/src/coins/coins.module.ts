import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { CoinsService } from './coins.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { CoinsResolver } from './coins.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Coins, CoinsSchema } from './schema/coins.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Coins.name, schema: CoinsSchema }]),
    SectionsModule,
  ],
  providers: [CoinsService, CoinsResolver, AzureBlobStorageService],
  exports: [CoinsService],
})
export class CoinsModule {}
