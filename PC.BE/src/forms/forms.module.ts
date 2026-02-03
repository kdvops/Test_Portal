import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { FormsService } from './forms.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { FormsResolver } from './forms.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Forms, FormsSchema } from './schema/forms.schema';

// IMPORT INTERCEPTOR
import { SlugFormsInterceptor } from './interceptor/forms.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Forms.name, schema: FormsSchema }]),
  ],
  providers: [
    FormsService,
    FormsResolver,
    AzureBlobStorageService,
    SlugFormsInterceptor,
  ],
  exports: [FormsService],
})
export class FormsModule {}
