import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES
import { InputsFormsMessageValuesInput } from 'src/common/types/forms.types';

@InputType()
export class CreateMessagesDto {
  @Field(() => Date)
  createdAt: Date;

  @Field(() => String)
  form: string;

  @Field(() => [InputsFormsMessageValuesInput])
  values: InputsFormsMessageValuesInput[];
}
