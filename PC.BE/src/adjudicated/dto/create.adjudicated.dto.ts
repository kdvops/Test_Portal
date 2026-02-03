import { Field, InputType } from '@nestjs/graphql';
import { TypeStatusAdjudicated } from 'src/common/enums/adjudicated.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import { AdjudicatedPictureInput } from 'src/common/types/adjudicated.type';
import { ImageDetailInput } from 'src/common/types/common.type';

@InputType()
export class CreateAdjudicatedDto {
  @Field(() => String)
  category: string;

  @Field(() => StatusItem, { nullable: true })
  item_status: StatusItem;

  @Field(() => TypeStatusAdjudicated)
  status: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  link?: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  description: string;

  @Field(() => [AdjudicatedPictureInput])
  pictures: AdjudicatedPictureInput[];

  @Field(() => [ImageDetailInput])
  picturesImageDetail: ImageDetailInput[];

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
