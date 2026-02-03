import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

// IMPORT ENUMS TARGET CATEGORY
import {
  TargetCategories,
  TargetParentCategories,
} from '../../common/enums/target.enum';

// IMPORT TYPES FEATURES CATEGORY
import {
  FeaturesCategoryType,
  PicturesCategoryType,
} from '../../common/types/categories.type';
import { SeoFieldsSchema } from 'src/common/types/common.type';

// IMPORT ENUMS STATUS ITEMS
import { StatusItem } from 'src/common/enums/status.enums';

// IMPORT SCHEMA TARGETS
import { Targets } from 'src/targets/schema/targets.schema';

// ASSIGN SCHEMA TO DOCUMENT
export type CategoriesDocument = Categories & Document;

// ENUMS
registerEnumType(TargetParentCategories, { name: 'TargetParentCategories' });
registerEnumType(TargetCategories, { name: 'TargetCategories' });
registerEnumType(StatusItem, { name: 'StatusItem' });

@Schema()
@ObjectType()
export class Categories extends SeoFieldsSchema {
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Prop({ default: '' })
  @Field(() => String)
  name: string;

  @Prop({ default: '' })
  @Field(() => String)
  excerpt: string;

  @Prop({ default: '', unique: true })
  @Field(() => String, { nullable: true })
  slug: string;

  @Prop({ type: [FeaturesCategoryType], default: [] })
  @Field(() => [FeaturesCategoryType])
  features: FeaturesCategoryType[];

  @Prop({ default: '' })
  @Field(() => String)
  description: string;

  @Prop({ default: [] })
  @Field(() => [String])
  tags: string[];

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Categories.name,
    default: null,
  })
  @Field(() => ID, { nullable: true })
  parentID: MongooseSchema.Types.ObjectId;

  @Prop({ default: '' })
  @Field(() => TargetParentCategories, { nullable: true })
  parentTarget?: TargetParentCategories;

  @Prop()
  @Field(() => PicturesCategoryType)
  pictures: PicturesCategoryType;

  @Prop({ default: false })
  @Field(() => Boolean)
  disabled: boolean;

  @Prop({ default: null })
  @Field(() => TargetCategories, { nullable: true })
  target: TargetCategories;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: Targets.name,
    default: null,
  })
  @Field(() => ID, { nullable: true })
  targetID: MongooseSchema.Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Categories' })
  @Field(() => [ID], { nullable: true })
  relatedCategories: MongooseSchema.Types.ObjectId[];

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: 'Targets' })
  @Field(() => [ID], { nullable: true })
  relatedTargets: MongooseSchema.Types.ObjectId[];

  @Prop([String])
  @Field(() => [String], { nullable: true })
  slugHistory: string[];

  // -------------------------
  // SYSTEM FIELDS
  // -------------------------

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now })
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const CategoriesSchema = SchemaFactory.createForClass(Categories);
