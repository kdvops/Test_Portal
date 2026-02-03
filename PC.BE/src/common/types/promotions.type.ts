import { ObjectType, Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES DATE RANGE FOR PROMOTIONS
@InputType()
export class DateRangeInput {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

@ObjectType()
export class DateRangeType {
  @Field(() => Date)
  start: string;

  @Field(() => Date)
  end: string;
}
