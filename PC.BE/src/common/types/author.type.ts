import { ObjectType, Field, InputType, ID } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import {
  ImageDetailInput,
  ImageDetailInputUpdate,
  ImageDetailType,
} from './common.type';

@ObjectType()
export class SocialType {
  @Prop({ default: null })
  @Field(() => String, { nullable: true })
  x?: string;

  @Prop({ default: null })
  @Field(() => String, { nullable: true })
  facebook?: string;

  @Prop({ default: null })
  @Field(() => String, { nullable: true })
  linkedin?: string;

  @Prop({ default: null })
  @Field(() => String, { nullable: true })
  instagram?: string;
}

@ObjectType()
export class AuthorType {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  @Field(() => ID, { nullable: true })
  _id?: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop({ default: null })
  @Field(() => String)
  position: string;

  @Prop({ default: null })
  @Field(() => ImageDetailType, { nullable: true })
  image?: ImageDetailType;

  @Field(() => SocialType, { nullable: true })
  socials?: SocialType;

  @Field(() => String, { nullable: true })
  biography?: string;
}

@InputType()
export class SocialInput {
  @Field(() => String, { nullable: true })
  x?: string;

  @Field(() => String, { nullable: true })
  facebook?: string;

  @Field(() => String, { nullable: true })
  linkedin?: string;

  @Field(() => String, { nullable: true })
  instagram?: string;
}

@InputType()
export class AuthorInput {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  position: string;

  @Field(() => ImageDetailInput, { nullable: true })
  image?: ImageDetailInput;

  @Field(() => SocialInput, { nullable: true })
  socials?: SocialInput;

  @Field(() => String, { nullable: true })
  biography?: string;
}

@InputType()
export class AuthorInputUpdate {
  @Field(() => ID, { nullable: true })
  _id?: MongooseSchema.Types.ObjectId;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  position: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  image?: ImageDetailInputUpdate;

  @Field(() => SocialInput, { nullable: true })
  socials?: SocialInput;

  @Field(() => String, { nullable: true })
  biography?: string;
}
