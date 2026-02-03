import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import {
  SectionInputCreate,
  SectionImage,
} from '../../common/types/sections.type';
import { SeoFieldsInput } from 'src/common/types/common.type';

// IMPORT STATUS
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInput } from 'src/common/types/common.type';

@InputType()
export class CreatePostDto extends SeoFieldsInput {
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

  @Field(() => String, { nullable: true })
  author: string;

  @Field(() => Date, { nullable: true })
  publishedAt: Date;

  @Field(() => String)
  description: string;

  @Field(() => String)
  category: string;

  @Field(() => [SectionImage], { nullable: true })
  banner?: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  thumbnail?: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  responsive?: SectionImage[];

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
