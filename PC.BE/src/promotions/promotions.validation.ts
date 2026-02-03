import { BadRequestException } from '@nestjs/common';

import {
  CreatePromotionDto,
  CreatePromotion,
} from './dto/create.promotion.dto';
import {
  UpdatePromotionDto,
  UpdatePromotion,
} from './dto/update.promotion.dto';
import { RemovePromotionsDto } from './dto/remove.promotion.dto';
import { SearchArgs, ParamsByDate } from './dto/args.promotions.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreatePromotionDto (compile-time checked). Update when DTO changes. */
const createDtoAllowedKeys = ['promotions'] as const satisfies ReadonlyArray<
  keyof CreatePromotionDto
>;

const createDtoAllowedKeysSet = new Set(createDtoAllowedKeys);

/** Keys allowed in CreatePromotion (compile-time checked). Update when DTO changes. */
const createPromotionAllowedKeys = [
  'name',
  'status',
  'percent',
  'devolution',
  'condition',
  'extract',
  'picture',
  'pictureImageDetail',
  'disabled',
  'date',
] as const satisfies ReadonlyArray<keyof CreatePromotion>;

const createPromotionAllowedKeysSet = new Set(createPromotionAllowedKeys);

/** Keys allowed by UpdatePromotionDto (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = ['promotions'] as const satisfies ReadonlyArray<
  keyof UpdatePromotionDto
>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdatePromotion (compile-time checked). Update when DTO changes. */
const updatePromotionAllowedKeys = [
  '_id',
  'status',
  'name',
  'percent',
  'devolution',
  'condition',
  'extract',
  'picture',
  'pictureImageDetail',
  'disabled',
  'date',
] as const satisfies ReadonlyArray<keyof UpdatePromotion>;

const updatePromotionAllowedKeysSet = new Set(updatePromotionAllowedKeys);

/** Keys allowed by RemovePromotionsDto (compile-time checked). Update when DTO changes. */
const removeDtoAllowedKeys = ['promotionsIDS'] as const satisfies ReadonlyArray<
  keyof RemovePromotionsDto
>;

const removeDtoAllowedKeysSet = new Set(removeDtoAllowedKeys);

/** Keys allowed by SearchArgs (compile-time checked). Update when DTO changes. */
const searchArgsAllowedKeys = ['month'] as const satisfies ReadonlyArray<
  keyof SearchArgs
>;

const searchArgsAllowedKeysSet = new Set(searchArgsAllowedKeys);

/** Keys allowed by ParamsByDate (compile-time checked). Update when DTO changes. */
const paramsByDateAllowedKeys = [
  'search',
  'start',
  'end',
] as const satisfies ReadonlyArray<keyof ParamsByDate>;

const paramsByDateAllowedKeysSet = new Set(paramsByDateAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

// ObjectId helpers shared by resolver/service.
export const validatePromotionId = createObjectIdValidator('promotionID');

/** Validate and normalize create payload. */
export const normalizeCreatePromotionsDto = (
  dto: CreatePromotionDto,
): CreatePromotionDto => {
  validateAllowedKeys(
    dto as CreatePromotionDto,
    createDtoAllowedKeysSet,
    'create',
  );
  validateRequiredArray(dto.promotions, 'promotions');
  dto.promotions.forEach((promotion, index) => {
    validateAllowedKeys(
      promotion as any,
      createPromotionAllowedKeysSet,
      `promotions[${index}]`,
    );
    validateEnumValue(
      promotion.status,
      `promotions[${index}].status`,
      statusAllowedValues,
    );
    if (promotion.picture === null) {
      throw new BadRequestException(
        `promotions[${index}].picture cannot be null`,
      );
    }
  });
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdatePromotionsDto = (
  dto: UpdatePromotionDto,
): UpdatePromotionDto => {
  validateAllowedKeys(
    dto as UpdatePromotionDto,
    updateDtoAllowedKeysSet,
    'update',
  );
  validateRequiredArray(dto.promotions, 'promotions');
  dto.promotions.forEach((promotion, index) => {
    validateAllowedKeys(
      promotion as any,
      updatePromotionAllowedKeysSet,
      `promotions[${index}]`,
    );
    validateEnumValue(
      promotion.status,
      `promotions[${index}].status`,
      statusAllowedValues,
    );
  });
  return dto;
};

/** Validate remove payload. */
export const validateRemovePromotionsDto = (
  dto: RemovePromotionsDto,
): RemovePromotionsDto => {
  validateAllowedKeys(
    dto as RemovePromotionsDto,
    removeDtoAllowedKeysSet,
    'remove',
  );
  validateRequiredArray(dto.promotionsIDS, 'promotionsIDS');
  return dto;
};

/** Validate search args. */
export const validateSearchArgs = (args?: SearchArgs): void => {
  if (!args) {
    throw new BadRequestException('SearchArgs is required');
  }
  validateAllowedKeys(args as SearchArgs, searchArgsAllowedKeysSet, 'query');
};

/** Validate date params. */
export const validateParamsByDate = (params?: ParamsByDate): void => {
  if (!params) {
    throw new BadRequestException('ParamsByDate is required');
  }
  validateAllowedKeys(
    params as ParamsByDate,
    paramsByDateAllowedKeysSet,
    'query',
  );
};
