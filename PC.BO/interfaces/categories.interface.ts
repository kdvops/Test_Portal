import type { FeaturesCategoryType } from "./features.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";

export interface PicturesCategoryType {
  banner: string;
  responsive: string;
  thumbnail: string;
  bannerImageDetail?: ImageDetailInterface | null;
  responsiveImageDetail?: ImageDetailInterface | null;
  thumbnailImageDetail?: ImageDetailInterface | null;
}

export interface NewPictureCategory {
  img?: string;
  filetype?: string;
}

export interface CategoriesByParentInterface {
  parent: string;
  subcategories: Array<CategoriesInterface>;
}

export interface CategoriesInterface {
  _id?: string;
  status?: 'draft' | 'publish' | 'trash';
  name: string;
  slug?: string;
  excerpt: string;
  features?: FeaturesCategoryType[];
  description: string;
  tags?: string[];
  parentID?: null | string | CategoriesInterface;
  subcategories?: Array<CategoriesInterface>;
  parentTarget?: string | null;
  pictures: PicturesCategoryType;
  disabled: boolean;
  target: string;
  targetID?: string; // Dynamic target (Mongo ObjectId)
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
