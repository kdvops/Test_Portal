import type { CommonImageDetailInterface } from "./common.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";

export interface ProfitDescriptionInterface {
  text: string;
  enabled: boolean;
}

export interface ProfitDateRangeInterface {
  start: Date;
  end: Date;
}

export interface ProfitCardOptions {
  show: boolean;
  profit: ProfitInterface;
}

export interface ProfitInterface extends CommonImageDetailInterface{
  _id: string;
  category: string;
  color: string;
  condition: string;
  createdAt: string;
  date: ProfitDateRangeInterface;
  description: ProfitDescriptionInterface
  devolution: string;
  disabled: string;
  name: string;
  percent: string;
  picture: string;
  pictureImageDetail?: ImageDetailInterface | null;
}
