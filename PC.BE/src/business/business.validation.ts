import { BadRequestException } from '@nestjs/common';

import { CreateBusinessDto } from './dto/create.business.dto';
import { UpdateBusinessDto } from './dto/update.business.dto';
import { ArgsBusiness } from './dto/args.business.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateBusinessDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'status',
  'subtitle',
  'slug',
  'link',
  'excerpt',
  'description',
  'category',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'disabled',
  'sections',
] as const satisfies ReadonlyArray<keyof CreateBusinessDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateBusinessDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'businessID',
  'business',
  'newUploadBanner',
  'newUploadThumbnail',
  'newUploadResponsive',
] as const satisfies ReadonlyArray<keyof UpdateBusinessDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateBusinessDto.business (compile-time checked). Update when DTO changes. */
const updateBusinessAllowedKeys = [
  'title',
  'status',
  'slug',
  'excerpt',
  'link',
  'subtitle',
  'description',
  'category',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'disabled',
  'sections',
] as const satisfies ReadonlyArray<keyof UpdateBusinessDto['business']>;

const updateBusinessAllowedKeysSet = new Set(updateBusinessAllowedKeys);

/** Keys allowed in ArgsBusiness (compile-time checked). Update when DTO changes. */
const argsBusinessAllowedKeys = [
  'category',
  'search',
] as const satisfies ReadonlyArray<keyof ArgsBusiness>;

const argsBusinessAllowedKeysSet = new Set(argsBusinessAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

/** Sections must be an array to keep service assumptions safe. */
const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
};

// ObjectId helpers shared by resolver/service.
export const normalizeBusinessId = createObjectIdNormalizer('businessID');
export const validateBusinessId = createObjectIdValidator('businessID');

/** Validate and normalize create payload. */
export const normalizeCreateBusinessDto = (
  dto: CreateBusinessDto,
): CreateBusinessDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  validateSections(dto.sections, 'sections');
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateBusinessDto = (
  dto: UpdateBusinessDto,
): UpdateBusinessDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.business as any,
    updateBusinessAllowedKeysSet,
    'update.business',
  );
  validateEnumValue(
    dto?.business?.status,
    'business.status',
    statusAllowedValues,
  );
  validateSections(dto?.business?.sections as any, 'business.sections');
  return {
    ...dto,
    businessID: normalizeBusinessId(dto.businessID as any),
  };
};

/** Validate list/query args. */
export const validateArgsBusiness = (args?: ArgsBusiness): void => {
  if (!args) {
    throw new BadRequestException('ArgsBusiness is required');
  }
  validateAllowedKeys(args as any, argsBusinessAllowedKeysSet, 'query');
};
