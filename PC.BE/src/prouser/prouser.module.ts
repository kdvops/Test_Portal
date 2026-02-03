import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { ProuserService } from './prouser.service';
import { AzureBlobStorageService } from '../azure-blob-storage/azure-blob-storage.service';

// IMPORT RESOLVERS
import { ProuserResolver } from './prouser.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Prouser, ProuserSchema } from './schema/prouser.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

// FETCH HTTP MODULE
import { HttpModule } from '@nestjs/axios';

// IMPORT INTERCEPTOR
import { SlugProuserInterceptor } from './interceptor/prouser.slug.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Prouser.name, schema: ProuserSchema }]),
    HttpModule,
    SectionsModule,
  ],
  providers: [
    ProuserService,
    ProuserResolver,
    AzureBlobStorageService,
    SlugProuserInterceptor,
  ],
  exports: [ProuserService],
})
export class ProuserModule {}
