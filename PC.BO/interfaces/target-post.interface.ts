// IMPORT INTERFACES
import type { CategoriesInterface } from "./categories.interface";
import type { SectionTypeInterface } from "./sections.interface";
import type { TargetInterface } from "./targets.interface";

export interface TargetPostGroupInterface {
  category: CategoriesInterface;
  posts: Array<TargetPostInterface>;
}

export interface TargetPostInterface {
  _id?: string;
  status?: 'draft' | 'publish' | 'trash';
  title: string;
  slug: string;
  excerpt: string;
  link?: string;
  subtitle: string;
  description: string;
  category: string | CategoriesInterface;
  sections: Array<SectionTypeInterface>;
  banner: string;
  responsive?: string;
  thumbnail: string;
  disabled: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
  
  // SEO FIELDS
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  tags?: string[];
  ogImage?: string;
  twitterImage?: string;
  socialTitle?: string;
  socialDescription?: string;
  altText?: string;
  robotsDirectives?: string;
  language?: string;
  structuredType?: string;
  schemaMarkup?: string;
  relatedTargets?: string[];
  isFeatured?: boolean;
  altTextBanner?: string;
  altTextThumbnail?: string;
  altTextResponsive?: string;
  focusKeyword?: string;
  slugHistory?: string[];
}
