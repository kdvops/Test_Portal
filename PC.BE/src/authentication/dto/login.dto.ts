import { Field, InputType, ObjectType } from '@nestjs/graphql';

@InputType()
export class LoginDto {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@ObjectType()
export class Token {
  @Field(() => String)
  access_token: string;

  @Field(() => Number)
  expired_in: number;

  @Field(() => String)
  token_type: string;
}

@ObjectType()
export class LoginResponse {
  @Field(() => Token)
  token: Token;
}
