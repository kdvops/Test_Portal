import type { CommonImageDetailInterface } from "./common.interface";
import type { FeaturesCategoryType } from "./features.interface";

export interface PicturesCategoryType extends CommonImageDetailInterface{
  banner: string;
  responsive: string;
  thumbnail: string;
}

export interface CategoriesInterface {
  _id?: string;
  name: string;
  excerpt: string;
  features?: FeaturesCategoryType[];
  description: string;
  slug: string;
  tags?: string[];
  parentTarget?: string;
  subcategories?: Array<CategoriesInterface>
  pictures: PicturesCategoryType;
  disabled: boolean;
  target: string;
  
  // -------------------------
  // 🔑 SEO FIELDS
  // -------------------------
  metaTitle?: string; // Título SEO
  metaDescription?: string; // Descripción SEO
  keywords?: string[]; // Palabras clave
  canonicalUrl?: string; // URL canónica
  ogImage?: string; // Imagen Open Graph
  twitterImage?: string; // Imagen Twitter
  socialTitle?: string; // Título para redes sociales
  socialDescription?: string; // Descripción para redes sociales
  altText?: string; // Texto alternativo de imagen
  robotsDirectives?: string; // "index, follow" | "noindex, nofollow"
  language?: string; // Idioma principal
  structuredType?: string; // Tipo schema.org
  schemaMarkup?: string; // JSON-LD serializado
  isFeatured?: boolean; // Destacado
  
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
