import { Field, ObjectType } from '@nestjs/graphql';

// IMPORT SCHEMA CATEGORIES
import { Sections } from 'src/sections/schema/sections.schema';

// IMPORT ENUMS STATUS
import { StatusItem } from 'src/common/enums/status.enums';
import { GlobalPositionsFreatured } from 'src/common/enums/target.enum';
import { SeoFieldsType } from 'src/common/types/common.type';

@ObjectType()
export class TargetsList extends SeoFieldsType {
  @Field(() => String)
  _id: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => String)
  name: string;

  @Field(() => String)
  icon: string;

  @Field(() => GlobalPositionsFreatured)
  featured: GlobalPositionsFreatured;

  @Field(() => String)
  color: string;

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

  @Field(() => [Sections])
  sections: Sections[];

  @Field(() => [String], { nullable: true })
  relatedTargets: string[];
}
