import type { ImageDetailInterface } from "./detailed-image.interface";

export interface PromotionDateRangeInterface {
  start: Date;
  end: Date;
}

export interface PromotionInterface {
  _id?: string;
  name: string;
  percent: string;
  devolution: string;
  condition: string;
  extract: string;
  disabled: boolean;
  picture: any;
  pictureImageDetail?: ImageDetailInterface | null;
  date: PromotionDateRangeInterface;
}
