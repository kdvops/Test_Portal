import { Args, Resolver, Query } from '@nestjs/graphql';

// IMPORT SERVICE
import { SearchService } from './search.service';

// IMPORT SCHEMA
import { SearchTypeSchema } from './schema/search.schema';

// IMPORT TYPE
import { SearchResultType } from './dto/args.search.dto';
import { validateSearchTerm } from './search.validation';

@Resolver(() => SearchTypeSchema)
export class SearchResolver {
  constructor(private searchService: SearchService) {}

  @Query(() => [SearchResultType])
  search(@Args('Search') search: string) {
    const normalized = validateSearchTerm(search);
    return this.searchService.search(normalized);
  }
}
