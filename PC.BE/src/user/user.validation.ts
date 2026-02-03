import { BadRequestException } from '@nestjs/common';

import { CreateUserDto } from './dto/create.user.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { FetchUsersArgsDto } from './dto/params.users.dto';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
} from 'src/common/utils/validation';

/** Keys allowed by CreateUserDto (update when DTO changes). */
const createAllowedKeys = [
  'firstName',
  'lastName',
  'email',
  'birthday',
  'password',
  'country',
  'phone',
] as const satisfies ReadonlyArray<keyof CreateUserDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateUserDto root (update when DTO changes). */
const updateDtoAllowedKeys = [
  'userID',
  'user',
  'newUploadAvatar',
] as const satisfies ReadonlyArray<keyof UpdateUserDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateUserDto.user (update when DTO changes). */
const updateUserAllowedKeys = [
  'firstName',
  'lastName',
  'avatar',
] as const satisfies ReadonlyArray<keyof UpdateUserDto['user']>;

const updateUserAllowedKeysSet = new Set(updateUserAllowedKeys);

/** Keys allowed in FetchUsersArgsDto (update when DTO changes). */
const fetchUsersAllowedKeys = [
  'search',
] as const satisfies ReadonlyArray<keyof FetchUsersArgsDto>;

const fetchUsersAllowedKeysSet = new Set(fetchUsersAllowedKeys);

export const normalizeUserId = createObjectIdNormalizer('userID');
export const validateUserId = createObjectIdValidator('userID');

/** Validate and normalize create payload. */
export const normalizeCreateUserDto = (dto: CreateUserDto): CreateUserDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  return dto;
};

/** Validate and normalize update payload. */
export const validateUpdateUserDto = (dto: UpdateUserDto): UpdateUserDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(dto?.user as any, updateUserAllowedKeysSet, 'update.user');
  return {
    ...dto,
    userID: normalizeUserId(dto.userID as any),
  };
};

/** Validate list/query args. */
export const validateFetchUsersArgs = (args?: FetchUsersArgsDto): void => {
  if (!args) {
    throw new BadRequestException('FetchUsersArgsDto is required');
  }
  validateAllowedKeys(args as any, fetchUsersAllowedKeysSet, 'query');
};
