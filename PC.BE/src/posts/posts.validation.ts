import { BadRequestException } from '@nestjs/common';

import { CreatePostDto } from './dto/create.post.dto';
import { UpdatePostDto } from './dto/update.post.dto';
import { ArgsPosts } from './dto/args.post.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import { SeoFieldsInput } from 'src/common/types/common.type';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** SEO fields reused across post DTOs. */
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

/** Keys allowed by CreatePostDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'status',
  'subtitle',
  'slug',
  'link',
  'excerpt',
  'author',
  'publishedAt',
  'description',
  'category',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'disabled',
  'sections',
  ...seoFieldKeys,
] as const satisfies ReadonlyArray<keyof CreatePostDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdatePostDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'postID',
  'post',
  'newUploadBanner',
  'newUploadThumbnail',
  'newUploadResponsive',
] as const satisfies ReadonlyArray<keyof UpdatePostDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdatePostDto.post (compile-time checked). Update when DTO changes. */
const updatePostAllowedKeys = [
  'title',
  'status',
  'slug',
  'excerpt',
  'link',
  'subtitle',
  'description',
  'author',
  'publishedAt',
  'category',
  'banner',
  'thumbnail',
  'responsive',
  'bannerImageDetail',
  'thumbnailImageDetail',
  'responsiveImageDetail',
  'disabled',
  'sections',
  ...seoFieldKeys,
] as const satisfies ReadonlyArray<keyof UpdatePostDto['post']>;

const updatePostAllowedKeysSet = new Set(updatePostAllowedKeys);

/** Keys allowed in ArgsPosts (compile-time checked). Update when DTO changes. */
const argsPostsAllowedKeys = [
  'category',
  'search',
] as const satisfies ReadonlyArray<keyof ArgsPosts>;

const argsPostsAllowedKeysSet = new Set(argsPostsAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

/** Sections must be an array to keep service assumptions safe. */
const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
};

// ObjectId helpers shared by resolver/service.
export const normalizePostId = createObjectIdNormalizer('postID');
export const validatePostId = createObjectIdValidator('postID');

/** Validate and normalize create payload. */
export const normalizeCreatePostDto = (
  dto: CreatePostDto,
): CreatePostDto => {
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
export const validateUpdatePostDto = (dto: UpdatePostDto): UpdatePostDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(dto?.post as any, updatePostAllowedKeysSet, 'update.post');
  validateEnumValue(dto?.post?.status, 'post.status', statusAllowedValues);
  if (dto?.post?.sections === null) {
    throw new BadRequestException('post.sections cannot be null');
  }
  const normalized = {
    ...dto,
    postID: normalizePostId(dto.postID as any),
    post: {
      ...dto.post,
      sections: dto.post?.sections ?? [],
    },
  };
  validateSections(normalized.post.sections, 'post.sections');
  return normalized;
};

/** Validate list/query args. */
export const validateArgsPosts = (args?: ArgsPosts): void => {
  if (!args) {
    throw new BadRequestException('ArgsPosts is required');
  }
  validateAllowedKeys(args as any, argsPostsAllowedKeysSet, 'query');
};
