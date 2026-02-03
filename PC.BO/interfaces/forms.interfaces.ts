import type { ImageDetailInterface } from "./detailed-image.interface";

export interface DialogCreateInputsFormsInterface {
  show: boolean;
  position: number;
  action: 'create' | 'update';
  input: InputsBscFormInterface,
  item: string
}

export interface TermsAndConditionForm {
  text: string;
  accept: boolean;
  enabled: boolean;
}

export interface InputsBscFormInterface {
  id?: string;
  name: string;
  label: string;
  icon: string;
  placeholder: string;
  type: string;
  value?: string;
  hidden?: boolean;
  radios: Array<string>;
  selects: Array<string>;
  checkbox: Array<string>;

  // KEY: VALUE
  [key: string]: any;
}

export interface CrmFormInterface {
  isFormCrm: boolean;
  url: string;
}

export interface FormsBscInterfaces {
  _id?: string;
  status?: 'draft' | 'publish' | 'trash';
  title: string;
  slug: string;
  crm?: CrmFormInterface
  subtitle: string;
  description: string;
  banner: string;  
  bannerImageDetail?: ImageDetailInterface | null;
  inputs: Array<InputsBscFormInterface>;
  termsAndCondition: TermsAndConditionForm;
  disabled: boolean;
}
