import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreateUserDto {
  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  email: string;

  @Field(() => Date)
  birthday: Date;

  @Field(() => String)
  password: string;

  @Field(() => String)
  country: string;

  @Field(() => String)
  phone: string;
}
