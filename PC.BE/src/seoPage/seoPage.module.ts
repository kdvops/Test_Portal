import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { SeoPageService } from './seoPage.service';
import { SeoPageResolver } from './seoPage.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { SeoPage, SeoPageSchema } from './schema/seoPage.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: SeoPage.name, schema: SeoPageSchema }]),
    SectionsModule,
  ],
  providers: [SeoPageService, SeoPageResolver],
  exports: [SeoPageService],
})
export class SeoPageModule {}
