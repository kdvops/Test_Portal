import { BadRequestException } from '@nestjs/common';

import { CreateFormsDto } from './dto/create.forms.dto';
import { UpdateFormsDto } from './dto/update.forms.dto';
import { StatusItem } from 'src/common/enums/status.enums';
import {
  createObjectIdNormalizer,
  createObjectIdValidator,
  validateAllowedKeys,
  validateEnumValue,
  validateRequiredArray,
} from 'src/common/utils/validation';
import { TypeForms } from 'src/common/enums/forms.enum';
import { InputsFormsInput } from 'src/common/types/forms.types';

// Allowed keys lists are kept in sync with DTOs to catch unexpected payloads.
/** Keys allowed by CreateFormsDto (compile-time checked). Update when DTO changes. */
const createAllowedKeys = [
  'title',
  'subtitle',
  'slug',
  'crm',
  'description',
  'banner',
  'responsive',
  'bannerImageDetail',
  'responsiveImageDetail',
  'inputs',
  'termsAndCondition',
  'status',
  'disabled',
] as const satisfies ReadonlyArray<keyof CreateFormsDto>;

const createAllowedKeysSet = new Set(createAllowedKeys);

/** Keys allowed at UpdateFormsDto root (compile-time checked). Update when DTO changes. */
const updateDtoAllowedKeys = [
  'formsID',
  'forms',
  'newUploadBanner',
  'newUploadResponsive',
] as const satisfies ReadonlyArray<keyof UpdateFormsDto>;

const updateDtoAllowedKeysSet = new Set(updateDtoAllowedKeys);

/** Keys allowed in UpdateFormsDto.forms (compile-time checked). Update when DTO changes. */
const updateFormsAllowedKeys = [
  'title',
  'subtitle',
  'slug',
  'crm',
  'description',
  'banner',
  'responsive',
  'bannerImageDetail',
  'responsiveImageDetail',
  'inputs',
  'termsAndCondition',
  'status',
  'disabled',
] as const satisfies ReadonlyArray<keyof UpdateFormsDto['forms']>;

const updateFormsAllowedKeysSet = new Set(updateFormsAllowedKeys);

// Enum value sets used for fast validation/normalization.
const statusAllowedValues = new Set(Object.values(StatusItem));
const inputTypeAllowedValues = new Set(Object.values(TypeForms));

/** Accept enum keys or values and return the enum value (GraphQL clients vary). */
const normalizeEnumValue = <T extends Record<string, string>>(
  value: string | undefined | null,
  label: string,
  enumObject: T,
  allowedValues: Set<string>,
): string | undefined => {
  if (value === undefined || value === null) return value ?? undefined;
  if (allowedValues.has(value)) return value;
  if (value in enumObject) {
    return enumObject[value as keyof T];
  }
  throw new BadRequestException(`Invalid ${label}`);
};

/** Validate the list of form inputs (shape + enum type only). */
const validateInputs = (
  inputs: InputsFormsInput[] | undefined,
  label: string,
): void => {
  validateRequiredArray(inputs, label);
  (inputs ?? []).forEach((input, index) => {
    if (!input || typeof input !== 'object') {
      throw new BadRequestException(
        `${label}[${index}] must be a valid input item`,
      );
    }
    if (typeof (input as any).type === 'string') {
      normalizeEnumValue(
        (input as any).type,
        `${label}[${index}].type`,
        TypeForms,
        inputTypeAllowedValues,
      );
    }
  });
};

/** Accept array wrapper payloads and return the underlying array. */
const normalizeInputsArray = (value: any): InputsFormsInput[] | undefined => {
  if (Array.isArray(value)) return value;
  if (value && typeof value === 'object' && Array.isArray(value.preview)) {
    return value.preview;
  }
  return value;
};

/** Basic shape check for terms and conditions. */
const validateTerms = (terms: any): void => {
  if (!terms || typeof terms !== 'object') {
    throw new BadRequestException('termsAndCondition is required');
  }
  if (typeof terms.text !== 'string') {
    throw new BadRequestException('termsAndCondition.text is required');
  }
  if (typeof terms.enabled !== 'boolean') {
    throw new BadRequestException('termsAndCondition.enabled is required');
  }
  if (typeof terms.accept !== 'boolean') {
    throw new BadRequestException('termsAndCondition.accept is required');
  }
};

/** Normalize inputs to ensure type is the enum value. */
const normalizeInputs = (inputs: InputsFormsInput[]): InputsFormsInput[] => {
  return inputs.map((input) => {
    if (!input || typeof input !== 'object') return input;
    const normalizedType = normalizeEnumValue(
      input.type as any,
      'inputs.type',
      TypeForms,
      inputTypeAllowedValues,
    );
    if (normalizedType) {
      return { ...input, type: normalizedType as TypeForms };
    }
    return input;
  });
};

// ObjectId helpers shared by resolver/service.
export const normalizeFormsId = createObjectIdNormalizer('formsID');
export const validateFormsId = createObjectIdValidator('formsID');

/** Validate and normalize create payload. */
export const normalizeCreateFormsDto = (
  dto: CreateFormsDto,
): CreateFormsDto => {
  validateAllowedKeys(dto as any, createAllowedKeysSet, 'create');
  validateEnumValue(dto.status, 'status', statusAllowedValues);
  const normalizedInputs = normalizeInputsArray(dto.inputs);
  validateInputs(normalizedInputs as any, 'inputs');
  validateTerms(dto.termsAndCondition);
  return {
    ...dto,
    inputs: normalizeInputs(normalizedInputs as any),
  };
};

/** Validate and normalize update payload. */
export const validateUpdateFormsDto = (dto: UpdateFormsDto): UpdateFormsDto => {
  validateAllowedKeys(dto as any, updateDtoAllowedKeysSet, 'update');
  validateAllowedKeys(
    dto?.forms as any,
    updateFormsAllowedKeysSet,
    'update.forms',
  );
  validateEnumValue(dto?.forms?.status, 'forms.status', statusAllowedValues);
  const normalizedInputs = normalizeInputsArray(dto?.forms?.inputs);
  validateInputs(normalizedInputs as any, 'forms.inputs');
  validateTerms(dto?.forms?.termsAndCondition);
  return {
    ...dto,
    formsID: normalizeFormsId(dto.formsID as any),
    forms: {
      ...dto.forms,
      inputs: normalizeInputs(normalizedInputs as any),
    },
  };
};
