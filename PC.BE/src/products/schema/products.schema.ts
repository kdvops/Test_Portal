import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT SCHEMA FOR PRODUCTS
import { Categories } from 'src/categories/schema/categories.schema';
import { Sections } from 'src/sections/schema/sections.schema';

// IMPORT ENUMS STATUS
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type ProductsDocument = Products & Document;

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});

// SCHEMA TYPES PRODUCTS
@Schema()
@ObjectType()
export class Products extends Document {
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
  description: string;

  @Prop()
  @Field(() => String, { nullable: true })
  slug: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Categories.name })
  @Field(() => String)
  category: MongooseSchema.Types.ObjectId;

  @Prop({ type: [MongooseSchema.Types.ObjectId], ref: Sections.name })
  @Field(() => [String])
  sections: MongooseSchema.Types.ObjectId[];

  @Prop()
  @Field(() => String, { nullable: true })
  banner: string;

  @Prop()
  @Field(() => String, { nullable: true })
  thumbnail: string;

  @Prop()
  @Field(() => String, { nullable: true })
  responsive: string;
  
  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  bannerImageDetail: ImageDetailType;
  
  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  thumbnailImageDetail: ImageDetailType;
  
  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  responsiveImageDetail: ImageDetailType;

  @Prop()
  @Field(() => String)
  link: string;

  @Prop()
  @Field(() => Boolean)
  disabled: boolean;
  
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

export const ProductsSchema = SchemaFactory.createForClass(Products);
