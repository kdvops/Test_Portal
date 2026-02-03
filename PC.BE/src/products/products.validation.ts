import { BadRequestException } from '@nestjs/common';

import { CreateProductDto } from './dto/create.product.dto';
import { UpdateProductDto } from './dto/update.product.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateProductDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'status',
  'name',
  'description',
  'slug',
  'category',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'link',
  'disabled',
  'sections',
] as const satisfies ReadonlyArray<keyof CreateProductDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateProductDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'productID',
  'product',
] as const satisfies ReadonlyArray<keyof UpdateProductDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateProductDto.product (compile-time checked). Update when DTO changes. */
const updateProductAllowedKeys = [
  'status',
  'name',
  'description',
  'slug',
  'category',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'link',
  'disabled',
  'sections',
] as const satisfies ReadonlyArray<keyof UpdateProductDto['product']>;

const updateProductAllowedKeysSet = new Set(updateProductAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

/** Sections must be an array to keep service assumptions safe. */
const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
};

// ObjectId helpers shared by resolver/service.
export const normalizeProductId = createObjectIdNormalizer('productID');
export const validateProductId = createObjectIdValidator('productID');

/** Validate and normalize create payload. */
export const normalizeCreateProductDto = (
  dto: CreateProductDto,
): CreateProductDto => {
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
export const validateUpdateProductDto = (
  dto: UpdateProductDto,
): UpdateProductDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.product as any,
    updateProductAllowedKeysSet,
    'update.product',
  );
  validateEnumValue(
    dto?.product?.status,
    'product.status',
    statusAllowedValues,
  );
  if (dto?.product?.sections === null) {
    throw new BadRequestException('product.sections cannot be null');
  }
  const normalized = {
    ...dto,
    productID: normalizeProductId(dto.productID as any),
    product: {
      ...dto.product,
      sections: dto.product?.sections ?? [],
    },
  };
  validateSections(normalized.product.sections, 'product.sections');
  return normalized;
};
