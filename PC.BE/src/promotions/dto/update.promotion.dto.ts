import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// OBJECTS TYPES FEATURE SLIDER
import { DateRangeInput } from '../../common/types/promotions.type';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@InputType()
export class UpdatePromotionImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class UpdatePromotion {
  @Field(() => Types.ObjectId, { nullable: true })
  _id?: Types.ObjectId;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String)
  percent: string;

  @Field(() => String)
  devolution: string;

  @Field(() => String)
  condition: string;

  @Field(() => String)
  extract: string;

  @Field(() => String, { nullable: true })
  picture: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  pictureImageDetail: ImageDetailInputUpdate;

  @Field(() => [UpdatePromotionImage], { nullable: true })
  newPicturePromotion?: UpdatePromotionImage[];

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => DateRangeInput)
  date: DateRangeInput;
}

@InputType()
export class UpdatePromotionDto {
  @Field(() => [UpdatePromotion])
  promotions: UpdatePromotion[];
}
