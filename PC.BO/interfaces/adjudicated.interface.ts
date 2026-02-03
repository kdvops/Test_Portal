import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";

export type TypeStatusAdjudicated = 'soon' | 'available' | 'unavailable'
export type TypeStatusItemAdjudicated = 'draft' | 'publish' | 'trash'

export interface AdjudicatedPictureInterface {
  _id?: string;
  image: string | Array<{img?: string, filetype?: string}>;
  newImage?: Array<{img?: string, filetype?: string}>;
  isCover: boolean;
  action?: 'create' | 'update' | 'delete'
}

export interface AdjudicatedProductsGroup {
  category: CategoriesInterface;
  products: Array<ProductAdjudicatedInterface>;
}

export interface ProductAdjudicatedInterface {
  _id?: string;
  category: string | CategoriesInterface | null;
  status: TypeStatusAdjudicated;
  item_status?: TypeStatusItemAdjudicated;
  name: string;
  excerpt: string;
  description: string;
  pictures: Array<AdjudicatedPictureInterface>;
  picturesImageDetail: Array<ImageDetailInterface>;
  price: number;
  link?: string;
  province: string;
  address: string;
  phone: string;
  disabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}