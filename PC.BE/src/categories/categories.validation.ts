import { BadRequestException } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create.category.dto';
import { UpdateCategoryDto } from './dto/update.category.dto';
import { ParentAndTargetDto } from './dto/args.category.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import { SeoFieldsInput } from 'src/common/types/common.type';
import {
  TargetCategories,
  TargetParentCategories,
} from 'src/common/enums/target.enum';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** SEO fields reused across category DTOs. */
const seoFieldKeys = [
  'altTextBanner',
  'altTextThumbnail',
  'altTextResponsive',
  'metaTitle',
  'metaDescription',
  'keywords',
  'canonicalUrl',
  'tags',
  'ogImage',
  'twitterImage',
  'socialTitle',
  'socialDescription',
  'altText',
  'readingTime',
  'robotsDirectives',
  'language',
  'structuredType',
  'focusKeyword',
  'relatedPosts',
  'isFeatured',
  'schemaMarkup',
] as const satisfies ReadonlyArray<keyof SeoFieldsInput>;

/** Keys allowed by CreateCategoryDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'status',
  'name',
  'excerpt',
  'description',
  'slug',
  'parentID',
  'parentTarget',
  'target',
  'targetID',
  'tags',
  'pictures',
  'disabled',
  'relatedCategories',
  'relatedTargets',
  'slugHistory',
  ...seoFieldKeys,
 ] as const satisfies ReadonlyArray<keyof CreateCategoryDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed by UpdateCategoryDto (compile-time checked). Update when DTO changes. */
const updateAllowedKeys = [
  '_id',
  'status',
  'name',
  'excerpt',
  'description',
  'slug',
  'tags',
  'target',
  'targetID',
  'parentID',
  'parentTarget',
  'pictures',
  'disabled',
 ] as const satisfies ReadonlyArray<keyof UpdateCategoryDto>;

const updateAllowedKeysSet = new Set(updateAllowedKeys);

/** Keys allowed by ParentAndTargetDto (compile-time checked). Update when DTO changes. */
const parentAndTargetAllowedKeys = [
  'parentTarget',
  'target',
] as const satisfies ReadonlyArray<keyof ParentAndTargetDto>;

const parentAndTargetAllowedKeysSet = new Set(parentAndTargetAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));
const targetAllowedValues = new Set(Object.values(TargetCategories));
const parentTargetAllowedValues = new Set(
  Object.values(TargetParentCategories),
);

const normalizeEnumValue = <T extends Record<string, string>>(
  value: string | undefined | null,
  label: string,
  enumObject: T,
  allowedValues: Set<string>,
): string | undefined => {
  if (value === undefined || value === null) return value ?? undefined;
  if (allowedValues.has(value)) return value;
  if (value in enumObject) {
    return enumObject[value as keyof T];
  }
  throw new BadRequestException(`Invalid ${label}`);
};

/** Pictures must be an object to avoid runtime shape errors. */
const validatePictures = (pictures: any): void => {
  if (!pictures || typeof pictures !== 'object') {
    throw new BadRequestException('pictures must include image fields');
  }
};

/** Optional array guard for nullable list fields. */
const validateOptionalArray = (value: any, label: string): void => {
  if (value === undefined || value === null) return;
  validateRequiredArray(value, label);
};

/** Enforce target vs targetID invariants from the service logic. */
const validateTargetLogic = (dto: {
  target?: string;
  targetID?: any;
}): void => {
  const hasTargetID = dto.targetID !== undefined && dto.targetID !== null;
  const hasTarget = typeof dto.target === 'string' && dto.target.trim() !== '';

  if (!hasTargetID && !hasTarget) {
    throw new BadRequestException('target or targetID is required');
  }
  if (hasTargetID && hasTarget) {
    throw new BadRequestException('target and targetID cannot both be set');
  }
  if (hasTargetID) {
    createObjectIdNormalizer('targetID')(dto.targetID);
  }
  if (hasTarget) {
    normalizeEnumValue(
      dto.target,
      'target',
      TargetCategories,
      targetAllowedValues,
    );
  }
};

// ObjectId helpers shared by resolver/service.
export const normalizeCategoryId = createObjectIdNormalizer('categoryID');
export const validateCategoryId = createObjectIdValidator('categoryID');
export const validateTargetId = createObjectIdValidator('targetID');

/** Normalize/validate target enum input. */
export const validateTargetCategory = (value: string): string => {
  return normalizeEnumValue(
    value,
    'target',
    TargetCategories,
    targetAllowedValues,
  ) as string;
};

/** Validate and normalize create payload. */
export const normalizeCreateCategoryDto = (
  dto: CreateCategoryDto,
): CreateCategoryDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  const normalizedTarget = normalizeEnumValue(
    dto.target,
    'target',
    TargetCategories,
    targetAllowedValues,
  );
  const normalizedParentTarget = normalizeEnumValue(
    dto.parentTarget,
    'parentTarget',
    TargetParentCategories,
    parentTargetAllowedValues,
  );
  validateRequiredArray(dto.tags, 'tags');
  validateOptionalArray(dto.relatedCategories, 'relatedCategories');
  validateOptionalArray(dto.relatedTargets, 'relatedTargets');
  validateOptionalArray(dto.slugHistory, 'slugHistory');
  validatePictures(dto.pictures);
  validateTargetLogic(dto);
  return {
    ...dto,
    target: normalizedTarget as any,
    parentTarget: normalizedParentTarget as any,
  };
};

/** Validate and normalize update payload. */
export const validateUpdateCategoryDto = (
  dto: UpdateCategoryDto,
): UpdateCategoryDto => {
  validateAllowedKeys(dto as any, updateAllowedKeysSet, 'update');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  const normalizedTarget = normalizeEnumValue(
    dto.target,
    'target',
    TargetCategories,
    targetAllowedValues,
  );
  const normalizedParentTarget = normalizeEnumValue(
    dto.parentTarget,
    'parentTarget',
    TargetParentCategories,
    parentTargetAllowedValues,
  );
  validateRequiredArray(dto.tags, 'tags');
  validatePictures(dto.pictures);
  return {
    ...dto,
    _id: normalizeCategoryId(dto._id as any),
    target: normalizedTarget as any,
    parentTarget: normalizedParentTarget as any,
  };
};

/** Validate and normalize the parent/target query payload. */
export const validateParentAndTargetDto = (
  dto?: ParentAndTargetDto,
): ParentAndTargetDto => {
  if (!dto) {
    throw new BadRequestException('ParentAndTargetDto is required');
  }
  validateAllowedKeys(dto as any, parentAndTargetAllowedKeysSet, 'query');
  if (!dto.target) {
    throw new BadRequestException('target is required');
  }
  const normalizedTarget = normalizeEnumValue(
    dto.target,
    'target',
    TargetCategories,
    targetAllowedValues,
  );
  const normalizedParentTarget = normalizeEnumValue(
    dto.parentTarget,
    'parentTarget',
    TargetParentCategories,
    parentTargetAllowedValues,
  );
  return {
    ...dto,
    target: normalizedTarget as any,
    parentTarget: normalizedParentTarget as any,
  };
};
