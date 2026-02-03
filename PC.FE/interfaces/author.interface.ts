import type { ImageDetailInterface } from "./detailed-image.interface";

export interface AuthorInterface {
  id?: string | number;
  name: string;
  position: string;
  image?: ImageDetailInterface | null;
  date: Date;
  headline: string;
  socials?: {
    x?: string;
    facebook?: string;
    linkedin?: string;
    instagram?: string;
  };
  biography?: string;
}
