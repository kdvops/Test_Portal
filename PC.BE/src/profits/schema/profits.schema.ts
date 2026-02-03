import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT OBJECTS TYPES FOR PROFITS
import {
  DateRangeProfitType,
  DescriptionLargeProfitType,
} from '../../common/types/profits.type';

// IMPORT CATEGORIES SCHEMA
import { Categories } from 'src/categories/schema/categories.schema';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type ProfitsDocument = Profits & Document;

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});

// SCHEMA TYPES PROFITS
@Schema()
@ObjectType()
export class Profits extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => DescriptionLargeProfitType)
  description: DescriptionLargeProfitType;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Categories.name })
  @Field(() => String)
  category: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => String)
  color: string;

  @Prop()
  @Field(() => String)
  percent: string;

  @Prop()
  @Field(() => String)
  devolution: string;

  @Prop()
  @Field(() => String)
  condition: string;

  @Prop()
  @Field(() => Boolean)
  disabled: boolean;

  @Prop()
  @Field(() => String, { nullable: true })
  picture?: string;
  
  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  pictureImageDetail?: ImageDetailType;

  @Prop()
  @Field(() => DateRangeProfitType)
  date: DateRangeProfitType;

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

export const ProfitsSchema = SchemaFactory.createForClass(Profits);
