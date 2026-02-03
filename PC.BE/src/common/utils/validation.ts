import { BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

/** Guard against unexpected keys in DTOs/args. Update allow-lists when DTOs change. */
export const validateAllowedKeys = (
  obj: Record<string, any> | undefined,
  allowed: ReadonlySet<string>,
  label: string,
): void => {
  if (!obj) return;
  const extras = Object.keys(obj).filter((key) => !allowed.has(key));
  if (extras.length > 0) {
    throw new BadRequestException(
      `Unknown ${label} fields: ${extras.join(', ')}`,
    );
  }
};

/** Validate enum values with a consistent error message. */
export const validateEnumValue = (
  value: string | undefined | null,
  label: string,
  allowed: Set<string>,
): void => {
  if (value === undefined || value === null) return;
  if (!allowed.has(value)) {
    throw new BadRequestException(`Invalid ${label}`);
  }
};

/** Require an array input (null/undefined/other types are rejected). */
export const validateRequiredArray = (value: any, label: string): void => {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`${label} must be an array`);
  }
};

/** Build a string ObjectId validator with a labeled error. */
export const createObjectIdValidator = (label: string) => {
  return (value: string): Types.ObjectId => {
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    throw new BadRequestException(`Invalid ${label}`);
  };
};

/** Build an ObjectId normalizer that accepts string or ObjectId. */
export const createObjectIdNormalizer = (label: string) => {
  return (value: Types.ObjectId | string): Types.ObjectId => {
    if (value instanceof Types.ObjectId) return value;
    if (typeof value === 'string' && Types.ObjectId.isValid(value)) {
      return new Types.ObjectId(value);
    }
    throw new BadRequestException(`Invalid ${label}`);
  };
};
