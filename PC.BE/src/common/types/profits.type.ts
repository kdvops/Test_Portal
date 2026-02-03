import { ObjectType, Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES DATE RANGE FOR PROFITS
@InputType()
export class DateRangeProfitInput {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

@ObjectType()
export class DateRangeProfitType {
  @Field(() => Date)
  start: Date;

  @Field(() => Date)
  end: Date;
}

// OBJECTS TYPES DESCRIPTION LARGE FOR PROFITS
@InputType()
export class DescriptionLargeProfitInput {
  @Field(() => String)
  text: string;

  @Field(() => Boolean)
  enabled: boolean;
}

@ObjectType()
export class DescriptionLargeProfitType {
  @Field(() => String)
  text: string;

  @Field(() => Boolean)
  enabled: boolean;
}
