import { Field, InputType } from '@nestjs/graphql';
import { Types } from 'mongoose';

// IMPORT TYPES
import { SectionImage } from '../../common/types/sections.type';
import {
  InputsFormsInput,
  TermsAndConditionFormsInput,
} from 'src/common/types/forms.types';
import { StatusItem } from 'src/common/enums/status.enums';
import { CreateFormsCrmDto } from './create.forms.dto';
import { ImageDetailInputUpdate } from 'src/common/types/common.type';

@InputType()
export class UpdateForms {
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

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => ImageDetailInputUpdate, { nullable: true })
  bannerImageDetail: ImageDetailInputUpdate;
  
  @Field(() => ImageDetailInputUpdate, { nullable: true })
  responsiveImageDetail: ImageDetailInputUpdate;  

  @Field(() => [InputsFormsInput])
  inputs: InputsFormsInput[];

  @Field(() => TermsAndConditionFormsInput)
  termsAndCondition: TermsAndConditionFormsInput;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean)
  disabled: boolean;
}

@InputType()
export class UpdateFormsDto {
  @Field(() => Types.ObjectId)
  formsID: Types.ObjectId;

  @Field(() => UpdateForms)
  forms: UpdateForms;

  @Field(() => [SectionImage])
  newUploadBanner: SectionImage[];

  @Field(() => [SectionImage], { nullable: true })
  newUploadResponsive?: SectionImage[];
}
