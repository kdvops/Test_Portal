import { BadRequestException } from '@nestjs/common';

import { CreateEpisodePodcastDto } from './dto/create.podcast.dto';
import { UpdatePodcastEpisodeDto } from './dto/update.podcast.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateEpisodePodcastDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'description',
  'season',
  'slug',
  'status',
  'disabled',
  'cover',
  'coverImageDetail',
  'link',
] as const satisfies ReadonlyArray<keyof CreateEpisodePodcastDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdatePodcastEpisodeDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'episodeID',
  'newCoverPodcast',
  'episode',
] as const satisfies ReadonlyArray<keyof UpdatePodcastEpisodeDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdatePodcastEpisodeDto.episode (compile-time checked). Update when DTO changes. */
const updateEpisodeAllowedKeys = [
  'title',
  'season',
  'link',
  'description',
  'slug',
  'cover',
  'coverImageDetail',
  'status',
  'disabled',
] as const satisfies ReadonlyArray<keyof UpdatePodcastEpisodeDto['episode']>;

const updateEpisodeAllowedKeysSet = new Set(updateEpisodeAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

/** newCoverPodcast must be an array when provided. */
const validateNewCover = (value: any): void => {
  if (value === undefined || value === null) return;
  validateRequiredArray(value, 'newCoverPodcast');
};

// ObjectId helpers shared by resolver/service.
export const normalizeEpisodeId = createObjectIdNormalizer('episodeID');
export const validateEpisodeId = createObjectIdValidator('episodeID');

/** Validate and normalize create payload. */
export const normalizeCreatePodcastDto = (
  dto: CreateEpisodePodcastDto,
): CreateEpisodePodcastDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdatePodcastDto = (
  dto: UpdatePodcastEpisodeDto,
): UpdatePodcastEpisodeDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.episode as any,
    updateEpisodeAllowedKeysSet,
    'update.episode',
  );
  if (dto?.episode?.slug === null || dto?.episode?.slug === undefined) {
    throw new BadRequestException('episode.slug is required');
  }
  validateEnumValue(
    dto?.episode?.status,
    'episode.status',
    statusAllowedValues,
  );
  validateNewCover(dto.newCoverPodcast);
  return {
    ...dto,
    episodeID: normalizeEpisodeId(dto.episodeID as any),
  };
};
