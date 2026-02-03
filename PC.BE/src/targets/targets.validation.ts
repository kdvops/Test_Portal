import { BadRequestException } from '@nestjs/common';

import { CreateTargetDto } from './dto/create.target.dto';
import { UpdateTargetDto } from './dto/update.target.dto';
import { SeoFieldsInput } from 'src/common/types/common.type';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';
import { StatusItem } from 'src/common/enums/status.enums';
import { GlobalPositionsFreatured } from 'src/common/enums/target.enum';

/** SEO fields reused across target DTOs. */
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

/** Keys allowed by CreateTargetDto (update when DTO changes). */
const createAllowedKeys = [
  'status',
  'name',
  'icon',
  'color',
  'featured',
  'description',
  'slug',
  'showPosts',
  'showCategories',
  'disabled',
  'sections',
  'relatedTargets',
  ...seoFieldKeys,
] as const satisfies ReadonlyArray<keyof CreateTargetDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed by UpdateTargetDto root (update when DTO changes). */
const updateDtoAllowedKeys = [
  'targetID',
  'target',
] as const satisfies ReadonlyArray<keyof UpdateTargetDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed inside UpdateTargetDto.target (update when DTO changes). */
const updateTargetAllowedKeys = [
  'status',
  'name',
  'icon',
  'color',
  'featured',
  'description',
  'slug',
  'showPosts',
  'showCategories',
  'disabled',
  'sections',
  'relatedTargets',
  ...seoFieldKeys,
] as const satisfies ReadonlyArray<keyof UpdateTargetDto['target']>;

const updateTargetAllowedKeysSet = new Set(updateTargetAllowedKeys);

const statusAllowedValues = new Set(Object.values(StatusItem));
const featuredAllowedValues = new Set(Object.values(GlobalPositionsFreatured));

export const normalizeTargetId = createObjectIdNormalizer('targetID');
export const validateTargetId = createObjectIdValidator('targetID');

/** Validate and normalize create payload. */
export const normalizeCreateTargetDto = (
  dto: CreateTargetDto,
): CreateTargetDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  validateEnumValue(dto.featured, 'featured', featuredAllowedValues);
  if (dto.sections === null) {
    throw new BadRequestException('sections cannot be null');
  }
  const normalized = {
    ...dto,
    sections: dto.sections ?? [],
  };
  validateRequiredArray(normalized.sections, 'sections');
  return normalized;
};

/** Validate and normalize update payload. */
export const validateUpdateTargetDto = (
  dto: UpdateTargetDto,
): UpdateTargetDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.target as any,
    updateTargetAllowedKeysSet,
    'update.target',
  );
  validateEnumValue(dto?.target?.status, 'target.status', statusAllowedValues);
  validateEnumValue(
    dto?.target?.featured,
    'target.featured',
    featuredAllowedValues,
  );
  if (dto?.target?.sections === null) {
    throw new BadRequestException('target.sections cannot be null');
  }
  const normalized = {
    ...dto,
    target: {
      ...dto.target,
      sections: dto.target?.sections ?? [],
    },
  };
  validateTargetId(dto.targetID as any);
  validateRequiredArray(normalized.target.sections, 'target.sections');
  return normalized;
};
