import type { ImageDetailInterface } from "./detailed-image.interface";

export interface SlidersForTarget {
  bannerHome: Array<SliderInterface>;
  bannerProfits: Array<SliderInterface>;
  bannerPromotions: Array<SliderInterface>;
  bannerFinancially: Array<SliderInterface>;
  bannerBusiness: Array<SliderInterface>;
  bannerEnterprise: Array<SliderInterface>;
  bannerInsurance: Array<SliderInterface>;
  bannerAdjudicated: Array<SliderInterface>;
  bannerProuser: Array<SliderInterface>;
}

// INTERFACE FOR DYNAMIC TARGET SLIDERS
export interface TargetSliderInterface {
  _id?: string;
  target: string;
  targetID?: string;
  sliders: Array<SliderInterface>;
  createdAt?: string;
  updatedAt?: string;
  status: "active" | "inactive";
}

export interface TargetSectionSlider {
  target: string;
  name: string;
}

export interface NewPictureSlider {
  img: string;
  filetype: string;
}

export interface SliderFeatureTextInterface {
  text: string;
  align: string;
  color: string;
  size: string;
  weight: string;
}

export interface SliderFeatureButtonInterface {
  enabled: boolean;
  text: string;
  align: string;
  color: string;
  weight: string;
  background: string;
  link: string;
}

export interface SliderInterface {
  id?: number
  picture: string;
  responsive: string;
  pictureImageDetail?: ImageDetailInterface | null;
  responsiveImageDetail?: ImageDetailInterface | null;
  title: SliderFeatureTextInterface;
  subtitle: SliderFeatureTextInterface;
  description: SliderFeatureTextInterface;
  button: SliderFeatureButtonInterface;
  disabled: boolean;
  target?: string;
  targetID?: string;

  // KEY: VALUE
  [key: string]: any;
}

export interface SliderOptions {
  show: boolean;
  sliders: Array<SliderInterface>;
  position: number;
}

export interface SlidersForTarget {
  bannerHome: Array<SliderInterface>;
  bannerPromotions: Array<SliderInterface>;
}

export interface TargetSectionSlider {
  target: string;
  name: string;
}

export interface NewPictureSlider {
  img: string;
  filetype: string;
}

export interface SliderFeatureTextInterface {
  text: string;
  align: string;
  color: string;
  size: string;
  weight: string;
}

export interface SliderFeatureButtonInterface {
  enabled: boolean;
  text: string;
  align: string;
  color: string;
  weight: string;
  background: string;
  link: string;
}
