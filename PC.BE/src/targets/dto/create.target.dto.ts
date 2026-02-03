import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import { SectionInputCreate } from '../../common/types/sections.type';
import { SeoFieldsInput } from 'src/common/types/common.type';

// IMPORT ENUMS STATUS ITEMS
import { StatusItem } from 'src/common/enums/status.enums';
import { GlobalPositionsFreatured } from 'src/common/enums/target.enum';

@InputType()
export class CreateTargetDto extends SeoFieldsInput {
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

  @Field(() => String)
  slug: string;

  @Field(() => Boolean, { nullable: true })
  showPosts: boolean;

  @Field(() => Boolean, { nullable: true })
  showCategories: boolean;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputCreate])
  sections: SectionInputCreate[];

  @Field(() => [String], { nullable: true })
  relatedTargets: string[];
}
