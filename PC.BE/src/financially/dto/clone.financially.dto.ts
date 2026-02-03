import { Field, InputType } from '@nestjs/graphql';

// OBJECTS TYPES FEATURE SLIDER
import { SectionInputUpdate } from '../../common/types/sections.type';
import { TypePostFinancially } from 'src/common/enums/financially.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import { AuthorInput, SocialInput } from 'src/common/types/author.type';
import { SeoFieldsInput } from 'src/common/types/common.type';

@InputType()
export class CloneFinancially extends SeoFieldsInput {
  @Field(() => String)
  title: string;

  @Field(() => String)
  slug: string;

  @Field(() => String)
  excerpt: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

  @Field(() => TypePostFinancially)
  type: TypePostFinancially;

  @Field(() => String)
  banner: string;

  @Field(() => String, { nullable: true })
  thumbnail?: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => String)
  file: string;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean, { nullable: true })
  disabled: boolean;

  @Field(() => [SectionInputUpdate])
  sections: SectionInputUpdate[];

  @Field(() => Date, { nullable: true })
  pinnedAt?: Date;

  @Field(() => [AuthorInput], { nullable: true })
  authors?: AuthorInput[];

  @Field(() => SocialInput, { nullable: true })
  socials?: SocialInput;
}
