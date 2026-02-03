import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { TypeStatusAdjudicated } from 'src/common/enums/adjudicated.enum';

// IMPORT SCHEMAS
import { Categories } from 'src/categories/schema/categories.schema';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

@InputType()
export class ArgsAdjudicated {
  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => String, { nullable: true })
  category?: string;

  @Field(() => String, { nullable: true })
  province?: string;

  @Field(() => Number, { nullable: true })
  priceMin?: number;

  @Field(() => Number, { nullable: true })
  priceMax?: number;
}

@ObjectType()
export class AdjudicatedPictureTypeGroup {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  image: string;

  @Field(() => Boolean, { nullable: true, defaultValue: false })
  isCover: boolean;
}

@ObjectType()
export class AdjudicatedProductsByGroupCategory {
  @Field(() => Categories)
  category: Categories;

  @Field(() => [AdjudicatedProductType])
  products: AdjudicatedProductType[];
}

@ObjectType()
export class AdjudicatedProductType {
  @Field(() => String)
  _id: string;

  @Field(() => StatusItem, { nullable: true })
  item_status: StatusItem;

  @Field(() => String)
  category: string;

  @Field(() => TypeStatusAdjudicated)
  status: TypeStatusAdjudicated;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  link?: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  province: string;

  @Field(() => [AdjudicatedPictureTypeGroup], { nullable: true })
  pictures: AdjudicatedPictureTypeGroup[];
  
  @Field(() => [ImageDetailType], { nullable: true })
  picturesImageDetail: ImageDetailType[];

  @Field(() => Number)
  price: number;

  @Field(() => String)
  address: string;

  @Field(() => String)
  phone: string;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}
