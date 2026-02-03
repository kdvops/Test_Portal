import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import {
  SectionInputCreate,
  SectionImage,
} from '../../common/types/sections.type';

// IMPORT STATUS
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInput } from 'src/common/types/common.type';

@InputType()
export class CreateBusinessDto {
  @Field(() => String)
  title: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  slug: string;

  @Field(() => String, { nullable: true })
  link: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  category: string;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => ImageDetailInput, { nullable: true })
  bannerImageDetail: ImageDetailInput;
  
  @Field(() => ImageDetailInput, { nullable: true })
  thumbnailImageDetail: ImageDetailInput;
  
  @Field(() => ImageDetailInput, { nullable: true })
  responsiveImageDetail: ImageDetailInput;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputCreate])
  sections: SectionInputCreate[];
}
