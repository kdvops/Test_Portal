import { BadRequestException } from '@nestjs/common';

import { CreateMessagesDto } from './dto/create.messages.dto';
import { UpdateMessagesDto } from './dto/update.messages.dto';
import { ArgsMessages } from './dto/args.messages.dto';
import {
  createObjectIdValidator,
  validateAllowedKeys,
  validateRequiredArray,
} from 'src/common/utils/validation';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateMessagesDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'createdAt',
  'form',
  'values',
] as const satisfies ReadonlyArray<keyof CreateMessagesDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateMessagesDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'messagesID',
  'messages',
] as const satisfies ReadonlyArray<keyof UpdateMessagesDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateMessagesDto.messages (compile-time checked). Update when DTO changes. */
const updateMessagesAllowedKeys = [
  'form',
  'values',
] as const satisfies ReadonlyArray<keyof UpdateMessagesDto['messages']>;

const updateMessagesAllowedKeysSet = new Set(updateMessagesAllowedKeys);

/** Keys allowed in ArgsMessages (compile-time checked). Update when DTO changes. */
const argsMessagesAllowedKeys = [
  'date',
  'formRef',
  'search',
] as const satisfies ReadonlyArray<keyof ArgsMessages>;

const argsMessagesAllowedKeysSet = new Set(argsMessagesAllowedKeys);

/** Values must be an array to keep service assumptions safe. */
const validateValues = (values: any, label: string): void => {
  validateRequiredArray(values, label);
};

/** Date range must be an object when provided. */
const validateDateRange = (range: any): void => {
  if (!range || typeof range !== 'object') {
    throw new BadRequestException('date is required');
  }
};

// ObjectId helpers shared by resolver/service.
export const validateMessagesId = createObjectIdValidator('messagesID');

/** Validate and normalize create payload. */
export const normalizeCreateMessagesDto = (
  dto: CreateMessagesDto,
): CreateMessagesDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateValues(dto.values, 'values');
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateMessagesDto = (
  dto: UpdateMessagesDto,
): UpdateMessagesDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.messages as any,
    updateMessagesAllowedKeysSet,
    'update.messages',
  );
  validateValues(dto?.messages?.values, 'messages.values');
  return dto;
};

/** Validate list/query args. */
export const validateArgsMessages = (args?: ArgsMessages): void => {
  if (!args) {
    throw new BadRequestException('ArgsMessages is required');
  }
  validateAllowedKeys(args as any, argsMessagesAllowedKeysSet, 'query');
  validateDateRange(args.date);
};
