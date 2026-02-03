import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT OBJECTS TYPES FOR PODCAST
import { Categories } from 'src/categories/schema/categories.schema';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type PodcastDocument = Podcast & Document;

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});
// SCHEMA TYPES PROMOTION
@Schema()
@ObjectType()
export class Podcast extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  title: string;

  @Prop()
  @Field(() => String)
  description: string;

  @Prop()
  @Field(() => String, { nullable: true })
  slug: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Categories.name })
  @Field(() => String)
  season: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => String, { nullable: true })
  cover?: string;
  
  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  coverImageDetail?: ImageDetailType;

  @Prop()
  @Field(() => String)
  link: string;

  @Prop()
  @Field(() => Boolean)
  disabled: boolean;

  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;
  
  @Prop({ type: Date, default: Date.now() })
  @Field(() => Date)
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  @Field(() => Date)
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}

export const PodcastSchema = SchemaFactory.createForClass(Podcast);
