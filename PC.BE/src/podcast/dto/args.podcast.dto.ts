import { Field, ObjectType } from '@nestjs/graphql';

// IMPORT OBJECTS TYPES FOR PROMOTION
import { Podcast } from '../schema/podcast.schema';
import { Categories } from '../../categories/schema/categories.schema';

@ObjectType()
export class EpisodePodcastGroupBySeason {
  @Field(() => [Podcast])
  episodes: Podcast[];

  @Field(() => Categories)
  season: Categories;
}
