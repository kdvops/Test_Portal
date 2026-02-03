import { BadRequestException } from '@nestjs/common';

import { CreateFinanciallyDto } from './dto/create.financially.dto';
import { UpdateFinanciallyDto } from './dto/update.financially.dto';
import { ArgsFinancially } from './dto/args.financially.dto';
import { TypePostFinancially } from 'src/common/enums/financially.enum';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** SEO fields reused across financially DTOs. */
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
] as const satisfies ReadonlyArray<keyof CreateFinanciallyDto>;

/** Keys allowed by CreateFinanciallyDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'slug',
  'subtitle',
  'excerpt',
  'description',
  'type',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'file',
  'status',
  'disabled',
  'sections',
  'pinnedAt',
  'authors',
  ...seoFieldKeys,
] as const satisfies ReadonlyArray<keyof CreateFinanciallyDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateFinanciallyDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'financiallyID',
  'financially',
  'newUploadBanner',
  'newUploadThumbnail',
  'newUploadResponsive',
  'newUploadFile',
] as const satisfies ReadonlyArray<keyof UpdateFinanciallyDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateFinanciallyDto.financially (compile-time checked). Update when DTO changes. */
const updateFinanciallyAllowedKeys = [
  'title',
  'slug',
  'excerpt',
  'subtitle',
  'description',
  'type',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'file',
  'status',
  'disabled',
  'sections',
  'pinnedAt',
  'authors',
  ...seoFieldKeys,
] as const satisfies ReadonlyArray<keyof UpdateFinanciallyDto['financially']>;

const updateFinanciallyAllowedKeysSet = new Set(updateFinanciallyAllowedKeys);

/** Keys allowed in ArgsFinancially (compile-time checked). Update when DTO changes. */
const argsFinanciallyAllowedKeys = [
  'type',
  'search',
  'page',
  'itemsPerPage',
] as const satisfies ReadonlyArray<keyof ArgsFinancially>;

const argsFinanciallyAllowedKeysSet = new Set(argsFinanciallyAllowedKeys);

// Enum value sets used for fast validation/normalization.
const typeAllowedValues = new Set(Object.values(TypePostFinancially));
const statusAllowedValues = new Set(Object.values(StatusItem));

/** String helper for required fields (avoids implicit non-empty rules). */
const isString = (value: unknown): value is string => typeof value === 'string';

/** Section list guard with minimal per-item checks. */
const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
  sections.forEach((section, index) => {
    if (!section || typeof section !== 'object') {
      throw new BadRequestException(`${label}[${index}] must be a valid section`);
    }
    if (!isString(section.type)) {
      throw new BadRequestException(`${label}[${index}].type is required`);
    }
    if (
      section.position !== undefined &&
      typeof section.position !== 'number'
    ) {
      throw new BadRequestException(
        `${label}[${index}].position must be a number`,
      );
    }
  });
};

/** Author list guard with minimal per-item checks. */
const validateAuthors = (authors: any[], label: string): void => {
  validateRequiredArray(authors, label);
  authors.forEach((author, index) => {
    if (!author || typeof author !== 'object') {
      throw new BadRequestException(`${label}[${index}] must be a valid author`);
    }
    if (!isString(author.name)) {
      throw new BadRequestException(`${label}[${index}].name is required`);
    }
    if (author.image && typeof author.image !== 'object') {
      throw new BadRequestException(
        `${label}[${index}].image must be a valid image object`,
      );
    }
  });
};

const normalizeSectionCreate = (section: any): any => ({
  ...section,
  cards: section?.cards ?? [],
  attachments: section?.attachments ?? [],
  grids: section?.grids ?? [],
  gallery: section?.gallery
    ? { ...section.gallery, items: section.gallery.items ?? [] }
    : section?.gallery,
  accordion: section?.accordion
    ? { ...section.accordion, items: section.accordion.items ?? [] }
    : section?.accordion,
});

const normalizeSectionUpdate = (section: any): any => ({
  ...section,
  cards: section?.cards ?? [],
  attachments: section?.attachments ?? [],
  grids: section?.grids ?? [],
  gallery: section?.gallery
    ? { ...section.gallery, items: section.gallery.items ?? [] }
    : section?.gallery,
  accordion: section?.accordion
    ? { ...section.accordion, items: section.accordion.items ?? [] }
    : section?.accordion,
});

// ObjectId helpers shared by resolver/service.
export const normalizeFinanciallyId = createObjectIdNormalizer('financiallyID');
export const validateFinanciallyId = createObjectIdValidator('financiallyID');

/** Validate and normalize create payload. */
export const normalizeCreateFinanciallyDto = (
  dto: CreateFinanciallyDto,
): CreateFinanciallyDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.type, 'type', typeAllowedValues);
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  if (dto.sections === null) {
    throw new BadRequestException('sections cannot be null');
  }
  const normalized = {
    ...dto,
    sections: (dto.sections ?? []).map(normalizeSectionCreate),
    authors: dto.authors ?? [],
    file: dto.file ?? [],
    banner: dto.banner ?? [],
    thumbnail: dto.thumbnail ?? [],
    responsive: dto.responsive ?? [],
  };
  validateSections(normalized.sections, 'sections');
  validateAuthors(normalized.authors, 'authors');
  return normalized;
};

/** Validate list/query args. */
export const validateArgsFinancially = (args?: ArgsFinancially): void => {
  if (!args) {
    throw new BadRequestException('ArgsFinancially is required');
  }
  validateAllowedKeys(args as any, argsFinanciallyAllowedKeysSet, 'query');
};

/** Validate and normalize update payload. */
export const validateUpdateFinanciallyDto = (
  dto: UpdateFinanciallyDto,
): UpdateFinanciallyDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.financially as any,
    updateFinanciallyAllowedKeysSet,
    'update.financially',
  );
  validateEnumValue(
    dto?.financially?.type,
    'financially.type',
    typeAllowedValues,
  );
  validateEnumValue(
    dto?.financially?.status,
    'financially.status',
    statusAllowedValues,
  );
  if (dto?.financially?.sections === null) {
    throw new BadRequestException('financially.sections cannot be null');
  }

  const normalized = {
    ...dto,
    financiallyID: normalizeFinanciallyId(dto.financiallyID as any),
    financially: {
      ...dto.financially,
      sections: (dto.financially?.sections ?? []).map(normalizeSectionUpdate),
      authors: dto.financially?.authors ?? [],
    },
    newUploadFile: dto.newUploadFile ?? [],
  };
  validateSections(normalized.financially.sections, 'financially.sections');
  validateAuthors(normalized.financially.authors, 'financially.authors');
  return normalized;
};
