import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document } from 'mongoose';

// IMPORT ENUMS FOR FINANCIALLY
import { TypePostFinancially } from 'src/common/enums/financially.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import { AuthorType } from 'src/common/types/author.type';
import { ImageDetailType, SeoFieldsSchema } from 'src/common/types/common.type';

// IMPORT SCHEMA FOR PRODUCTS
import { Sections } from 'src/sections/schema/sections.schema';

// ASSIGN SCHEMA TO DOCUMENT
export type FinanciallyDocument = Financially & Document;

// ENUMS TYPE POST
registerEnumType(TypePostFinancially, {
  name: 'TypePostFinancially',
});

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});
// SCHEMA TYPES FINANCIALLY
@Schema()
@ObjectType()
export class Financially extends SeoFieldsSchema {
  @Prop()
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

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
  subtitle: string;

  @Prop()
  @Field(() => String)
  description: string;

  @Prop({ default: TypePostFinancially.postEvents })
  @Field(() => TypePostFinancially)
  type: TypePostFinancially;

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
  file: string;

  @Prop()
  @Field(() => Boolean)
  disabled: boolean;

  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => [String], { nullable: true })
  relatedPosts: string[];

  @Field(() => Boolean, { nullable: true })
  isFeatured: boolean;

  @Field(() => String, { nullable: true })
  schemaMarkup: string;

  // -------------------------
  // SYSTEM FIELDS
  // -------------------------

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  pinnedAt?: Date;

  @Prop({ type: Date, default: Date.now() })
  @Field(() => Date)
  createdAt: Date;

  @Prop({ type: Date, default: Date.now() })
  @Field(() => Date)
  updatedAt: Date;

  @Prop({ type: Date, default: null })
  @Field(() => Date, { nullable: true })
  deletedAt: Date;

  @Prop({ type: [AuthorType], default: [] })
  @Field(() => [AuthorType], { nullable: true })
  authors?: AuthorType[];
}

export const FinanciallySchema = SchemaFactory.createForClass(Financially);
