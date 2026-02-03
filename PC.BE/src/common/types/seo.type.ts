import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@ObjectType()
export class SeoPageMetaType {
  @Prop({ default: '' })
  @Field(() => String)
  title: string;

  @Prop({ default: null })
  @Field(() => String, { nullable: true })
  description: string | null;

  @Prop({ default: null })
  @Field(() => String, { nullable: true })
  image?: string;
}

@ObjectType()
export class SeoPageType {
  @Prop({ type: MongooseSchema.Types.ObjectId })
  @Field(() => String)
  _id: MongooseSchema.Types.ObjectId;

  @Prop({ default: '' })
  @Field(() => String)
  path: string;

  @Prop({ type: SeoPageMetaType, default: null })
  @Field(() => SeoPageMetaType, { nullable: true })
  meta: SeoPageMetaType;
}

@InputType()
export class SeoPageMetaInput {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  image?: string;
}

@InputType()
export class SeoPageInput {
  @Field(() => String)
  path: string;

  @Field(() => [SeoPageMetaInput])
  meta: SeoPageMetaInput[];
}

@InputType()
export class SeoPageMetaInputUpdate {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => String, { nullable: true })
  image?: string;
}

@InputType()
export class SeoPageInputUpdate {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String)
  path: string;

  @Field(() => [SeoPageMetaInput])
  meta: SeoPageMetaInput[];
}

@InputType()
export class SeoPages {
  @Field(() => [SeoPageInput])
  pages: SeoPageInput[];
}
