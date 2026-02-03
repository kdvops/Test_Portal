import { Field, ObjectType } from '@nestjs/graphql';
import { StatusItem } from 'src/common/enums/status.enums';
import { ImageDetailType } from 'src/common/types/common.type';
import {
  InputsFormsType,
  TermsAndConditionFormsType,
} from 'src/common/types/forms.types';

@ObjectType()
export class FormsCrmDtoType {
  @Field(() => String)
  url: string;

  @Field(() => Boolean)
  isFormCrm: boolean;
}

@ObjectType()
export class FormsType {
  @Field(() => String)
  _id: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  slug: string;

  @Field(() => FormsCrmDtoType, { nullable: true })
  crm: FormsCrmDtoType;

  @Field(() => String)
  subtitle: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  banner: string;

  @Field(() => String, { nullable: true })
  responsive?: string;

  @Field(() => ImageDetailType, { nullable: true })
  bannerImageDetail: ImageDetailType;
  
  @Field(() => ImageDetailType, { nullable: true })
  responsiveImageDetail: ImageDetailType;

  @Field(() => [InputsFormsType])
  inputs: InputsFormsType[];

  @Field(() => TermsAndConditionFormsType)
  termsAndCondition: TermsAndConditionFormsType;

  @Field(() => StatusItem, { nullable: true })
  status: StatusItem;

  @Field(() => Boolean)
  disabled: boolean;

  @Field(() => Date)
  createdAt: Date;
}
