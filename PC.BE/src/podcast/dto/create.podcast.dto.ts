import { Field, InputType } from '@nestjs/graphql';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInput } from 'src/common/types/common.type';

@InputType()
export class PodcastImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class CreateEpisodePodcastDto {
  @Field(() => String)
  title: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  season: string;
  
  @Field(() => String)
  slug: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;
  
  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => String, { nullable: true })
  cover?: string;

  @Field(() => ImageDetailInput, { nullable: true })
  coverImageDetail?: ImageDetailInput;

  @Field(() => String)
  link: string;
}
