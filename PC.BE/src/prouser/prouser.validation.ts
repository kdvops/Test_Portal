import { BadRequestException } from '@nestjs/common';

import { CreateProuserDto } from './dto/create.prouser.dto';
import { UpdateProuserDto } from './dto/update.prouser.dto';
import { ArgsProuser } from './dto/args.prouser.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateProuserDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'subtitle',
  'link',
  'slug',
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
] as const satisfies ReadonlyArray<keyof CreateProuserDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateProuserDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'prouserID',
  'prouser',
  'newUploadBanner',
  'newUploadThumbnail',
  'newUploadResponsive',
] as const satisfies ReadonlyArray<keyof UpdateProuserDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateProuserDto.prouser (compile-time checked). Update when DTO changes. */
const updateProuserAllowedKeys = [
  'title',
  'excerpt',
  'slug',
  'subtitle',
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
] as const satisfies ReadonlyArray<keyof UpdateProuserDto['prouser']>;

const updateProuserAllowedKeysSet = new Set(updateProuserAllowedKeys);

/** Keys allowed in ArgsProuser (compile-time checked). Update when DTO changes. */
const argsProuserAllowedKeys = [
  'category',
  'search',
] as const satisfies ReadonlyArray<keyof ArgsProuser>;

const argsProuserAllowedKeysSet = new Set(argsProuserAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

/** Sections must be an array to keep service assumptions safe. */
const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
};

// ObjectId helpers shared by resolver/service.
export const normalizeProuserId = createObjectIdNormalizer('prouserID');
export const validateProuserId = createObjectIdValidator('prouserID');

/** Validate and normalize create payload. */
export const normalizeCreateProuserDto = (
  dto: CreateProuserDto,
): CreateProuserDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  if (dto.sections === null) {
    throw new BadRequestException('sections cannot be null');
  }
  const normalized = {
    ...dto,
    sections: dto.sections ?? [],
  };
  validateSections(normalized.sections, 'sections');
  return normalized;
};

/** Validate and normalize update payload. */
export const validateUpdateProuserDto = (
  dto: UpdateProuserDto,
): UpdateProuserDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.prouser as any,
    updateProuserAllowedKeysSet,
    'update.prouser',
  );
  validateEnumValue(
    dto?.prouser?.status,
    'prouser.status',
    statusAllowedValues,
  );
  if (dto?.prouser?.sections === null) {
    throw new BadRequestException('prouser.sections cannot be null');
  }
  const normalized = {
    ...dto,
    prouserID: normalizeProuserId(dto.prouserID as any),
    prouser: {
      ...dto.prouser,
      sections: dto.prouser?.sections ?? [],
    },
  };
  validateSections(normalized.prouser.sections, 'prouser.sections');
  return normalized;
};

/** Validate list/query args. */
export const validateArgsProuser = (args?: ArgsProuser): void => {
  if (!args) {
    throw new BadRequestException('ArgsProuser is required');
  }
  validateAllowedKeys(args as any, argsProuserAllowedKeysSet, 'query');
};
