// IMPORT INTERFACES
import type { CategoriesInterface } from "./categories.interface";
import type { CommonImageDetailInterface } from "./common.interface";
import type { SectionTypeInterface } from "./sections.interface";

export interface ProductInterface extends CommonImageDetailInterface {
    _id: string;
    name: string;
    slug: string;
    description: string;
    banner: string;
    responsive: string;
    thumbnail: string;
    category: CategoriesInterface
    sections: Array<SectionTypeInterface>
}