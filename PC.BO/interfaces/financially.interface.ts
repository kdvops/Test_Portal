import type { DateTime } from "next-auth/providers/kakao";
import type { ImageDetailInterface } from "./detailed-image.interface";
import type { SectionTypeInterface } from "./sections.interface";
import type { AuthorInterface } from "./author.interface";

// FINANCIALLY TYPE POST
export type TypePostFinancially =
  | "postArticle"
  | "postRelease"
  | "postEvents"
  | "post::article"
  | "post::release"
  | "post::events";

export interface FinanciallyGroupInterface {
  type: string;
  financially: Array<FinanciallyInterface>;
}

export interface FinanciallyInterface {
  _id?: string;
  status?: "draft" | "publish" | "trash";
  title: string;
  slug: string;
  excerpt: string;
  subtitle: string;
  description: string;
  file: string;
  type: TypePostFinancially;
  sections: Array<SectionTypeInterface>;
  banner?: string;
  responsive?: string;
  thumbnail?: string;
  bannerImageDetail?: ImageDetailInterface | null;
  responsiveImageDetail?: ImageDetailInterface | null;
  thumbnailImageDetail?: ImageDetailInterface | null;
  pinnedAt?: DateTime | null;
  disabled: boolean;
  authors?: AuthorInterface[] | undefined;
  createdAt?: string;
  // SEO Fields
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  socialTitle?: string;
  socialDescription?: string;
  keywords?: string[];
  tags?: string[];
  ogImage?: string;
  twitterImage?: string;
  robotsDirectives?: string;
  language?: string;
  structuredType?: string;
  altText?: string;
  schemaMarkup?: string;
  altTextBanner?: string;
  altTextThumbnail?: string;
  altTextResponsive?: string;
  isFeatured?: boolean;
}
