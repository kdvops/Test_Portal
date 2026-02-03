import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveProfitsDto {
  @Field(() => [String])
  profitsIDS: string[];
}
