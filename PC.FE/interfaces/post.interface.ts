import type { CategoriesInterface } from "./categories.interface";
import type { SectionTypeInterface } from "./sections.interface";
import type { TargetInterface } from "./targets.interface";

export interface PostInterface {
    _id: string;
    slug: string;
    title: string;
    subtitle: string;
    link: string;
    excerpt: string;
    banner: string;
    responsive: string;
    thumbnail: string;
    bannerImageDetail?: {
        _id?: string;
        image: string | null;
        altText: string | null;
    };
    responsiveImageDetail?: {
        _id?: string;
        image: string | null;
        altText: string | null;
    };
    thumbnailImageDetail?: {
        _id?: string;
        image: string | null;
        altText: string | null;
    };
    sections: Array<SectionTypeInterface>;

    // -------------------------
    // 🔑 SEO FIELDS
    // -------------------------
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
    relatedPosts?: string[];
    isFeatured?: boolean;

    // -------------------------
    // 🔑 OTHER FIELDS
    // -------------------------
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
    author?: string;
    publishedAt?: Date;
    readingTime?: number;
    focusKeyword?: string;

    // -------------------------
    // 🔑 RELATED FIELDS
    // -------------------------
    category?: CategoriesInterface | string | null;
    targetID?: TargetInterface | null;
}