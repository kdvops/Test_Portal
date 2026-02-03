import type { CategoriesInterface } from "./categories.interface";
import type { CommonImageDetailInterface } from "./common.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface DocumentValidatePersonInterface {
  TIPO_IDENTIFICACION: string;
  APELLIDO: string;
  CODIGO_TIPO_IDENTIFICACION: string;
  CODIGO_VALIDACION: string;
  DESCRIPCION: string;
  FECHA: string;
  HORA: string;
  NOMBRE: string;
  NOMBRE_DESTINATARIO: string;
  NUMERO_IDENTIFICACION: string;
  PERSONA_FIRMA: string;
}

export interface ProuserGroupInterface {
  category: CategoriesInterface;
  business: Array<ProuserInterface>;
}

export interface ProuserInterface extends CommonImageDetailInterface{
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  link: string;
  subtitle: string;
  description: string;
  category: string | CategoriesInterface;
  sections: Array<SectionTypeInterface>;
  banner: string;
  responsive: string;
  thumbnail: string;
  disabled: boolean;
}
