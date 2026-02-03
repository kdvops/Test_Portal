import { Field, InputType } from '@nestjs/graphql';
import { SectionInputUpdate } from 'src/common/types/sections.type';
import { Types } from 'mongoose';

@InputType()
export class UpdateSectionDto {
  @Field(() => Types.ObjectId)
  sectionID: Types.ObjectId;

  @Field(() => SectionInputUpdate)
  section: SectionInputUpdate;
}
