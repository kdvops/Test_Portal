import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';
import { OrientationPopup } from 'src/common/enums/popup.enum';

// ASSIGN SCHEMA TO DOCUMENT
export type PopupDocument = Popup & Document;

// ENUMS STYLES SECTIONS
registerEnumType(OrientationPopup, {
  name: 'OrientationPopup',
});

@ObjectType()
export class ButtonPopupType {
  @Prop()
  @Field(() => String)
  text: string;

  @Prop()
  @Field(() => String)
  background: string;

  @Prop()
  @Field(() => String)
  color: string;
}

// SCHEMA TYPES POPUP
@Schema()
@ObjectType()
export class Popup extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  title: string;

  @Prop()
  @Field(() => String)
  excerpt: string;

  @Prop({ default: OrientationPopup.popupBottomLeft })
  @Field(() => OrientationPopup)
  orientation: OrientationPopup;

  @Prop()
  @Field(() => String)
  subtitle: string;

  @Prop()
  @Field(() => String)
  description: string;

  @Prop({ type: ButtonPopupType })
  @Field(() => ButtonPopupType)
  button: ButtonPopupType;

  @Prop()
  @Field(() => String)
  background: string;

  @Prop()
  @Field(() => String)
  color: string;

  @Prop()
  @Field(() => String)
  link: string;

  @Prop()
  @Field(() => String)
  image: string;

  @Prop()
  @Field(() => Boolean)
  active: boolean;

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

export const PopupSchema = SchemaFactory.createForClass(Popup);
