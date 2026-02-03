import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { ChannelsService } from './channels.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { ChannelsResolver } from './channels.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Channels, ChannelsSchema } from './schema/channels.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// IMPORT INTERCEPTOR
import { SlugChannelsInterceptor } from './interceptor/channels.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Channels.name, schema: ChannelsSchema },
    ]),
    SectionsModule,
  ],
  providers: [
    ChannelsService,
    ChannelsResolver,
    AzureBlobStorageService,
    SlugChannelsInterceptor,
  ],
  exports: [ChannelsService],
})
export class ChannelsModule {}
