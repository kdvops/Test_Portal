import type { AuthorInterface } from "./author.interface";
import type { CommonImageDetailInterface } from "./common.interface";
import type { SectionTypeInterface } from "./sections.interface";

// FINANCIALLY TYPE POST
export type TypePostFinancially =
  | "postArticle"
  | "post::article"
  | "postRelease"
  | "post::release"
  | "postEvents"
  | "post::events"
  | "all";

export interface FinanciallyInterface extends CommonImageDetailInterface {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  subtitle: string;
  description: string;
  file: string;
  type: TypePostFinancially;
  sections: Array<SectionTypeInterface>;
  banner: string;
  responsive: string;
  thumbnail: string;
  pinnedAt?: Date | null;
  disabled: boolean;
  authors?: AuthorInterface[] | undefined;
  createdAt?: string;
}
