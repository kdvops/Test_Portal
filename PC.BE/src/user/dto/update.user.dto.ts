import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class UpdateUserImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class UpdateUser {
  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  avatar: string;
}

@InputType()
export class UpdateUserDto {
  @Field(() => Types.ObjectId)
  userID: Types.ObjectId;

  @Field()
  user: UpdateUser;

  @Field(() => [UpdateUserImage], { nullable: true })
  newUploadAvatar: UpdateUserImage;
}
