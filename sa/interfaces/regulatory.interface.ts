import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface RegulatoryGroupInterface {
  category: CategoriesInterface;
  regulatory: Array<RegulatoryInterface>;
}

export interface RegulatoryInterface {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  link: string;
  subtitle: string;
  category: null | string | CategoriesInterface;
  description: string;
  sections: Array<SectionTypeInterface>;
  banner: string;  
  bannerImageDetail?: ImageDetailInterface | null;
  disabled: boolean;
}
