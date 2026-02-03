import { BadRequestException } from '@nestjs/common';

import { CreateChannelDto } from './dto/create.channel.dto';
import { UpdateChannelDto } from './dto/update.channels.dto';
import { ArgsChannels } from './dto/args.channels.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateChannelDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'status',
  'subtitle',
  'slug',
  'excerpt',
  'link',
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
] as const satisfies ReadonlyArray<keyof CreateChannelDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateChannelDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'channelID',
  'channel',
  'newUploadBanner',
  'newUploadThumbnail',
  'newUploadResponsive',
] as const satisfies ReadonlyArray<keyof UpdateChannelDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateChannelDto.channel (compile-time checked). Update when DTO changes. */
const updateChannelAllowedKeys = [
  'title',
  'status',
  'slug',
  'excerpt',
  'link',
  'subtitle',
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
] as const satisfies ReadonlyArray<keyof UpdateChannelDto['channel']>;

const updateChannelAllowedKeysSet = new Set(updateChannelAllowedKeys);

/** Keys allowed in ArgsChannels (compile-time checked). Update when DTO changes. */
const argsChannelsAllowedKeys = [
  'category',
  'search',
] as const satisfies ReadonlyArray<keyof ArgsChannels>;

const argsChannelsAllowedKeysSet = new Set(argsChannelsAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));

/** Sections must be an array to keep service assumptions safe. */
const validateSections = (sections: any[], label: string): void => {
  validateRequiredArray(sections, label);
};

// ObjectId helpers shared by resolver/service.
export const normalizeChannelId = createObjectIdNormalizer('channelID');
export const validateChannelId = createObjectIdValidator('channelID');

/** Validate and normalize create payload. */
export const normalizeCreateChannelDto = (
  dto: CreateChannelDto,
): CreateChannelDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  validateSections(dto.sections, 'sections');
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateChannelDto = (
  dto: UpdateChannelDto,
): UpdateChannelDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.channel as any,
    updateChannelAllowedKeysSet,
    'update.channel',
  );
  validateEnumValue(
    dto?.channel?.status,
    'channel.status',
    statusAllowedValues,
  );
  validateSections(dto?.channel?.sections as any, 'channel.sections');
  return {
    ...dto,
    channelID: normalizeChannelId(dto.channelID as any),
  };
};

/** Validate list/query args. */
export const validateArgsChannels = (args?: ArgsChannels): void => {
  if (!args) {
    throw new BadRequestException('ArgsChannels is required');
  }
  validateAllowedKeys(args as any, argsChannelsAllowedKeysSet, 'query');
};
