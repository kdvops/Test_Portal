import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';
import { Categories } from 'src/categories/schema/categories.schema';

// IMPORT SCHEMA SECTIONS
import { Sections } from 'src/sections/schema/sections.schema';

// IMPORT ENUMS
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

@InputType()
export class ArgsBusiness {
  @Field(() => String)
  category: string;

  @Field(() => String)
  search: string;
}

@ObjectType()
export class BusinessByGroupType {
  @Field(() => Categories)
  category: Categories;

  @Field(() => [BusinessPostType])
  business: BusinessPostType[];
}

@ObjectType()
export class BusinessPostType {
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  slug: string;

  @Field(() => String, { nullable: true })
  link: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

  @Field(() => Categories)
  category: Categories;

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

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [Sections])
  sections: Sections[];

  @Field(() => Date)
  createdAt: Date;
}
