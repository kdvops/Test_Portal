import { Field, InputType } from '@nestjs/graphql';
import { InputsFormsMessageValuesInput } from 'src/common/types/forms.types';

@InputType()
export class UpdateMessages {
  @Field(() => String)
  form: string;

  @Field(() => [InputsFormsMessageValuesInput])
  values: InputsFormsMessageValuesInput[];
}

@InputType()
export class UpdateMessagesDto {
  @Field(() => String)
  messagesID: string;

  @Field(() => UpdateMessages)
  messages: UpdateMessages;
}
