import type { ImageDetailInterface } from "./detailed-image.interface";

export interface PromotionByMonthInterface {
  promotions: Array<PromotionInterface>;
  createdAt: string;
}

export interface DialogCreatePromotionInterface {
  show: boolean;
  position: number;
  promotion: PromotionInterface | undefined;
}

export interface NewPicturePromotion {
  img: string;
  filetype: string;
}

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
