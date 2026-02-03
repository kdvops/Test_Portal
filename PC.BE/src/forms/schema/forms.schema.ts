import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Schema, SchemaFactory, Prop } from '@nestjs/mongoose';
import { Schema as MongooseSchema, Document, Types } from 'mongoose';

// IMPORT ENUMS FOR FORMS
import { TypeForms } from 'src/common/enums/forms.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';

// IMPORT FORMS TYPES
import {
  InputsFormsType,
  TermsAndConditionFormsType,
} from 'src/common/types/forms.types';

// ASSIGN SCHEMA TO DOCUMENT
export type FormsDocument = Forms & Document;

// ENUMS TYPE POST
registerEnumType(TypeForms, {
  name: 'TypeForms',
});

// ENUMS STATUS
registerEnumType(StatusItem, {
  name: 'StatusItem',
});

@ObjectType()
export class CrmFormObjectType {
  @Prop()
  @Field(() => String)
  url: string;

  @Prop()
  @Field(() => Boolean)
  isFormCrm: boolean;
}

// SCHEMA TYPES FORMS
@Schema()
@ObjectType()
export class Forms extends Document {
  @Prop()
  @Field(() => ID)
  _id: Types.ObjectId;

  @Prop()
  @Field(() => String)
  title: string;

  @Prop({ unique: true })
  @Field(() => String)
  slug: string;

  @Prop()
  @Field(() => CrmFormObjectType, { nullable: true })
  crm: CrmFormObjectType;

  @Prop()
  @Field(() => String)
  subtitle: string;

  @Prop()
  @Field(() => String)
  description: string;

  @Prop()
  @Field(() => String)
  banner: string;

  @Prop()
  @Field(() => String, { nullable: true })
  responsive: string;
  
  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  bannerImageDetail: ImageDetailType;
  
  @Prop()
  @Field(() => ImageDetailType, { nullable: true })
  responsiveImageDetail: ImageDetailType;

  @Prop()
  @Field(() => [InputsFormsType])
  inputs: InputsFormsType[];

  @Prop()
  @Field(() => TermsAndConditionFormsType)
  termsAndCondition: TermsAndConditionFormsType;

  @Prop()
  @Field(() => Boolean)
  disabled: boolean;

  @Prop({ default: StatusItem.draft })
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

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

export const FormsSchema = SchemaFactory.createForClass(Forms);
