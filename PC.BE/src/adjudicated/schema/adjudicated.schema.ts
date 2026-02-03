import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT SCHEMA REF
import { Categories } from 'src/categories/schema/categories.schema';

// IMPORT ENUMS FOR FORMS
import { TypeStatusAdjudicated } from 'src/common/enums/adjudicated.enum';
import { StatusItem } from 'src/common/enums/status.enums';

// IMPORT FORMS TYPES
import { AdjudicatedPictureType } from 'src/common/types/adjudicated.type';
import { ImageDetailType } from 'src/common/types/common.type';

// ASSIGN SCHEMA TO DOCUMENT
export type AdjudicatedDocument = Adjudicated & Document;

// ENUMS TYPE POST
registerEnumType(TypeStatusAdjudicated, {
  name: 'TypeStatusAdjudicated',
});

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});

// SCHEMA TYPES FORMS
@Schema()
@ObjectType()
export class Adjudicated extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  item_status: StatusItem;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: Categories.name })
  @Field(() => String)
  category: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => TypeStatusAdjudicated)
  status: TypeStatusAdjudicated;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => String, { nullable: true })
  link: string;

  @Prop()
  @Field(() => String)
  excerpt: string;

  @Prop()
  @Field(() => String)
  description: string;

  @Prop()
  @Field(() => String)
  province: string;

  @Prop()
  @Field(() => [AdjudicatedPictureType], { nullable: true })
  pictures: AdjudicatedPictureType[];

  @Prop()
  @Field(() => [ImageDetailType], { nullable: true })
  picturesImageDetail: ImageDetailType[];

  @Prop()
  @Field(() => Number)
  price: number;

  @Prop()
  @Field(() => String)
  address: string;

  @Prop()
  @Field(() => String)
  phone: string;

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

export const AdjudicatedSchema = SchemaFactory.createForClass(Adjudicated);
