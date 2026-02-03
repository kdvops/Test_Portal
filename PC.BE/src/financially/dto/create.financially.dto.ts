import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import {
  SectionInputCreate,
  SectionImage,
  SectionFile,
} from '../../common/types/sections.type';
import { TypePostFinancially } from 'src/common/enums/financially.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInput, SeoFieldsInput } from 'src/common/types/common.type';
import { AuthorInput } from 'src/common/types/author.type';

@InputType()
export class CreateFinanciallyDto extends SeoFieldsInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  description: string;

  @Field(() => TypePostFinancially)
  type: TypePostFinancially;

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

  @Field(() => [SectionFile], { nullable: true })
  file: SectionFile[];

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputCreate])
  sections: SectionInputCreate[];

  @Field(() => Date, { nullable: true })
  pinnedAt?: Date;

  @Field(() => [AuthorInput], { nullable: true })
  authors?: AuthorInput[];
}
