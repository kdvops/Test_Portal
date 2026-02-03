// IMPORT INTERFACES
import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface ProductInterface {
    _id: string;
    status?: 'draft' | 'publish' | 'trash';
    name: string;
    description: string;
    banner?: string;
    bannerImageDetail?: ImageDetailInterface | null;
    category: CategoriesInterface
    sections: Array<SectionTypeInterface>
      // KEY: VALUE
  [key: string]: any;
}