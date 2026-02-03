import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { TypeStatusAdjudicated } from 'src/common/enums/adjudicated.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import { AdjudicatedPictureInputUpdate } from 'src/common/types/adjudicated.type';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@InputType()
class UpdateAdjudicated {
  @Field(() => String)
  category: string;

  @Field(() => TypeStatusAdjudicated)
  status: string;

  @Field(() => StatusItem, { nullable: true })
  item_status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  link?: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  description: string;

  @Field(() => [AdjudicatedPictureInputUpdate])
  pictures: AdjudicatedPictureInputUpdate[];

  @Field(() => [ImageDetailInputUpdate])
  picturesImageDetail: ImageDetailInputUpdate[];

  @Field(() => Number)
  price: number;

  @Field(() => String)
  address: string;

  @Field(() => String)
  province: string;

  @Field(() => String)
  phone: string;

  @Field(() => Boolean)
  disabled: boolean;
}

@InputType()
export class UpdateAdjudicatedDto {
  @Field(() => Types.ObjectId)
  adjudicatedID: Types.ObjectId;

  @Field(() => UpdateAdjudicated)
  adjudicated: UpdateAdjudicated;
}
