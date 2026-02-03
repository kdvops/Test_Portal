export interface PaginationInterface<T> {
  currentPage: number;
  items: Array<T>;
  totalItems: number;
  itemsPerPage: number;
}
