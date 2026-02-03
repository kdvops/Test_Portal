import { BadRequestException } from '@nestjs/common';

import { CreatePopupDto } from './dto/create.popup.dto';
import { UpdatePopupDto } from './dto/update.popup.dto';
import { OrientationPopup } from 'src/common/enums/popup.enum';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreatePopupDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'excerpt',
  'subtitle',
  'description',
  'orientation',
  'button',
  'background',
  'color',
  'link',
  'image',
  'active',
] as const satisfies ReadonlyArray<keyof CreatePopupDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdatePopupDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'popupID',
  'newImagePopup',
  'popup',
] as const satisfies ReadonlyArray<keyof UpdatePopupDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdatePopupDto.popup (compile-time checked). Update when DTO changes. */
const updatePopupAllowedKeys = [
  'title',
  'excerpt',
  'subtitle',
  'description',
  'button',
  'background',
  'color',
  'orientation',
  'link',
  'image',
  'active',
] as const satisfies ReadonlyArray<keyof UpdatePopupDto['popup']>;

const updatePopupAllowedKeysSet = new Set(updatePopupAllowedKeys);

// Enum value sets used for fast validation/normalization.
const orientationAllowedValues = new Set(Object.values(OrientationPopup));

/** newImagePopup must be an array when provided. */
const validateNewImage = (value: any): void => {
  if (value === undefined || value === null) return;
  validateRequiredArray(value, 'newImagePopup');
};

// ObjectId helpers shared by resolver/service.
export const normalizePopupId = createObjectIdNormalizer('popupID');
export const validatePopupId = createObjectIdValidator('popupID');

/** Validate and normalize create payload. */
export const normalizeCreatePopupDto = (
  dto: CreatePopupDto,
): CreatePopupDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(
    dto.orientation,
    'orientation',
    orientationAllowedValues,
  );
  if (dto.image === null) {
    throw new BadRequestException('image cannot be null');
  }
  const normalized = {
    ...dto,
    image: dto.image ?? [],
  };
  validateRequiredArray(normalized.image, 'image');
  return normalized;
};

/** Validate and normalize update payload. */
export const validateUpdatePopupDto = (
  dto: UpdatePopupDto,
): UpdatePopupDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.popup as any,
    updatePopupAllowedKeysSet,
    'update.popup',
  );
  validateEnumValue(
    dto?.popup?.orientation,
    'popup.orientation',
    orientationAllowedValues,
  );
  validateNewImage(dto.newImagePopup);
  if (dto?.popup?.image === null) {
    throw new BadRequestException('popup.image cannot be null');
  }
  return {
    ...dto,
    popupID: normalizePopupId(dto.popupID as any),
  };
};
