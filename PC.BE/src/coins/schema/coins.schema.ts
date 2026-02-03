import { ObjectType, Field, ID } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';
import { ImageDetailType } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type CoinsDocument = Coins & Document;

@ObjectType()
export class PriceCoins {
  @Prop({ default: '0' })
  @Field(() => String)
  buy: string;

  @Prop({ default: '0' })
  @Field(() => String)
  sell: string;
}

// SCHEMA TYPES CATEGORY
@Schema()
@ObjectType()
export class Coins extends Document {
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ default: '' })
  @Field(() => String)
  name: string;

  @Prop({ default: { sell: '0', buy: '0' } })
  @Field(() => PriceCoins)
  price: PriceCoins;

  @Prop({ default: '' })
  @Field(() => String)
  prefix: string;

  @Prop({ default: '' })
  @Field(() => String, { nullable: true })
  logo: string;

  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  logoImageDetail: ImageDetailType;

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

export const CoinsSchema = SchemaFactory.createForClass(Coins);
