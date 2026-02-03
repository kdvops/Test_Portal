import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

@InputType()
export class RemovePromotionsDto {
  @Field(() => [Types.ObjectId])
  promotionsIDS: Types.ObjectId[];
}
