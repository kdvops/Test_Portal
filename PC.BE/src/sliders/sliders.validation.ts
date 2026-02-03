import { BadRequestException } from '@nestjs/common';

import { CreateSliderDto } from './dto/create.slider.dto';
import { UpdatePositionsSliderDto } from './dto/update-positions.slider.dto';
import { UpdateSlider } from './dto/update.slider.dto';
import { SeoFieldsInput } from 'src/common/types/common.type';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';
import { TargetSliders } from 'src/common/enums/target.enum';

/** SEO fields reused across slider DTOs. */
const seoFieldKeys = [
  'altTextBanner',
  'altTextThumbnail',
  'altTextResponsive',
  'metaTitle',
  'metaDescription',
  'keywords',
  'canonicalUrl',
  'tags',
  'ogImage',
  'twitterImage',
  'socialTitle',
  'socialDescription',
  'altText',
  'readingTime',
  'robotsDirectives',
  'language',
  'structuredType',
  'focusKeyword',
  'relatedPosts',
  'isFeatured',
  'schemaMarkup',
] as const satisfies ReadonlyArray<keyof SeoFieldsInput>;

/** Keys allowed by CreateSliderDto (update when DTO changes). */
const createAllowedKeys = [
  'title',
  'subtitle',
  'description',
  'button',
  'targetID',
  'target',
  'picture',
  'responsive',
  'pictureImageDetail',
  'responsiveImageDetail',
  'disabled',
  'altTextPicture',
  'caption',
  'order',
  'expirationDate',
  ...seoFieldKeys,
] as const satisfies ReadonlyArray<keyof CreateSliderDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed by UpdateSlider (update when DTO changes). */
const updateAllowedKeys = [
  '_id',
  'title',
  'subtitle',
  'description',
  'button',
  'targetID',
  'target',
  'picture',
  'responsive',
  'pictureImageDetail',
  'responsiveImageDetail',
  'disabled',
  'expirationDate',
  'altTextPicture',
  'caption',
  'order',
  ...seoFieldKeys,
] as const satisfies ReadonlyArray<keyof UpdateSlider>;

const updateAllowedKeysSet = new Set(updateAllowedKeys);

/** Keys allowed by UpdatePositionsSliderDto (update when DTO changes). */
const updatePositionsAllowedKeys = [
  'sliders',
] as const satisfies ReadonlyArray<keyof UpdatePositionsSliderDto>;

const updatePositionsAllowedKeysSet = new Set(updatePositionsAllowedKeys);

const targetAllowedValues = new Set(Object.values(TargetSliders));

export const normalizeSliderId = createObjectIdNormalizer('sliderID');
export const validateSliderId = createObjectIdValidator('sliderID');

/** Validate and normalize create payload. */
export const normalizeCreateSliderDto = (
  dto: CreateSliderDto,
): CreateSliderDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.target as any, 'target', targetAllowedValues);
  return dto;
};

/** Validate and normalize update payload. */
export const normalizeUpdateSliderDto = (dto: UpdateSlider): UpdateSlider => {
  validateAllowedKeys(dto as any, updateAllowedKeysSet, 'update');
  validateEnumValue(dto.target as any, 'target', targetAllowedValues);
  return {
    ...dto,
    _id: normalizeSliderId(dto._id as any),
  };
};

/** Validate and normalize update positions payload. */
export const validateUpdatePositionsDto = (
  dto: UpdatePositionsSliderDto,
): UpdatePositionsSliderDto => {
  validateAllowedKeys(dto as any, updatePositionsAllowedKeysSet, 'update');
  validateRequiredArray(dto?.sliders, 'sliders');
  return dto;
};

/** Validate target arg for query use. */
export const validateSliderTarget = (target?: string): void => {
  if (typeof target !== 'string' || target.trim() === '') {
    throw new BadRequestException('target is required');
  }
  validateEnumValue(target, 'target', targetAllowedValues);
};
