import { Field, InputType, ObjectType, PartialType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@InputType({ isAbstract: true })
@ObjectType({ isAbstract: true })
abstract class ImageDetailBase {
  @Field(() => String)
  image: string;

  @Field(() => String, { nullable: true })
  altText: string;

  @Field(() => Boolean, { nullable: true })
  isCover?: boolean;
}

@InputType({ isAbstract: true })
abstract class ImageDetailWithDates extends ImageDetailBase {
  @Field(() => Date, { nullable: true })
  deletedAt?: Date;

  @Field(() => Date, { nullable: true })
  updatedAt?: Date;
}

@InputType()
export class ImageDetailInput extends ImageDetailWithDates {}

@InputType()
export class ImageDetailInputUpdate extends ImageDetailWithDates {
  @Field(() => Types.ObjectId, { nullable: true })
  _id: Types.ObjectId;
}

@ObjectType()
export class ImageDetailType extends ImageDetailBase {
  @Field(() => Types.ObjectId, { nullable: true })
  _id?: Types.ObjectId;
}

@InputType({ isAbstract: true })
@ObjectType({ isAbstract: true })
abstract class SeoFieldsBase {
  @Prop()
  @Field(() => String, { nullable: true })
  altTextBanner: string;

  @Prop()
  @Field(() => String, { nullable: true })
  altTextThumbnail: string;

  @Prop()
  @Field(() => String, { nullable: true })
  altTextResponsive: string;

  @Prop()
  @Field(() => String, { nullable: true })
  metaTitle: string;

  @Prop()
  @Field(() => String, { nullable: true })
  metaDescription: string;

  @Prop([String])
  @Field(() => [String], { nullable: true })
  keywords: string[];

  @Prop()
  @Field(() => String, { nullable: true })
  canonicalUrl: string;

  @Prop([String])
  @Field(() => [String], { nullable: true })
  tags: string[];

  @Prop()
  @Field(() => String, { nullable: true })
  ogImage: string;

  @Prop()
  @Field(() => String, { nullable: true })
  twitterImage: string;

  @Prop()
  @Field(() => String, { nullable: true })
  socialTitle: string;

  @Prop()
  @Field(() => String, { nullable: true })
  socialDescription: string;

  @Prop()
  @Field(() => String, { nullable: true })
  altText: string;

  @Prop()
  @Field(() => Number, { nullable: true })
  readingTime: number;

  @Prop()
  @Field(() => String, { nullable: true })
  robotsDirectives: string;

  @Prop()
  @Field(() => String, { nullable: true })
  language: string;

  @Prop()
  @Field(() => String, { nullable: true })
  structuredType: string;

  @Prop()
  @Field(() => String, { nullable: true })
  focusKeyword: string;

  @Prop({ default: false })
  @Field(() => Boolean, { nullable: true })
  isFeatured: boolean;

  @Prop({ type: Object, default: null })
  @Field(() => String, { nullable: true })
  schemaMarkup: string;
}

@InputType()
export class SeoFieldsInput extends SeoFieldsBase {
  @Field(() => [String], { nullable: true })
  relatedPosts: string[];
}

@InputType()
export class SeoFieldsInputUpdate extends PartialType(SeoFieldsInput) {}

// Shared SEO fields for Mongoose schemas / GraphQL ObjectTypes
export class SeoFieldsSchema extends SeoFieldsBase {}

@ObjectType()
export class SeoFieldsType extends SeoFieldsBase {
  @Field(() => [String], { nullable: true })
  relatedPosts: string[];
}
