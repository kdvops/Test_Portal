import { BadRequestException } from '@nestjs/common';

import { CreateInsuranceDto } from './dto/create.insurance.dto';
import { UpdateInsuranceDto } from './dto/update.insurance.dto';
import { ArgsInsurance } from './dto/args.insurance.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateInsuranceDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
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
  'status',
  'disabled',
  'sections',
] as const satisfies ReadonlyArray<keyof CreateInsuranceDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateInsuranceDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'insuranceID',
  'insurance',
  'newUploadBanner',
  'newUploadThumbnail',
  'newUploadResponsive',
] as const satisfies ReadonlyArray<keyof UpdateInsuranceDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateInsuranceDto.insurance (compile-time checked). Update when DTO changes. */
const updateInsuranceAllowedKeys = [
  'title',
  'excerpt',
  'subtitle',
  'slug',
  'link',
  'description',
  'category',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'status',
  'disabled',
  'sections',
] as const satisfies ReadonlyArray<keyof UpdateInsuranceDto['insurance']>;

const updateInsuranceAllowedKeysSet = new Set(updateInsuranceAllowedKeys);

/** Keys allowed in ArgsInsurance (compile-time checked). Update when DTO changes. */
const argsInsuranceAllowedKeys = [
  'category',
  'search',
] as const satisfies ReadonlyArray<keyof ArgsInsurance>;

const argsInsuranceAllowedKeysSet = new Set(argsInsuranceAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

/** Sections must be an array to keep service assumptions safe. */
const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
};

// ObjectId helpers shared by resolver/service.
export const normalizeInsuranceId = createObjectIdNormalizer('insuranceID');
export const validateInsuranceId = createObjectIdValidator('insuranceID');

/** Validate and normalize create payload. */
export const normalizeCreateInsuranceDto = (
  dto: CreateInsuranceDto,
): CreateInsuranceDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  validateSections(dto.sections, 'sections');
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateInsuranceDto = (
  dto: UpdateInsuranceDto,
): UpdateInsuranceDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.insurance as any,
    updateInsuranceAllowedKeysSet,
    'update.insurance',
  );
  validateEnumValue(
    dto?.insurance?.status,
    'insurance.status',
    statusAllowedValues,
  );
  validateSections(dto?.insurance?.sections as any, 'insurance.sections');
  return {
    ...dto,
    insuranceID: normalizeInsuranceId(dto.insuranceID as any),
  };
};

/** Validate list/query args. */
export const validateArgsInsurance = (args?: ArgsInsurance): void => {
  if (!args) {
    throw new BadRequestException('ArgsInsurance is required');
  }
  validateAllowedKeys(args as any, argsInsuranceAllowedKeysSet, 'query');
};
