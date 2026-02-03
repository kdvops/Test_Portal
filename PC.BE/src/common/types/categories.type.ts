import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

// IMPORT OBJECTS TYPES FEATURES
import { Features } from 'src/features/schema/features.schema';
import {
  ImageDetailInput,
  ImageDetailInputUpdate,
  ImageDetailType,
} from './common.type';

@InputType()
export class CategoryImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

// FEATURES CATEGORY INPUT
@InputType()
export class FeaturesCategoryInput {
  @Field(() => String)
  feature: string;

  @Field(() => [String])
  values: string[];
}

// FEATURES CATEGORY TYPE
@ObjectType()
export class FeaturesCategoryType {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Features.name })
  @Field(() => String)
  feature: MongooseSchema.Types.ObjectId;

  @Prop({ default: [] })
  @Field(() => [String])
  values: string[];
}

// PICTURES CATEGORY INPUT
@InputType()
export class PicturesCategoryInputUpdate {
  @Field(() => String, { nullable: true })
  responsive: string;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  thumbnail: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  bannerImageDetail;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  responsiveImageDetail;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  thumbnailImageDetail;
}

// PICTURES CATEGORY INPUT
@InputType()
export class PicturesCategoryInput {
  @Field(() => String, { nullable: true })
  responsive: string;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  thumbnail: string;

  @Field(() => ImageDetailInput, { nullable: true })
  bannerImageDetail;

  @Field(() => ImageDetailInput, { nullable: true })
  responsiveImageDetail;

  @Field(() => ImageDetailInput, { nullable: true })
  thumbnailImageDetail;
}

// PICTURES CATEGORY TYPE
@ObjectType()
export class PicturesCategoryType {
  @Field(() => String, { nullable: true })
  responsive: string;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  thumbnail: string;

  @Field(() => ImageDetailType, { nullable: true })
  bannerImageDetail: ImageDetailType;

  @Field(() => ImageDetailType, { nullable: true })
  responsiveImageDetail: ImageDetailType;

  @Field(() => ImageDetailType, { nullable: true })
  thumbnailImageDetail: ImageDetailType;
}
