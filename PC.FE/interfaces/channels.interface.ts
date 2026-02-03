import type { CommonImageDetailInterface } from "./common.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface ChannelsInterface extends CommonImageDetailInterface {
  _id?: string;
  title: string;
  slug: string;
  link: string;
  excerpt: string;
  subtitle: string;
  description: string;
  sections: Array<SectionTypeInterface>;
  banner: string;
  responsive: string;
  thumbnail: string;
  disabled: boolean;
}
