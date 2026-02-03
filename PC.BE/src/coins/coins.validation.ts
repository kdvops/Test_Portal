import { BadRequestException } from '@nestjs/common';

import { CreateCoinDto } from './dto/create.coin.dto';
import { UpdateCoinDto } from './dto/update.coin.dto';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateCoinDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'name',
  'price',
  'prefix',
  'logo',
  'logoImageDetail',
] as const satisfies ReadonlyArray<keyof CreateCoinDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateCoinDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'coinID',
  'coin',
  'newUploadLogo',
] as const satisfies ReadonlyArray<keyof UpdateCoinDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateCoinDto.coin (compile-time checked). Update when DTO changes. */
const updateCoinAllowedKeys = [
  'name',
  'price',
  'prefix',
  'logo',
  'logoImageDetail',
] as const satisfies ReadonlyArray<keyof UpdateCoinDto['coin']>;

const updateCoinAllowedKeysSet = new Set(updateCoinAllowedKeys);

/** Price must be a shape compatible with PriceCoinsInput. */
const validatePrice = (price: any, label: string): void => {
  if (!price || typeof price !== 'object') {
    throw new BadRequestException(`${label} must include buy and sell values`);
  }
  if (typeof price.buy !== 'string' || typeof price.sell !== 'string') {
    throw new BadRequestException(`${label} must include buy and sell strings`);
  }
};

// ObjectId helpers shared by resolver/service.
export const normalizeCoinId = createObjectIdNormalizer('coinID');
export const validateCoinId = createObjectIdValidator('coinID');

/** Validate and normalize create payload. */
export const normalizeCreateCoinDto = (dto: CreateCoinDto): CreateCoinDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validatePrice(dto.price, 'price');
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateCoinDto = (dto: UpdateCoinDto): UpdateCoinDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.coin as any,
    updateCoinAllowedKeysSet,
    'update.coin',
  );
  validatePrice(dto?.coin?.price, 'coin.price');
  return {
    ...dto,
    coinID: normalizeCoinId(dto.coinID as any),
  };
};
