import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORTS SCALARS
import { GraphQLJSONObject } from 'graphql-type-json';

// ASSIGN SCHEMA TO DOCUMENT
export type SearchDocument = SearchTypeSchema & Document;

// SCHEMA TYPES
@Schema()
@ObjectType()
export class SearchTypeSchema extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  text: string;

  @Prop()
  @Field(() => String)
  collections: string;

  @Prop({ type: JSON })
  @Field(() => GraphQLJSONObject)
  data?: object;
}

export const SearchSchema = SchemaFactory.createForClass(SearchTypeSchema);
