import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';
import { InputsFormsMessageValuesType } from 'src/common/types/forms.types';

// IMPORT SCHEMA FOR PRODUCTS
import { Forms } from 'src/forms/schema/forms.schema';

// ASSIGN SCHEMA TO DOCUMENT
export type MessagesDocument = Messages & Document;

// SCHEMA TYPES PRODUCTS
@Schema()
@ObjectType()
export class Messages extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Forms.name })
  @Field(() => String)
  form: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => [InputsFormsMessageValuesType])
  values: InputsFormsMessageValuesType[];

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

export const MessagesSchema = SchemaFactory.createForClass(Messages);
