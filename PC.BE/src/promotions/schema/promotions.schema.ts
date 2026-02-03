import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT OBJECTS TYPES FOR PROMOTION
import { DateRangeType } from '../../common/types/promotions.type';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type PromotionsDocument = Promotions & Document;

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});

// SCHEMA TYPES PROMOTION
@Schema()
@ObjectType()
export class Promotions extends Document {
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
  @Field(() => String)
  percent: string;

  @Prop()
  @Field(() => String)
  devolution: string;

  @Prop()
  @Field(() => String)
  condition: string;

  @Prop()
  @Field(() => String)
  extract: string;

  @Prop()
  @Field(() => Boolean)
  disabled: boolean;

  @Prop()
  @Field(() => String, { nullable: true })
  picture: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  pictureImageDetail: ImageDetailType;

  @Prop()
  @Field(() => DateRangeType)
  date: DateRangeType;

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

export const PromotionsSchema = SchemaFactory.createForClass(Promotions);
