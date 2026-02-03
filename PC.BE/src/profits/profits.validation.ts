import { BadRequestException } from '@nestjs/common';

import { CreateProfitDto, CreateProfit } from './dto/create.profit.dto';
import { UpdateProfitsDto, UpdateProfit } from './dto/update.profit.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateProfitDto (compile-time checked). Update when DTO changes. */
const createDtoAllowedKeys = ['profits'] as const satisfies ReadonlyArray<
  keyof CreateProfitDto
>;

const createDtoAllowedKeysSet = new Set(createDtoAllowedKeys);

/** Keys allowed in CreateProfit (compile-time checked). Update when DTO changes. */
const createProfitAllowedKeys = [
  'name',
  'status',
  'percent',
  'color',
  'category',
  'description',
  'devolution',
  'condition',
  'picture',
  'pictureImageDetail',
  'disabled',
  'date',
] as const satisfies ReadonlyArray<keyof CreateProfit>;

const createProfitAllowedKeysSet = new Set(createProfitAllowedKeys);

/** Keys allowed by UpdateProfitsDto (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = ['profits'] as const satisfies ReadonlyArray<
  keyof UpdateProfitsDto
>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateProfit (compile-time checked). Update when DTO changes. */
const updateProfitAllowedKeys = [
  '_id',
  'status',
  'name',
  'percent',
  'color',
  'category',
  'description',
  'devolution',
  'condition',
  'picture',
  'pictureImageDetail',
  'newPictureProfit',
  'disabled',
  'date',
] as const satisfies ReadonlyArray<keyof UpdateProfit>;

const updateProfitAllowedKeysSet = new Set(updateProfitAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

// ObjectId helpers shared by resolver/service.
export const validateProfitId = createObjectIdValidator('profitID');

/** newPictureProfit must be an array when provided. */
const validateNewPicture = (value: any, label: string): void => {
  if (value === undefined || value === null) return;
  validateRequiredArray(value, label);
};

/** Validate and normalize create payload. */
export const normalizeCreateProfitsDto = (
  dto: CreateProfitDto,
): CreateProfitDto => {
  validateAllowedKeys(dto as any, createDtoAllowedKeysSet, 'create');
  validateRequiredArray(dto.profits, 'profits');
  dto.profits.forEach((profit, index) => {
    validateAllowedKeys(
      profit as any,
      createProfitAllowedKeysSet,
      `profits[${index}]`,
    );
    validateEnumValue(
      profit.status,
      `profits[${index}].status`,
      statusAllowedValues,
    );
    if (profit.picture === null) {
      throw new BadRequestException(`profits[${index}].picture cannot be null`);
    }
  });
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateProfitsDto = (
  dto: UpdateProfitsDto,
): UpdateProfitsDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateRequiredArray(dto.profits, 'profits');
  dto.profits.forEach((profit, index) => {
    validateAllowedKeys(
      profit as any,
      updateProfitAllowedKeysSet,
      `profits[${index}]`,
    );
    validateEnumValue(
      profit.status,
      `profits[${index}].status`,
      statusAllowedValues,
    );
    validateNewPicture(
      profit.newPictureProfit,
      `profits[${index}].newPictureProfit`,
    );
  });
  return dto;
};
