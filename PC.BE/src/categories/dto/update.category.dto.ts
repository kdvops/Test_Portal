import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// IMPORT TYPES FEATURES CATEGORY
import { PicturesCategoryInputUpdate } from '../..//common/types/categories.type';
import { SeoFieldsInputUpdate } from 'src/common/types/common.type';
import {
  TargetCategories,
  TargetParentCategories,
} from 'src/common/enums/target.enum';

// IMPORT ENUMS STATUS ITEMS
import { StatusItem } from 'src/common/enums/status.enums';

@InputType()
export class UpdateCategory extends SeoFieldsInputUpdate {
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  slug: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => TargetCategories, { nullable: true })
  target: TargetCategories;

  @Field(() => Types.ObjectId, { nullable: true })
  targetID: Types.ObjectId;

  @Field(() => Types.ObjectId, { nullable: true })
  parentID: Types.ObjectId;

  @Field(() => TargetParentCategories, { nullable: true })
  parentTarget: TargetParentCategories;

  @Field(() => PicturesCategoryInputUpdate)
  pictures: PicturesCategoryInputUpdate;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => [String], { nullable: true })
  relatedCategories: string[];

  @Field(() => [String], { nullable: true })
  relatedTargets: string[];

  @Field(() => Boolean, { nullable: true })
  isFeatured: boolean;

  @Field(() => [String], { nullable: true })
  slugHistory: string[];
}

@InputType()
export class UpdateCategoryDto {
  @Field(() => Types.ObjectId)
  _id: Types.ObjectId;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  slug: string;

  @Field(() => [String])
  tags: string[];

  @Field(() => TargetCategories, { nullable: true })
  target: TargetCategories;

  @Field(() => Types.ObjectId, { nullable: true })
  targetID: Types.ObjectId;

  @Field(() => Types.ObjectId, { nullable: true })
  parentID: Types.ObjectId;

  @Field(() => TargetParentCategories, { nullable: true })
  parentTarget: TargetParentCategories;

  @Field(() => PicturesCategoryInputUpdate)
  pictures: PicturesCategoryInputUpdate;

  @Field(() => Boolean)
  disabled: boolean;
}
