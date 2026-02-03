import { BadRequestException } from '@nestjs/common';

import { CreateEnterpriseDto } from './dto/create.enterprise.dto';
import { UpdateEnterpriseDto } from './dto/update.enterprise.dto';
import { ArgsEnterprise } from './dto/args.enterprise.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateEnterpriseDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'status',
  'subtitle',
  'slug',
  'excerpt',
  'link',
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
] as const satisfies ReadonlyArray<keyof CreateEnterpriseDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateEnterpriseDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'enterpriseID',
  'enterprise',
  'newUploadBanner',
  'newUploadThumbnail',
  'newUploadResponsive',
] as const satisfies ReadonlyArray<keyof UpdateEnterpriseDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateEnterpriseDto.enterprise (compile-time checked). Update when DTO changes. */
const updateEnterpriseAllowedKeys = [
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
] as const satisfies ReadonlyArray<keyof UpdateEnterpriseDto['enterprise']>;

const updateEnterpriseAllowedKeysSet = new Set(updateEnterpriseAllowedKeys);

/** Keys allowed in ArgsEnterprise (compile-time checked). Update when DTO changes. */
const argsEnterpriseAllowedKeys = [
  'category',
  'search',
] as const satisfies ReadonlyArray<keyof ArgsEnterprise>;

const argsEnterpriseAllowedKeysSet = new Set(argsEnterpriseAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

/** Sections must be an array to keep service assumptions safe. */
const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
};

// ObjectId helpers shared by resolver/service.
export const normalizeEnterpriseId = createObjectIdNormalizer('enterpriseID');
export const validateEnterpriseId = createObjectIdValidator('enterpriseID');

/** Validate and normalize create payload. */
export const normalizeCreateEnterpriseDto = (
  dto: CreateEnterpriseDto,
): CreateEnterpriseDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  validateSections(dto.sections, 'sections');
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateEnterpriseDto = (
  dto: UpdateEnterpriseDto,
): UpdateEnterpriseDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.enterprise as any,
    updateEnterpriseAllowedKeysSet,
    'update.enterprise',
  );
  validateEnumValue(
    dto?.enterprise?.status,
    'enterprise.status',
    statusAllowedValues,
  );
  validateSections(dto?.enterprise?.sections as any, 'enterprise.sections');
  return {
    ...dto,
    enterpriseID: normalizeEnterpriseId(dto.enterpriseID as any),
  };
};

/** Validate list/query args. */
export const validateArgsEnterprise = (args?: ArgsEnterprise): void => {
  if (!args) {
    throw new BadRequestException('ArgsEnterprise is required');
  }
  validateAllowedKeys(args as any, argsEnterpriseAllowedKeysSet, 'query');
};
