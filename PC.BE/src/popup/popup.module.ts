import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { PopupService } from './popup.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { PopupResolver } from './popup.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Popup, PopupSchema } from './schema/popup.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Popup.name, schema: PopupSchema }]),
    SectionsModule,
  ],
  providers: [PopupService, PopupResolver, AzureBlobStorageService],
  exports: [PopupService],
})
export class PopupModule {}
