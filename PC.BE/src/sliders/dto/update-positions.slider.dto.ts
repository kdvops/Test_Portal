import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class SliderPositionInput {
  @Field(() => String)
  id: string;

  @Field(() => Number, { nullable: true })
  position: number;
}

@InputType()
export class UpdatePositionsSliderDto {
  @Field(() => [SliderPositionInput])
  sliders: SliderPositionInput[];
}

