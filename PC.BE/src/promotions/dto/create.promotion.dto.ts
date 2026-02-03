import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import { DateRangeInput } from '../../common/types/promotions.type';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInput } from 'src/common/types/common.type';

@InputType()
export class PromotionImage {
  @Field(() => String)
  img?: string;

  @Field(() => String)
  filetype?: string;
}

@InputType()
export class CreatePromotion {
  @Field(() => String)
  name: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  percent: string;

  @Field(() => String)
  devolution: string;

  @Field(() => String)
  condition: string;

  @Field(() => String)
  extract: string;

  @Field(() => [PromotionImage], { nullable: true })
  picture: PromotionImage[];

  @Field(() => ImageDetailInput, { nullable: true })
  pictureImageDetail: ImageDetailInput;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => DateRangeInput)
  date: DateRangeInput;
}

@InputType()
export class CreatePromotionDto {
  @Field(() => [CreatePromotion])
  promotions: CreatePromotion[];
}
