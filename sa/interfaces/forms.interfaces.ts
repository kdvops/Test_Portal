import type { ImageDetailInterface } from "./detailed-image.interface";

export interface TermsAndConditionForm {
  text: string;
  accept: boolean;
  enabled: boolean;
}

export interface CrmFormInterface {
  isFormCrm: boolean;
  url: string;
}

export interface InputsBscFormInterface {
  id?: string;
  value?: string;
  name: string;
  label: string;
  icon: string;
  placeholder: string;
  type: string;
  hidden?: boolean;
  radios: Array<string>;
  selects: Array<string>;
  checkbox: Array<string>;

  // KEY: VALUE
  [key: string]: any;
}

export interface FormsBscInterfaces {
  _id?: string;
  title: string;
  subtitle: string;
  description: string;
  banner: string;
  bannerImageDetail?: ImageDetailInterface | null;
  crm?: CrmFormInterface;
  inputs: Array<InputsBscFormInterface>;
  termsAndCondition: TermsAndConditionForm;
  disabled: boolean;
}
