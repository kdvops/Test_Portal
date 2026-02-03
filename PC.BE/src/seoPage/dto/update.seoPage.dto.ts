import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';
import { SeoPageMetaInputUpdate } from 'src/common/types/seo.type';

@InputType()
export class UpdateSeoPageDto {
  @Field(() => Types.ObjectId)
  _id: Types.ObjectId;

  @Field(() => String)
  path: string;

  @Field(() => SeoPageMetaInputUpdate)
  meta: SeoPageMetaInputUpdate;
}
