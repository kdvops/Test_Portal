import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// OBJECTS TYPES FEATURE SLIDER
import {
  DateRangeProfitInput,
  DescriptionLargeProfitInput,
} from '../../common/types/profits.type';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@InputType()
export class UpdateProfitImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class UpdateProfit {
  @Field(() => Types.ObjectId)
  _id: Types.ObjectId;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

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

  @Field(() => String, { nullable: true })
  picture?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  pictureImageDetail: ImageDetailInputUpdate;

  @Field(() => [UpdateProfitImage], { nullable: true })
  newPictureProfit: UpdateProfitImage[];

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => DateRangeProfitInput)
  date: DateRangeProfitInput;
}

@InputType()
export class UpdateProfitsDto {
  @Field(() => [UpdateProfit])
  profits: UpdateProfit[];
}
