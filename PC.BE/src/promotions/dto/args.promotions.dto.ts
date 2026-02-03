import { Field, InputType, ObjectType } from '@nestjs/graphql';

// IMPORT OBJECTS TYPES FOR PROMOTION
import { Promotions } from '../schema/promotions.schema';

@InputType()
export class SearchArgs {
  @Field(() => String, { nullable: true })
  month: string;
}

@InputType()
export class ParamsByDate {
  @Field(() => String, { nullable: true })
  search?: string;

  @Field(() => String, { nullable: true })
  start?: string;

  @Field(() => String, { nullable: true })
  end?: string;
}

@ObjectType()
export class PromotionByMonth {
  @Field(() => [Promotions])
  promotions: Promotions[];

  @Field(() => String)
  createdAt: string;
}
