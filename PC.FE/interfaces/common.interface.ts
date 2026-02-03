import type { ImageDetailInterface } from "./detailed-image.interface";

export interface CommonImageDetailInterface{
    bannerImageDetail?: ImageDetailInterface | null;
    responsiveImageDetail?: ImageDetailInterface | null;
    thumbnailImageDetail?: ImageDetailInterface | null;
}