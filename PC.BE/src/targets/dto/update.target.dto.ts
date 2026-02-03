import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import { SectionInputUpdate } from '../../common/types/sections.type';
import { SeoFieldsInputUpdate } from 'src/common/types/common.type';

// IMPORT ENUM STATUS ITEMS
import { StatusItem } from 'src/common/enums/status.enums';
import { GlobalPositionsFreatured } from 'src/common/enums/target.enum';

@InputType()
export class UpdateTarget extends SeoFieldsInputUpdate {
  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String)
  icon: string;

  @Field(() => String)
  color: string;

  @Field(() => GlobalPositionsFreatured)
  featured: GlobalPositionsFreatured;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  slug: string;

  @Field(() => Boolean, { nullable: true })
  showPosts: boolean;

  @Field(() => Boolean, { nullable: true })
  showCategories: boolean;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputUpdate])
  sections: SectionInputUpdate[];

  @Field(() => [String], { nullable: true })
  relatedTargets: string[];
}

@InputType()
export class UpdateTargetDto {
  @Field(() => String)
  targetID: string;

  @Field(() => UpdateTarget)
  target: UpdateTarget;
}
