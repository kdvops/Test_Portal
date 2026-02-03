import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface InsuranceGroupInterface {
  category: CategoriesInterface;
  insurance: Array<InsuranceInterface>;
}

export interface InsuranceInterface {
  _id?: string;
  status?: 'draft' | 'publish' | 'trash';
  title: string;
  slug: string;
  excerpt: string;
  link: string;
  subtitle: string;
  description: string;
  category: string | CategoriesInterface;
  sections: Array<SectionTypeInterface>;
  banner?: string;
  responsive?: string;
  thumbnail?: string;
  bannerImageDetail?: ImageDetailInterface | null;
  responsiveImageDetail?: ImageDetailInterface | null;
  thumbnailImageDetail?: ImageDetailInterface | null;
  disabled: boolean;
}
