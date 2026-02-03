import { Field, ObjectType } from '@nestjs/graphql';

// IMPORT SCHEMA CATEGORIES
import { Categories } from 'src/categories/schema/categories.schema';
import { Sections } from 'src/sections/schema/sections.schema';

// IMPORT ENUMS STATUS
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

@ObjectType()
export class ProductsByParentTarget {
  @Field(() => String)
  _id: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  slug: string;

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

  @Field(() => String, { nullable: true })
  link: string;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [Sections])
  sections: Sections[];
}
