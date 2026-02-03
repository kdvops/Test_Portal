import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface NewPictureChannel {
  img?: string;
  filetype?: string;
}

export interface ChannelInterface {
  _id?: string;
  status?: 'draft' | 'publish' | 'trash';
  title: string;
  slug: string;
  link: string;
  excerpt: string;
  subtitle: string;
  description: string;
  sections: Array<SectionTypeInterface>;
  banner?: string;
  responsive?: string;
  thumbnail?: string;
  bannerImageDetail?: ImageDetailInterface | null;
  responsiveImageDetail?: ImageDetailInterface | null;
  thumbnailImageDetail?: ImageDetailInterface | null;
  disabled: boolean;
}
