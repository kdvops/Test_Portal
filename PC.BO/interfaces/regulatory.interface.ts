import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface RegulatoryGroupInterface {
  category: CategoriesInterface;
  regulatory: Array<RegulatoryInterface>;
}

export interface RegulatoryInterface {
  _id?: string;
  status?: 'draft' | 'publish' | 'trash';
  title: string;
  slug: string;
  excerpt: string;
  link: string;
  subtitle: string;
  category: null | string | CategoriesInterface;
  description: string;
  sections: Array<SectionTypeInterface>;
  banner: string;
  responsive: string;
  thumbnail: string;
  bannerImageDetail?: ImageDetailInterface | null;
  responsiveImageDetail?: ImageDetailInterface | null;
  thumbnailImageDetail?: ImageDetailInterface | null;
  disabled: boolean;
}
