import { BadRequestException } from '@nestjs/common';

import { CreateRegulatoryDto } from './dto/create.regulatory.dto';
import { UpdateRegulatoryDto } from './dto/update.regulatory.dto';
import { ArgsRegulatory } from './dto/args.regulatory.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

/** Keys allowed by CreateRegulatoryDto (update when DTO changes). */
const createAllowedKeys = [
  'title',
  'slug',
  'subtitle',
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
] as const satisfies ReadonlyArray<keyof CreateRegulatoryDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateRegulatoryDto root (update when DTO changes). */
const updateDtoAllowedKeys = [
  'regulatoryID',
  'regulatory',
  'newUploadBanner',
  'newUploadThumbnail',
  'newUploadResponsive',
] as const satisfies ReadonlyArray<keyof UpdateRegulatoryDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateRegulatoryDto.regulatory (update when DTO changes). */
const updateRegulatoryAllowedKeys = [
  'title',
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
  'status',
  'disabled',
  'sections',
] as const satisfies ReadonlyArray<keyof UpdateRegulatoryDto['regulatory']>;

const updateRegulatoryAllowedKeysSet = new Set(updateRegulatoryAllowedKeys);

/** Keys allowed in ArgsRegulatory (update when DTO changes). */
const argsAllowedKeys = [
  'category',
  'search',
] as const satisfies ReadonlyArray<keyof ArgsRegulatory>;

const argsAllowedKeysSet = new Set(argsAllowedKeys);

const statusAllowedValues = new Set(Object.values(StatusItem));

const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
};

export const normalizeRegulatoryId =
  createObjectIdNormalizer('regulatoryID');
export const validateRegulatoryId = createObjectIdValidator('regulatoryID');

/** Validate and normalize create payload. */
export const normalizeCreateRegulatoryDto = (
  dto: CreateRegulatoryDto,
): CreateRegulatoryDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  if (dto.sections === null) {
    throw new BadRequestException('sections cannot be null');
  }
  const normalized = {
    ...dto,
    sections: dto.sections ?? [],
    banner: dto.banner ?? [],
    thumbnail: dto.thumbnail ?? [],
    responsive: dto.responsive ?? [],
  };
  validateSections(normalized.sections, 'sections');
  return normalized;
};

/** Validate and normalize update payload. */
export const validateUpdateRegulatoryDto = (
  dto: UpdateRegulatoryDto,
): UpdateRegulatoryDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.regulatory as any,
    updateRegulatoryAllowedKeysSet,
    'update.regulatory',
  );
  validateEnumValue(dto?.regulatory?.status, 'regulatory.status', statusAllowedValues);
  if (dto?.regulatory?.sections === null) {
    throw new BadRequestException('regulatory.sections cannot be null');
  }
  const normalized = {
    ...dto,
    regulatoryID: normalizeRegulatoryId(dto.regulatoryID as any),
    regulatory: {
      ...dto.regulatory,
      sections: dto.regulatory?.sections ?? [],
    },
  };
  validateSections(normalized.regulatory.sections, 'regulatory.sections');
  return normalized;
};

/** Validate list/query args. */
export const validateArgsRegulatory = (args?: ArgsRegulatory): void => {
  if (!args) {
    throw new BadRequestException('ArgsRegulatory is required');
  }
  validateAllowedKeys(args as any, argsAllowedKeysSet, 'query');
};
