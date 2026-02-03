import type {
  CategoriesInterface,
  PicturesCategoryType,
} from "~/interfaces/categories.interface";
import type { ImageDetailInterface } from "~/interfaces/detailed-image.interface";

const mapToImageDetail = (
  imageDetail: ImageDetailInterface | null | undefined
) => {
  if (!imageDetail || (!imageDetail.image && !imageDetail.altText)) return null;
  return {
    ...(imageDetail._id && { _id: imageDetail._id }),
    image: imageDetail.image,
    altText: imageDetail.altText,
  };
};
const mapToPicturesDto = (pictures: PicturesCategoryType) => {
  if (!pictures) return null;
  return {
    responsive: pictures.responsive,
    banner: pictures.banner,
    thumbnail: pictures.thumbnail,
    responsiveImageDetail: mapToImageDetail(pictures.responsiveImageDetail),
    bannerImageDetail: mapToImageDetail(pictures.bannerImageDetail),
    thumbnailImageDetail: mapToImageDetail(pictures.thumbnailImageDetail),
  };
};
const mapToCategoryDto = (category: CategoriesInterface) => {
  return {
    description: category.description,
    disabled: category.disabled,
    excerpt: category.excerpt,
    name: category.name,
    parentID: category.parentID,
    parentTarget: category.parentTarget,
    pictures: mapToPicturesDto(category.pictures),
    status: category.status,
    slug: category.slug,
    tags: category.tags,
    ...(category.target ? { target: category.target, targetID: null } : {}),
    ...(category.targetID ? { targetID: category.targetID, target: null } : {}),
  };
};

export const mapToCreateCategoryDto = (category: CategoriesInterface) => {
  return { ...mapToCategoryDto(category) };
};

export const mapToUpdateCategoryDto = (category: CategoriesInterface) => {
  return {
    _id: category._id,
    ...mapToCategoryDto(category),
  };
};
