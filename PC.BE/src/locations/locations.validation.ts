import { BadRequestException } from '@nestjs/common';

import { CreateLocationDto } from './dto/create.location.dto';
import { UpdateLocationDto } from './dto/update.location.dto';
import { TypeLocation } from 'src/common/enums/locations.enum';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateLocationDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'label',
  'type',
  'address',
  'city',
  'latitude',
  'longitude',
  'hours',
] as const satisfies ReadonlyArray<keyof CreateLocationDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateLocationDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'locationID',
  'location',
] as const satisfies ReadonlyArray<keyof UpdateLocationDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateLocationDto.location (compile-time checked). Update when DTO changes. */
const updateLocationAllowedKeys = [
  'label',
  'type',
  'address',
  'city',
  'latitude',
  'longitude',
  'hours',
] as const satisfies ReadonlyArray<keyof UpdateLocationDto['location']>;

const updateLocationAllowedKeysSet = new Set(updateLocationAllowedKeys);

// Enum value sets used for fast validation/normalization.
const typeAllowedValues = new Set(Object.values(TypeLocation));

/** Hours must be an array to keep service assumptions safe. */
const validateHours = (hours: any, label: string): void => {
  validateRequiredArray(hours, label);
};

// ObjectId helpers shared by resolver/service.
export const normalizeLocationId = createObjectIdNormalizer('locationID');
export const validateLocationId = createObjectIdValidator('locationID');

/** Validate and normalize create payload. */
export const normalizeCreateLocationDto = (
  dto: CreateLocationDto,
): CreateLocationDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.type, 'type', typeAllowedValues);
  if (dto.hours === null) {
    throw new BadRequestException('hours cannot be null');
  }
  const normalized = {
    ...dto,
    hours: dto.hours ?? [],
  };
  validateHours(normalized.hours, 'hours');
  return normalized;
};

/** Validate and normalize update payload. */
export const validateUpdateLocationDto = (
  dto: UpdateLocationDto,
): UpdateLocationDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.location as any,
    updateLocationAllowedKeysSet,
    'update.location',
  );
  validateEnumValue(dto?.location?.type, 'location.type', typeAllowedValues);
  if (dto?.location?.hours === null) {
    throw new BadRequestException('location.hours cannot be null');
  }
  const normalizedId = validateLocationId(dto.locationID as any);
  const normalized = {
    ...dto,
    locationID: normalizedId.toString(),
    location: {
      ...dto.location,
      hours: dto.location?.hours ?? [],
    },
  };
  validateHours(normalized.location.hours, 'location.hours');
  return normalized;
};
