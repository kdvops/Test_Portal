import { BadRequestException } from '@nestjs/common';

import { CreateSeoPageDto, CreateSeoPagesDto } from './dto/create.seoPage.dto';
import { UpdateSeoPageDto } from './dto/update.seoPage.dto';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateRequiredArray,
} from 'src/common/utils/validation';

/** Keys allowed by CreateSeoPageDto (update when DTO changes). */
const createAllowedKeys = [
  'path',
  'meta',
] as const satisfies ReadonlyArray<keyof CreateSeoPageDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed by CreateSeoPagesDto (update when DTO changes). */
const createPagesAllowedKeys = [
  'pages',
] as const satisfies ReadonlyArray<keyof CreateSeoPagesDto>;

const createPagesAllowedKeysSet = new Set(createPagesAllowedKeys);

/** Keys allowed by UpdateSeoPageDto (update when DTO changes). */
const updateAllowedKeys = [
  '_id',
  'path',
  'meta',
] as const satisfies ReadonlyArray<keyof UpdateSeoPageDto>;

const updateAllowedKeysSet = new Set(updateAllowedKeys);

export const normalizeSeoPageId = createObjectIdNormalizer('seoPageID');
export const validateSeoPageId = createObjectIdValidator('seoPageID');

/** Validate and normalize create payload. */
export const normalizeCreateSeoPageDto = (
  dto: CreateSeoPageDto,
): CreateSeoPageDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  return dto;
};

/** Validate and normalize create pages payload. */
export const normalizeCreateSeoPagesDto = (
  dto: CreateSeoPagesDto,
): CreateSeoPagesDto => {
  validateAllowedKeys(dto as any, createPagesAllowedKeysSet, 'create');
  validateRequiredArray(dto?.pages, 'pages');
  dto.pages.forEach((page) => {
    validateAllowedKeys(page as any, createAllowedKeysSet, 'create.pages');
  });
  return dto;
};

/** Validate and normalize update payload. */
export const normalizeUpdateSeoPageDto = (
  dto: UpdateSeoPageDto,
): UpdateSeoPageDto => {
  validateAllowedKeys(dto as any, updateAllowedKeysSet, 'update');
  return {
    ...dto,
    _id: normalizeSeoPageId(dto._id as any),
  };
};

/** Validate query string arguments. */
export const validateSeoPagePath = (path?: string): void => {
  if (typeof path !== 'string' || path.trim() === '') {
    throw new BadRequestException('Path is required');
  }
};
