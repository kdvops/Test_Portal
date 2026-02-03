import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class RemoveSliderDto {
  @Field(() => String)
  sliderID: string;
}
