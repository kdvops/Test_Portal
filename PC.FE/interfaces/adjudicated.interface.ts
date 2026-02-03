import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";

export type TypeStatusAdjudicated = 'soon' | 'available' | 'unavailable'

export interface AdjudicatedPictureInterface {
  _id: string;
  image: string;
  isCover: boolean;
}

export interface ProductAdjudicatedInterface {
  _id?: string;
  category: string | CategoriesInterface | null;
  status: TypeStatusAdjudicated;
  name: string;
  excerpt: string;
  description: string;
  pictures: Array<AdjudicatedPictureInterface>;
  picturesImageDetail: Array<ImageDetailInterface>;
  price: number;
  link?: string;
  address: string;
  province: string;
  phone: string;
  disabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}