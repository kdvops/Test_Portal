import { Field, ID, InputType, ObjectType } from '@nestjs/graphql';
import { Schema as MongooseSchema } from 'mongoose';

@InputType()
export class FetchUsersArgsDto {
  @Field({ defaultValue: '' })
  search: string;
}

@ObjectType()
export class UserType {
  @Field(() => ID)
  _id: MongooseSchema.Types.ObjectId;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  displayName: string;

  @Field(() => String)
  avatar: string;

  @Field(() => String)
  address: string;

  @Field(() => String)
  country: string;

  @Field(() => Date)
  birthday: Date;

  @Field(() => String)
  phone: string;

  @Field(() => Number)
  rate: number;

  @Field(() => String)
  password: string;

  @Field(() => [String])
  roles: [string];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt: Date;
}
