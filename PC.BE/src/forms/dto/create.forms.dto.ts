import { Field, InputType } from '@nestjs/graphql';

// IMPORT TYPES
import { SectionImage } from '../../common/types/sections.type';
import {
  InputsFormsInput,
  TermsAndConditionFormsInput,
} from 'src/common/types/forms.types';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailInput } from 'src/common/types/common.type';

@InputType()
export class CreateFormsCrmDto {
  @Field(() => String)
  url: string;

  @Field(() => Boolean)
  isFormCrm: boolean;
}

@InputType()
export class CreateFormsDto {
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

  @Field(() => [SectionImage], { nullable: true })
  banner: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  responsive?: SectionImage[];
  
  @Field(() => ImageDetailInput, { nullable: true })
  bannerImageDetail: ImageDetailInput;
  
  @Field(() => ImageDetailInput, { nullable: true })
  responsiveImageDetail: ImageDetailInput;

  @Field(() => [InputsFormsInput])
  inputs: InputsFormsInput[];

  @Field(() => TermsAndConditionFormsInput)
  termsAndCondition: TermsAndConditionFormsInput;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean)
  disabled: boolean;
}
