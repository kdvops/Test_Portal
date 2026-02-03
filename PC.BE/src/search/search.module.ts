import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

// IMPORT SCHEMA
import { SearchSchema, SearchTypeSchema } from './schema/search.schema';

// IMPORT SERVICES
import { SearchService } from './search.service';

// IMPORT RESOLVERS
import { SearchResolver } from './search.resolver';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SearchTypeSchema.name, schema: SearchSchema },
    ]),
  ],
  providers: [SearchService, SearchResolver],
  exports: [SearchService],
})
export class SearchModule {}
