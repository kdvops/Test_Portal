import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';

// IMPORT CATEGORY SCHEMA
import { Categories } from '../schema/categories.schema';
import { PicturesCategoryType } from 'src/common/types/categories.type';
import { SeoFieldsType } from 'src/common/types/common.type';

// IMPORT ENUMS STATUS ITEMS
import { StatusItem } from 'src/common/enums/status.enums';

@InputType()
export class ParentAndTargetDto {
  @Field(() => String, { nullable: true })
  parentTarget?: string;

  @Field(() => String, { nullable: true })
  target?: string;
}

@ObjectType()
export class CategoriesByParent {
  @Field(() => String, { nullable: true })
  parent: string;

  @Field(() => [Categories], { defaultValue: [] })
  subcategories: [Categories];
}

@ObjectType()
export class CategoriesAndSubcategories extends SeoFieldsType {
  @Field(() => String)
  _id: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  slug: string;

  @Field(() => String, { nullable: true })
  parentTarget?: string;

  @Field(() => String, { nullable: true })
  target: string;

  @Field(() => String, { nullable: true })
  targetID: MongooseSchema.Types.ObjectId;

  @Field(() => String, { nullable: true })
  parentID: MongooseSchema.Types.ObjectId;

  @Field(() => [Categories], { nullable: true, defaultValue: [] })
  subcategories: Categories[];

  @Field(() => PicturesCategoryType)
  pictures: PicturesCategoryType;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => [String], { nullable: true })
  relatedCategories: string[];

  @Field(() => [String], { nullable: true })
  relatedTargets: string[];

  @Field(() => [String], { nullable: true })
  slugHistory: string[];

  @Field(() => Date, { nullable: true })
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}
