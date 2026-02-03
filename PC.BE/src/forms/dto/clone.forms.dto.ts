import { Field, InputType } from '@nestjs/graphql';

// IMPORT TYPES
import { SectionImage } from '../../common/types/sections.type';
import {
  InputsFormsInput,
  TermsAndConditionFormsInput,
} from 'src/common/types/forms.types';
import { StatusItem } from 'src/common/enums/status.enums';
import { CreateFormsCrmDto } from './create.forms.dto';

@InputType()
export class CloneFormsDto {
  @Field(() => String)
  title: string;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  slug: string;

  @Field(() => CreateFormsCrmDto, { nullable: true })
  crm: CreateFormsCrmDto;

  @Field(() => String)
  description: string;

  @Field(() => [SectionImage])
  banner: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  responsive?: SectionImage[];

  @Field(() => [InputsFormsInput])
  inputs: InputsFormsInput[];

  @Field(() => TermsAndConditionFormsInput)
  termsAndCondition: TermsAndConditionFormsInput;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean)
  disabled: boolean;
}
