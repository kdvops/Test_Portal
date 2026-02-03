import { BadRequestException } from '@nestjs/common';

import { CreateAdjudicatedDto } from './dto/create.adjudicated.dto';
import { UpdateAdjudicatedDto } from './dto/update.adjudicated.dto';
import { ArgsAdjudicated } from './dto/args.adjudicated.dto';
import { TypeStatusAdjudicated } from 'src/common/enums/adjudicated.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateAdjudicatedDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'category',
  'item_status',
  'status',
  'name',
  'link',
  'excerpt',
  'description',
  'pictures',
  'picturesImageDetail',
  'price',
  'address',
  'province',
  'phone',
  'disabled',
] as const satisfies ReadonlyArray<keyof CreateAdjudicatedDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateAdjudicatedDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'adjudicatedID',
  'adjudicated',
] as const satisfies ReadonlyArray<keyof UpdateAdjudicatedDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateAdjudicatedDto.adjudicated (compile-time checked). Update when DTO changes. */
const updateAdjudicatedAllowedKeys = [
  'category',
  'item_status',
  'status',
  'name',
  'link',
  'excerpt',
  'description',
  'pictures',
  'picturesImageDetail',
  'price',
  'address',
  'province',
  'phone',
  'disabled',
] as const satisfies ReadonlyArray<keyof UpdateAdjudicatedDto['adjudicated']>;

const updateAdjudicatedAllowedKeysSet = new Set(updateAdjudicatedAllowedKeys);

/** Keys allowed in ArgsAdjudicated (compile-time checked). Update when DTO changes. */
const argsAdjudicatedAllowedKeys = [
  'search',
  'category',
  'province',
  'priceMin',
  'priceMax',
] as const satisfies ReadonlyArray<keyof ArgsAdjudicated>;

const argsAdjudicatedAllowedKeysSet = new Set(argsAdjudicatedAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(TypeStatusAdjudicated));
const itemStatusAllowedValues = new Set(Object.values(StatusItem));

// ObjectId helpers shared by resolver/service.
export const validateAdjudicatedId = createObjectIdValidator('adjudicatedID');

/** Validate and normalize create payload. */
export const normalizeCreateAdjudicatedDto = (
  dto: CreateAdjudicatedDto,
): CreateAdjudicatedDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  validateEnumValue(dto.item_status, 'item_status', itemStatusAllowedValues);
  validateRequiredArray(dto.pictures, 'pictures');
  validateRequiredArray(dto.picturesImageDetail, 'picturesImageDetail');
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateAdjudicatedDto = (
  dto: UpdateAdjudicatedDto,
): UpdateAdjudicatedDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.adjudicated as any,
    updateAdjudicatedAllowedKeysSet,
    'update.adjudicated',
  );
  validateEnumValue(
    dto?.adjudicated?.status,
    'adjudicated.status',
    statusAllowedValues,
  );
  validateEnumValue(
    dto?.adjudicated?.item_status,
    'adjudicated.item_status',
    itemStatusAllowedValues,
  );
  validateRequiredArray(dto?.adjudicated?.pictures, 'adjudicated.pictures');
  validateRequiredArray(
    dto?.adjudicated?.picturesImageDetail,
    'adjudicated.picturesImageDetail',
  );

  return dto;
};

/** Validate list/query args. */
export const validateArgsAdjudicated = (args?: ArgsAdjudicated): void => {
  if (!args) {
    throw new BadRequestException('ArgsAdjudicated is required');
  }
  validateAllowedKeys(args as any, argsAdjudicatedAllowedKeysSet, 'query');
};
