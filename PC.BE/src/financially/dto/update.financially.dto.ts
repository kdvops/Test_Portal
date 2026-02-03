import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// OBJECTS TYPES FEATURE SLIDER
import {
  SectionInputUpdate,
  SectionImage,
  SectionFile,
} from '../../common/types/sections.type';
import { TypePostFinancially } from 'src/common/enums/financially.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  ImageDetailInputUpdate,
  SeoFieldsInputUpdate,
} from 'src/common/types/common.type';
import { AuthorInputUpdate } from 'src/common/types/author.type';

@InputType()
export class UpdateFinancially extends SeoFieldsInputUpdate {
  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

  @Field(() => TypePostFinancially)
  type: TypePostFinancially;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  bannerImageDetail: ImageDetailInputUpdate;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  thumbnailImageDetail: ImageDetailInputUpdate;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  responsiveImageDetail: ImageDetailInputUpdate;

  @Field(() => String)
  file: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputUpdate])
  sections: SectionInputUpdate[];

  @Field(() => Date, { nullable: true })
  pinnedAt?: Date;

  @Field(() => [AuthorInputUpdate], { nullable: true })
  authors?: AuthorInputUpdate[];
}

@InputType()
export class UpdateFinanciallyDto {
  @Field(() => Types.ObjectId)
  financiallyID: Types.ObjectId;

  @Field(() => UpdateFinancially)
  financially: UpdateFinancially;

  @Field(() => [SectionImage])
  newUploadBanner: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  newUploadThumbnail?: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  newUploadResponsive?: SectionImage[];

  @Field(() => [SectionFile])
  newUploadFile: SectionFile[];
}
