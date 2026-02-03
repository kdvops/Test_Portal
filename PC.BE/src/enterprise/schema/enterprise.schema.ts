import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT SCHEMA FOR CATEGORIES
import { Categories } from 'src/categories/schema/categories.schema';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

// IMPORT SCHEMA FOR ENTERPRISE
import { Sections } from 'src/sections/schema/sections.schema';

// ASSIGN SCHEMA TO DOCUMENT
export type EnterpriseDocument = Enterprise & Document;

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});

// SCHEMA TYPES ENTERPRISE
@Schema()
@ObjectType()
export class Enterprise extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Prop()
  @Field(() => String)
  title: string;

  @Prop({ unique: true })
  @Field(() => String)
  slug: string;

  @Prop()
  @Field(() => String)
  excerpt: string;

  @Prop()
  @Field(() => String)
  link: string;

  @Prop()
  @Field(() => String)
  subtitle: string;

  @Prop()
  @Field(() => String)
  description: string;

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

export const EnterpriseSchema = SchemaFactory.createForClass(Enterprise);
