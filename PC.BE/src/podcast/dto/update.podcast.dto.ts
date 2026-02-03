import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@InputType()
export class UpdatePodcastCover {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class UpdatePodcastEpisode {
  @Field(() => String)
  title: string;

  @Field(() => String)
  season: string;

  @Field(() => String)
  link: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  cover?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  coverImageDetail?: ImageDetailInputUpdate;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;
  
  @Field(() => Boolean)
  disabled: boolean;
}

@InputType()
export class UpdatePodcastEpisodeDto {
  @Field(() => Types.ObjectId)
  episodeID: Types.ObjectId;

  @Field(() => [UpdatePodcastCover], { nullable: true })
  newCoverPodcast: UpdatePodcastCover[];

  @Field(() => UpdatePodcastEpisode)
  episode: UpdatePodcastEpisode;
}
