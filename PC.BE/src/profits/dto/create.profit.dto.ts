import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import {
  DateRangeProfitInput,
  DescriptionLargeProfitInput,
} from '../../common/types/profits.type';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInput } from 'src/common/types/common.type';

@InputType()
export class ProfitImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class CreateProfit {
  @Field(() => String)
  name: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  percent: string;

  @Field(() => String)
  color: string;

  @Field(() => String)
  category: string;

  @Field(() => DescriptionLargeProfitInput, { nullable: true })
  description: DescriptionLargeProfitInput;

  @Field(() => String)
  devolution: string;

  @Field(() => String)
  condition: string;

  @Field(() => [ProfitImage], { nullable: true })
  picture?: ProfitImage[];

  @Field(() => ImageDetailInput, { nullable: true })
  pictureImageDetail: ImageDetailInput;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => DateRangeProfitInput)
  date: DateRangeProfitInput;
}

@InputType()
export class CreateProfitDto {
  @Field(() => [CreateProfit])
  profits: CreateProfit[];
}
