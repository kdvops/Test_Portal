import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SERVICES
import { LocationsService } from './locations.service';

// IMPORT RESOLVERS
import { LocationsResolver } from './locations.resolver';

// IMPORT SLIDER SCHEMA AND DOCUMENT
import { Locations, LocationsSchema } from './schema/locations.schema';

// IMPORT OTHER MODULES
import { SectionsModule } from 'src/sections/sections.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Locations.name, schema: LocationsSchema },
    ]),
    SectionsModule,
  ],
  providers: [LocationsService, LocationsResolver],
  exports: [LocationsService],
})
export class LocationsModule {}
