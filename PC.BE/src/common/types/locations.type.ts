import { ObjectType, Field, InputType } from '@nestjs/graphql';
import { Prop } from '@nestjs/mongoose';

// OBJECTS TYPES DATE RANGE FOR PROMOTIONS
@InputType()
export class WorkHoursRangeInput {
  @Field(() => String)
  day: string;

  @Field(() => String)
  start: string;

  @Field(() => String)
  end: string;
}

@ObjectType()
export class WorkHoursRangeType {
  @Prop()
  @Field(() => String)
  day: string;

  @Prop()
  @Field(() => String)
  start: string;

  @Prop()
  @Field(() => String)
  end: string;
}
