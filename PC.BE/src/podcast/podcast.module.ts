import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { PodcastService } from './podcast.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { PodcastResolver } from './podcast.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Podcast, PodcastSchema } from './schema/podcast.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Podcast.name, schema: PodcastSchema }]),
  ],
  providers: [PodcastService, PodcastResolver, AzureBlobStorageService],
  exports: [PodcastService],
})
export class PodcastModule {}
