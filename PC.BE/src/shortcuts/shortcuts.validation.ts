import { BadRequestException } from '@nestjs/common';

import { CreateShortcutsDto } from './dto/create.shortcuts.dto';
import { UpdateShortcutsDto } from './dto/update.shortcuts.dto';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';
import {
  TargetShortcut,
  TypeShortcut,
} from 'src/common/enums/shortcut.enums';

/** Keys allowed by CreateShortcutsDto (update when DTO changes). */
const createAllowedKeys = [
  'name',
  'icon',
  'color',
  'background',
  'disabled',
  'type',
  'target',
  'targetID',
  'cards',
] as const satisfies ReadonlyArray<keyof CreateShortcutsDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed by UpdateShortcutsDto root (update when DTO changes). */
const updateDtoAllowedKeys = [
  'shortcutID',
  'shortcut',
] as const satisfies ReadonlyArray<keyof UpdateShortcutsDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed inside UpdateShortcutsDto.shortcut (update when DTO changes). */
const updateShortcutAllowedKeys = [
  'name',
  'icon',
  'color',
  'background',
  'disabled',
  'type',
  'target',
  'targetID',
  'cards',
] as const satisfies ReadonlyArray<keyof UpdateShortcutsDto['shortcut']>;

const updateShortcutAllowedKeysSet = new Set(updateShortcutAllowedKeys);

const typeAllowedValues = new Set(Object.values(TypeShortcut));
const targetAllowedValues = new Set(Object.values(TargetShortcut));

export const normalizeShortcutId = createObjectIdNormalizer('shortcutID');
export const validateShortcutId = createObjectIdValidator('shortcutID');
export const validateTargetId = createObjectIdValidator('targetID');

/** Validate and normalize create payload. */
export const normalizeCreateShortcutsDto = (
  dto: CreateShortcutsDto,
): CreateShortcutsDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.type, 'type', typeAllowedValues);
  validateEnumValue(dto.target as any, 'target', targetAllowedValues);
  if (dto.cards === null) {
    throw new BadRequestException('cards cannot be null');
  }
  const normalized = {
    ...dto,
    cards: dto.cards ?? [],
  };
  validateRequiredArray(normalized.cards, 'cards');
  return normalized;
};

/** Validate and normalize update payload. */
export const validateUpdateShortcutsDto = (
  dto: UpdateShortcutsDto,
): UpdateShortcutsDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(dto?.shortcut as any, updateShortcutAllowedKeysSet, 'update.shortcut');
  validateEnumValue(dto?.shortcut?.type, 'shortcut.type', typeAllowedValues);
  validateEnumValue(dto?.shortcut?.target as any, 'shortcut.target', targetAllowedValues);
  if (dto?.shortcut?.cards === null) {
    throw new BadRequestException('shortcut.cards cannot be null');
  }
  const normalized = {
    ...dto,
    shortcutID: normalizeShortcutId(dto.shortcutID as any),
    shortcut: {
      ...dto.shortcut,
      cards: dto.shortcut?.cards ?? [],
    },
  };
  validateRequiredArray(normalized.shortcut.cards, 'shortcut.cards');
  return normalized;
};

/** Validate target arg for query use. */
export const validateShortcutTarget = (target?: string): void => {
  if (typeof target !== 'string' || target.trim() === '') {
    throw new BadRequestException('Target is required');
  }
  validateEnumValue(target, 'target', targetAllowedValues);
};
