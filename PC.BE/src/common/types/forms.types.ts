import { Field, InputType, ObjectType, ID } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';
import { TypeForms } from '../enums/forms.enum';
import { Schema as MongooseSchema } from 'mongoose';

@InputType()
export class TermsAndConditionFormsInput {
  @Prop()
  @Field(() => String)
  text: string;

  @Prop()
  @Field(() => Boolean)
  enabled: boolean;

  @Prop()
  @Field(() => Boolean)
  accept: boolean;
}

@InputType()
export class InputsFormsInput {
  @Field(() => String, { nullable: true })
  _id: string;

  @Field(() => String, { nullable: true })
  id: string;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => Boolean, { nullable: true })
  required: boolean;

  @Prop()
  @Field(() => String)
  label: string;

  @Prop()
  @Field(() => String)
  icon: string;

  @Prop()
  @Field(() => String)
  placeholder: string;

  @Prop()
  @Field(() => String, { nullable: true })
  value: string;

  @Prop()
  @Field(() => Boolean, { nullable: true })
  hidden: boolean;

  @Prop()
  @Field(() => TypeForms)
  type: TypeForms;

  @Prop()
  @Field(() => [String])
  radios: string[];

  @Prop()
  @Field(() => [String])
  selects: string[];

  @Prop()
  @Field(() => [String])
  checkbox: string[];
}

@ObjectType()
export class TermsAndConditionFormsType {
  @Prop()
  @Field(() => String)
  text: string;

  @Prop()
  @Field(() => Boolean)
  enabled: boolean;

  @Prop()
  @Field(() => Boolean)
  accept: boolean;
}

@ObjectType()
export class InputsFormsType {
  @Prop()
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Prop()
  @Field(() => String, { nullable: true })
  id: string;

  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => String)
  label: string;

  @Prop()
  @Field(() => String)
  icon: string;

  @Prop()
  @Field(() => String)
  placeholder: string;

  @Prop()
  @Field(() => String, { nullable: true })
  value: string;

  @Prop()
  @Field(() => Boolean, { nullable: true })
  hidden: boolean;

  @Prop()
  @Field(() => Boolean, { nullable: true })
  required: boolean;

  @Prop()
  @Field(() => TypeForms)
  type: TypeForms;

  @Prop()
  @Field(() => [String])
  radios: string[];

  @Prop()
  @Field(() => [String])
  selects: string[];

  @Prop()
  @Field(() => [String])
  checkbox: string[];
}

@ObjectType()
export class InputsFormsMessageValuesType {
  @Prop()
  @Field(() => String)
  name: string;

  @Prop()
  @Field(() => String)
  inputID: string;

  @Prop({ type: String })
  @Field(() => String)
  valueInput: string;

  @Prop({ type: [String] })
  @Field(() => [String])
  valuesInput: string[];

  @Prop()
  @Field(() => String)
  type: string;
}

@InputType()
export class InputsFormsMessageValuesInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  inputID: string;

  @Field(() => String)
  valueInput: string;

  @Field(() => [String])
  valuesInput: string[];

  @Field(() => String)
  type: string;
}
