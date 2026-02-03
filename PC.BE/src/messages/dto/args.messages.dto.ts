import { Field, InputType, ObjectType } from '@nestjs/graphql';

// IMPORT TYPES
import { InputsFormsMessageValuesType } from 'src/common/types/forms.types';

// IMPORT SCHEMA
import { Forms } from 'src/forms/schema/forms.schema';

@InputType()
export class DateRangeMessageInput {
  @Field(() => Date, { nullable: true })
  start: Date;

  @Field(() => Date, { nullable: true })
  end: Date;
}

@InputType()
export class ArgsMessages {
  @Field(() => DateRangeMessageInput)
  date: DateRangeMessageInput;

  @Field(() => String)
  formRef: string;

  @Field(() => String)
  search: string;
}

@ObjectType()
export class MessagesByGroupType {
  @Field(() => Forms)
  form: Forms;

  @Field(() => [MessagesPostType])
  messages: MessagesPostType[];
}

@ObjectType()
export class MessagesPostType {
  @Field(() => String)
  _id: string;

  @Field(() => Forms)
  form: Forms;

  @Field(() => [InputsFormsMessageValuesType])
  values: InputsFormsMessageValuesType[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}
