import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { StatusItem } from 'src/common/enums/status.enums';
import { AuthorType } from 'src/common/types/author.type';
import { ImageDetailType, SeoFieldsType } from 'src/common/types/common.type';

// IMPORT SCHEMA SECTIONS
import { Sections } from 'src/sections/schema/sections.schema';

@InputType()
export class ArgsFinancially {
  @Field(() => String)
  type: string;

  @Field(() => String)
  search: string;

  @Field(() => Number, { nullable: true })
  page?: number;

  @Field(() => Number, { nullable: true })
  itemsPerPage?: number;
}

@ObjectType()
export class FinanciallyByGroupType {
  @Field(() => String)
  type: string;

  @Field(() => [FinanciallyPostType])
  financially: FinanciallyPostType[];
}

@ObjectType()
export class FinanciallyPostType extends SeoFieldsType {
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  slug: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  type: string;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => ImageDetailType, { nullable: true })
  bannerImageDetail: ImageDetailType;

  @Field(() => ImageDetailType, { nullable: true })
  thumbnailImageDetail: ImageDetailType;

  @Field(() => ImageDetailType, { nullable: true })
  responsiveImageDetail: ImageDetailType;

  @Field(() => String)
  file: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  /////////////////
  // SYSTEM FIELDS //
  /////////////////

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [Sections])
  sections: Sections[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  pinnedAt?: Date;

  @Field(() => [AuthorType], { nullable: true })
  authors?: AuthorType[];
}
