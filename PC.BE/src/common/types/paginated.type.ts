// src/graphql/types/pagination.type.ts
import { Field, Int, ObjectType } from '@nestjs/graphql';
import type { Type } from '@nestjs/common';

export function PaginationType<TItem>(itemClass: Type<TItem>, name?: string) {
  @ObjectType(name ?? `${itemClass.name}Pagination`)
  class PaginationObject {
    @Field(() => Int)
    currentPage!: number;

    @Field(() => [itemClass])
    items!: TItem[];

    @Field(() => Int)
    totalItems!: number;

    @Field(() => Int)
    itemsPerPage!: number;
  }

  return PaginationObject;
}

export type PaginationShape<T> = {
  currentPage: number;
  items: T[];
  totalItems: number;
  itemsPerPage: number;
};
