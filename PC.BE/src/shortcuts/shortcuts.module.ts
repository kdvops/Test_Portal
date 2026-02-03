import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { ShortcutsService } from './shortcuts.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { ShortcutsResolver } from './shortcuts.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Shortcuts, ShortcutsSchema } from './schema/shortcuts.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shortcuts.name, schema: ShortcutsSchema },
    ]),
  ],
  providers: [ShortcutsService, ShortcutsResolver, AzureBlobStorageService],
  exports: [ShortcutsService],
})
export class ShortcutsModule {}
