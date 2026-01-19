import type { ImageDetailInterface } from "./detailed-image.interface";

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

export interface SliderInterface {
  id?: number;
  picture: string;
  pictureImageDetail: ImageDetailInterface;

  responsive: string;
  responsiveImageDetail: ImageDetailInterface;
  title: SliderFeatureTextInterface;
  subtitle: SliderFeatureTextInterface;
  description: SliderFeatureTextInterface;
  button: SliderFeatureButtonInterface;
  disabled: boolean;

  // KEY: VALUE
  [key: string]: any;
}
