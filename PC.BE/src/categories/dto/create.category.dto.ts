import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// IMPORT TYPES FEATURES CATEGORY
import { PicturesCategoryInput } from '../..//common/types/categories.type';
import { SeoFieldsInput } from 'src/common/types/common.type';

// ENUMS TARGET CATEGORIES
import {
  TargetCategories,
  TargetParentCategories,
} from '../../common/enums/target.enum';

// IMPORT ENUMS STATUS ITEMS
import { StatusItem } from 'src/common/enums/status.enums';

@InputType()
export class CreateCategoryDto extends SeoFieldsInput {
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

  @Field(() => Types.ObjectId, { nullable: true })
  parentID: Types.ObjectId;

  @Field(() => TargetParentCategories, { nullable: true })
  parentTarget: TargetParentCategories;

  @Field(() => TargetCategories, { nullable: true })
  target: TargetCategories;

  @Field(() => Types.ObjectId, { nullable: true })
  targetID: Types.ObjectId;

  @Field(() => [String])
  tags: string[];

  @Field(() => PicturesCategoryInput)
  pictures: PicturesCategoryInput;

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
