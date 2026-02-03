import type { SectionTypeInterface } from "./sections.interface";

export interface TargetInterface {
  _id?: string;
  name: string;
  slug: string;
  icon: string;
  color: string;
  description: string;
  sections: Array<SectionTypeInterface>;
  status: 'publish' | 'draft';
  featured: 'hidden' | 'menu' | 'menu-expanded';
  showCategories: boolean;
  showPosts: boolean;
  order?: number;
  
  // -------------------------
  // 🔑 SEO FIELDS
  // -------------------------
  metaTitle?: string; // Título SEO
  metaDescription?: string; // Descripción SEO
  keywords?: string[]; // Palabras clave
  canonicalUrl?: string; // URL canónica
  tags?: string[]; // Etiquetas temáticas
  ogImage?: string; // Imagen Open Graph
  twitterImage?: string; // Imagen Twitter
  socialTitle?: string; // Título para redes sociales
  socialDescription?: string; // Descripción para redes sociales
  altText?: string; // Texto alternativo de imagen
  robotsDirectives?: string; // "index, follow" | "noindex, nofollow"
  language?: string; // Idioma principal
  structuredType?: string; // Tipo schema.org
  schemaMarkup?: string; // JSON-LD serializado
  relatedTargets?: string[]; // Targets relacionados
  isFeatured?: boolean; // Destacado
  
  createdAt?: Date;
  updatedAt?: Date;
  deletedAt?: Date;
}
