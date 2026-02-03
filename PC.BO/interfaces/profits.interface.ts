// IMPORT INTERFACES
import type { CategoriesInterface } from "./categories.interface";
import type { ImageDetailInterface } from "./detailed-image.interface";

export interface DialogCreateProfitInterface {
    show: boolean;
    position: number;
    profit: ProfitInterface;
}

export interface DescriptionLargeInterface {
    text: string;
    enabled: boolean;
}

export interface NewPictureProfit {
    img: string;
    filetype: string;
}

export interface ProfitDateRangeInterface {
    start: Date;
    end: Date;
}

export interface ProfitGroupByCategoryInterface {
    profits: Array<ProfitInterface>;
    category: CategoriesInterface;
}

export interface ProfitInterface {
    _id?: string;
    name: string;
    percent: string;
    devolution: string;
    description: DescriptionLargeInterface;
    condition: string;
    category: string;
    color: string;
    disabled: boolean;
    newPictureProfit?: Array<NewPictureProfit>;
    picture: any;
    pictureImageDetail?: ImageDetailInterface | null;
    date: ProfitDateRangeInterface;
}