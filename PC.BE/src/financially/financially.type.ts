import { PaginationType } from 'src/common/types/paginated.type';
import { FinanciallyPostType } from './dto/args.financially.dto';

export const FinanciallyPostPagination = PaginationType(
  FinanciallyPostType,
  'FinanciallyPostPagination', // optional but helps debugging
);

export type FinanciallyPostPaginationType = InstanceType<
  typeof FinanciallyPostPagination
>;
