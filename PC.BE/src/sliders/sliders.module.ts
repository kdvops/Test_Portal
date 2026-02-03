import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { SlidersService } from './sliders.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { SlidersResolver } from './sliders.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Sliders, SlidersSchema } from './schema/sliders.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sliders.name, schema: SlidersSchema }]),
  ],
  providers: [SlidersService, SlidersResolver, AzureBlobStorageService],
  exports: [SlidersService],
})
export class SlidersModule {}
