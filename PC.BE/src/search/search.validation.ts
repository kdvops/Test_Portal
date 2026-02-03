import { BadRequestException } from '@nestjs/common';

/** Validate the search term used by the resolver. */
export const validateSearchTerm = (value?: string): string => {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new BadRequestException('Search is required');
  }
  return value;
};
