import type { CategoriesInterface } from "./categories.interface";
import type { CommonImageDetailInterface } from "./common.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface BusinessGroupInterface {
  category: CategoriesInterface;
  business: Array<BusinessInterface>;
}

export interface BusinessInterface extends CommonImageDetailInterface{
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

