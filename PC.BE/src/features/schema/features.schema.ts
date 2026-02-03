import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT ENUMS TYPE FEATURES
import { TypeFeatures } from '../../common/enums/features.enum';

// ASSIGN SCHEMA TO DOCUMENT
export type FeaturesDocument = Features & Document;

// ENUMS TYPE FEATURES
registerEnumType(TypeFeatures, {
  name: 'TypeFeatures',
});

// SCHEMA TYPES CATEGORY
@Schema()
@ObjectType()
export class Features extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ default: '' })
  @Field(() => String)
  name: string;

  @Prop({ default: TypeFeatures.tabs })
  @Field(() => TypeFeatures)
  attribute: TypeFeatures;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now() })
  createdAt: Date;

  @Field(() => Date)
  @Prop({ type: Date, default: Date.now() })
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  @Prop({ type: Date, default: null })
  deletedAt: Date;
}

export const FeaturesSchema = SchemaFactory.createForClass(Features);
