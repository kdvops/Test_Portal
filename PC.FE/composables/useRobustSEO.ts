import type { TargetInterface } from "~/interfaces/targets.interface";
import type { PostInterface } from "~/interfaces/post.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";

export interface SEOAttributes {
  altText?: string;
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  keywords?: string[];
  canonicalUrl?: string;
  tags?: string[];
  ogImage?: string;
  twitterImage?: string;
  socialTitle?: string;
  socialDescription?: string;
  robotsDirectives?: string;
  language?: string;
  structuredType?: string;
  schemaMarkup?: string;
  relatedTargets?: string[];
  isFeatured?: boolean;
}

export interface RobustSEOData {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  twitterImage: string;
  socialTitle: string;
  socialDescription: string;
  robotsDirectives: string;
  language: string;
  structuredType: string;
  schemaMarkup: string;
  tags: string[];
  focusKeyword: string;
  altText: string;
  isFeatured: boolean;
}

export const useRobustSEO = () => {
  const route = useRoute();
  const config = useRuntimeConfig();
  const baseUrl = config.public.baseUrl || "https://bsc.com.bo";

  // Configuración SEO por defecto para cada sección
  const defaultSectionConfig = {
    home: {
      title: "Portal BSC - Banco de Santa Cruz",
      description:
        "Accede a todos los servicios financieros del Banco de Santa Cruz. Cuentas, tarjetas, préstamos, seguros y más.",
      keywords: [
        "BSC",
        "Banco de Santa Cruz",
        "servicios financieros",
        "cuentas",
        "tarjetas",
        "préstamos",
        "seguros",
        "banca digital",
      ],
      structuredType: "WebSite",
      focusKeyword: "Banco de Santa Cruz",
    },
    products: {
      title: "Productos Financieros - Portal BSC",
      description:
        "Descubre todos nuestros productos financieros: cuentas de ahorro, tarjetas de crédito, préstamos, depósitos y más.",
      keywords: [
        "productos financieros",
        "cuentas",
        "tarjetas",
        "préstamos",
        "depósitos",
        "BSC",
        "banca personal",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "productos financieros",
    },
    about: {
      title: "Acerca de Nosotros - Portal BSC",
      description:
        "Conoce más sobre el Banco de Santa Cruz, nuestra historia, misión, visión y compromiso con nuestros clientes.",
      keywords: [
        "Banco de Santa Cruz",
        "historia",
        "misión",
        "visión",
        "acerca de",
        "BSC",
        "empresa",
      ],
      structuredType: "AboutPage",
      focusKeyword: "Banco de Santa Cruz",
    },
    business: {
      title: "Servicios Empresariales - Portal BSC",
      description:
        "Soluciones financieras para empresas. Cuentas corporativas, préstamos empresariales, servicios de tesorería y más.",
      keywords: [
        "servicios empresariales",
        "empresas",
        "corporativo",
        "préstamos empresariales",
        "tesorería",
        "BSC",
        "banca empresarial",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "servicios empresariales",
    },
    enterprise: {
      title: "Servicios Corporativos - Portal BSC",
      description:
        "Servicios financieros especializados para grandes empresas y corporaciones del Banco de Santa Cruz.",
      keywords: [
        "servicios corporativos",
        "grandes empresas",
        "corporaciones",
        "finanzas corporativas",
        "BSC",
        "banca corporativa",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "servicios corporativos",
    },
    insurance: {
      title: "Seguros - Portal BSC",
      description:
        "Protege lo que más te importa con nuestros seguros. Seguros de vida, salud, vehículos y más.",
      keywords: [
        "seguros",
        "seguro de vida",
        "seguro de salud",
        "seguro vehicular",
        "protección",
        "BSC",
        "aseguradora",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "seguros",
    },
    locations: {
      title: "Ubicaciones y Sucursales - Portal BSC",
      description:
        "Encuentra la sucursal más cercana del Banco de Santa Cruz. Horarios, direcciones y servicios disponibles.",
      keywords: [
        "sucursales",
        "ubicaciones",
        "horarios",
        "direcciones",
        "BSC",
        "Banco de Santa Cruz",
        "oficinas",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "sucursales BSC",
    },
    profits: {
      title: "Beneficios y Promociones - Portal BSC",
      description:
        "Descubre todos los beneficios y promociones exclusivas para clientes del Banco de Santa Cruz.",
      keywords: [
        "beneficios",
        "promociones",
        "descuentos",
        "ofertas",
        "clientes",
        "BSC",
        "ventajas",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "beneficios BSC",
    },
    promotions: {
      title: "Promociones Especiales - Portal BSC",
      description:
        "No te pierdas nuestras promociones especiales. Ofertas exclusivas en productos y servicios financieros.",
      keywords: [
        "promociones",
        "ofertas",
        "descuentos",
        "especiales",
        "exclusivas",
        "BSC",
        "promociones bancarias",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "promociones BSC",
    },
    podcast: {
      title: "Podcast BSC - Portal BSC",
      description:
        "Escucha nuestros podcasts sobre educación financiera, consejos de ahorro y temas de interés bancario.",
      keywords: [
        "podcast",
        "educación financiera",
        "consejos",
        "ahorro",
        "finanzas personales",
        "BSC",
        "contenido educativo",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "podcast BSC",
    },
    search: {
      title: "Búsqueda - Portal BSC",
      description:
        "Busca información, productos y servicios en el Portal Cliente del Banco de Santa Cruz.",
      keywords: [
        "búsqueda",
        "buscar",
        "información",
        "productos",
        "servicios",
        "BSC",
        "buscador",
      ],
      structuredType: "SearchResultsPage",
      focusKeyword: "búsqueda BSC",
    },
    forms: {
      title: "Formularios - Portal BSC",
      description:
        "Accede a todos los formularios y documentos necesarios para nuestros servicios financieros.",
      keywords: [
        "formularios",
        "documentos",
        "solicitudes",
        "trámites",
        "BSC",
        "documentación",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "formularios BSC",
    },
    channels: {
      title: "Canales de Atención - Portal BSC",
      description:
        "Conoce todos nuestros canales de atención al cliente. Banca digital, call center, sucursales y más.",
      keywords: [
        "canales de atención",
        "atención al cliente",
        "banca digital",
        "call center",
        "BSC",
        "contacto",
      ],
      structuredType: "ContactPage",
      focusKeyword: "atención al cliente BSC",
    },
    adjudicated: {
      title: "Adjudicados - Portal BSC",
      description:
        "Información para clientes adjudicados. Servicios especiales y beneficios exclusivos.",
      keywords: [
        "adjudicados",
        "clientes especiales",
        "beneficios exclusivos",
        "servicios especiales",
        "BSC",
        "clientes VIP",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "clientes adjudicados BSC",
    },
    financially: {
      title: "Educación Financiera - Portal BSC",
      description:
        "Aprende sobre finanzas personales, ahorro, inversión y educación financiera con el Banco de Santa Cruz.",
      keywords: [
        "educación financiera",
        "finanzas personales",
        "ahorro",
        "inversión",
        "consejos",
        "BSC",
        "alfabetización financiera",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "educación financiera",
    },
    "document-validator": {
      title: "Validador de Documentos - Portal BSC",
      description:
        "Valida la autenticidad de tus documentos bancarios de forma segura y confiable.",
      keywords: [
        "validador",
        "documentos",
        "autenticidad",
        "verificación",
        "seguridad",
        "BSC",
        "validación",
      ],
      structuredType: "WebApplication",
      focusKeyword: "validador documentos BSC",
    },
    targets: {
      title: "Secciones - Portal BSC",
      description:
        "Explora nuestras secciones especializadas con información detallada sobre productos y servicios.",
      keywords: [
        "secciones",
        "información",
        "productos",
        "servicios",
        "BSC",
        "contenido",
      ],
      structuredType: "CollectionPage",
      focusKeyword: "secciones BSC",
    },
  };

  // Función para generar título con formato de migaja de pan
  const generateBreadcrumbTitle = (
    customTitle?: string,
    section?: string,
    category?: string,
    item?: string
  ) => {
    if (customTitle) return customTitle;

    const pathSegments = route.path.split("/").filter((segment) => segment);
    const currentSection = section || pathSegments[0] || "home";
    const sectionConfig =
      defaultSectionConfig[
        currentSection as keyof typeof defaultSectionConfig
      ] || defaultSectionConfig.home;

    let title = "Portal BSC";

    if (currentSection !== "home") {
      title += ` - ${sectionConfig.title.replace(" - Portal BSC", "")}`;
    }

    if (category) {
      title += ` - ${category}`;
    }

    if (item) {
      title += ` - ${item}`;
    }

    return title;
  };

  // Función para generar SEO robusto con fallbacks inteligentes
  const generateRobustSEO = (data: {
    section?: string;
    category?: string;
    item?: string;
    customAttributes?: SEOAttributes;
    target?: TargetInterface;
    post?: PostInterface;
    categoryData?: CategoriesInterface;
  }): RobustSEOData => {
    const pathSegments = route.path.split("/").filter((segment) => segment);
    const section = data.section || pathSegments[0] || "home";
    const sectionConfig =
      defaultSectionConfig[section as keyof typeof defaultSectionConfig] ||
      defaultSectionConfig.home;

    // Obtener atributos personalizados o usar los del objeto
    const attributes =
      data.customAttributes ||
      data.target ||
      data.post ||
      data.categoryData ||
      {};

    // Generar título con fallbacks
    const title =
      attributes.metaTitle ||
      generateBreadcrumbTitle(undefined, section, data.category, data.item) ||
      sectionConfig.title;

    // Generar descripción con fallbacks
    const description =
      attributes.metaDescription ||
      attributes.description ||
      attributes.excerpt ||
      sectionConfig.description;

    // Generar keywords con fallbacks
    const keywords =
      attributes.keywords ||
      attributes.tags ||
      [attributes.focusKeyword, sectionConfig.focusKeyword].filter(Boolean) ||
      sectionConfig.keywords;

    // Generar focus keyword
    const focusKeyword =
      attributes.focusKeyword ||
      sectionConfig.focusKeyword ||
      keywords[0] ||
      "BSC";

    // Generar imágenes con fallbacks
    const ogImage =
      attributes.ogImage ||
      attributes.banner ||
      attributes.responsive ||
      attributes.thumbnail ||
      "";

    const twitterImage = attributes.twitterImage || ogImage;

    // Generar URLs
    const canonicalUrl = attributes.canonicalUrl || `${baseUrl}${route.path}`;

    // Generar títulos sociales
    const socialTitle = attributes.socialTitle || title;
    const socialDescription = attributes.socialDescription || description;

    // Generar robots directives
    const robotsDirectives = attributes.robotsDirectives || "index, follow";

    // Generar language
    const language = attributes.language || "es";

    // Generar structured type
    const structuredType =
      attributes.structuredType || sectionConfig.structuredType;

    // Generar alt text
    const altText =
      attributes.altText ||
      `${title} - Banco de Santa Cruz` ||
      "Imagen del Banco de Santa Cruz";

    // Generar tags
    const tags = attributes.tags || keywords;

    // Generar schema markup
    const schemaMarkup =
      attributes.schemaMarkup ||
      generateSchemaMarkup({
        title,
        description,
        structuredType,
        canonicalUrl,
        section,
        target: data.target,
        post: data.post,
        category: data.categoryData,
      });

    return {
      title,
      description,
      keywords,
      canonicalUrl,
      ogImage,
      twitterImage,
      socialTitle,
      socialDescription,
      robotsDirectives,
      language,
      structuredType,
      schemaMarkup,
      tags,
      focusKeyword,
      altText,
      isFeatured: attributes.isFeatured || false,
    };
  };

  // Función para generar Schema.org estructurado
  const generateSchemaMarkup = (data: {
    title: string;
    description: string;
    structuredType: string;
    canonicalUrl: string;
    section: string;
    target?: TargetInterface;
    post?: PostInterface;
    category?: CategoriesInterface;
  }) => {
    const baseSchema = {
      "@context": "https://schema.org",
      "@type": data.structuredType,
      name: data.title,
      description: data.description,
      url: data.canonicalUrl,
      isPartOf: {
        "@type": "WebSite",
        name: "Portal BSC",
        url: baseUrl,
        publisher: {
          "@type": "Organization",
          name: "Banco de Santa Cruz",
          url: baseUrl,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/logo.png`,
          },
        },
      },
    };

    // Schema específico para posts
    if (data.post && data.structuredType === "Article") {
      return JSON.stringify({
        ...baseSchema,
        "@type": "Article",
        headline: data.title,
        image: data.post.banner || data.post.responsive || "",
        datePublished: data.post.createdAt || new Date().toISOString(),
        dateModified: data.post.updatedAt || new Date().toISOString(),
        author: {
          "@type": "Organization",
          name: "Banco de Santa Cruz",
        },
        publisher: {
          "@type": "Organization",
          name: "Banco de Santa Cruz",
          url: baseUrl,
          logo: {
            "@type": "ImageObject",
            url: `${baseUrl}/logo.png`,
          },
        },
      });
    }

    // Schema específico para targets
    if (data.target && data.structuredType === "CollectionPage") {
      return JSON.stringify({
        ...baseSchema,
        "@type": "CollectionPage",
        mainEntity: {
          "@type": "ItemList",
          name: data.target.name,
          description: data.target.description,
        },
      });
    }

    return JSON.stringify(baseSchema);
  };

  // Función para aplicar SEO robusto
  const applyRobustSEO = (data: {
    section?: string;
    category?: string;
    item?: string;
    customAttributes?: SEOAttributes;
    target?: TargetInterface;
    post?: PostInterface;
    categoryData?: CategoriesInterface;
  }) => {
    const seoData = generateRobustSEO(data);

    useHead({
      title: seoData.title,
      meta: [
        // Meta básicos
        { name: "description", content: seoData.description },
        { name: "keywords", content: seoData.keywords.join(", ") },
        { name: "robots", content: seoData.robotsDirectives },
        { name: "language", content: seoData.language },
        { name: "author", content: "Banco de Santa Cruz" },
        { name: "viewport", content: "width=device-width, initial-scale=1.0" },

        // Focus keyword
        { name: "focus-keyword", content: seoData.focusKeyword },

        // Open Graph
        { property: "og:title", content: seoData.socialTitle },
        { property: "og:description", content: seoData.socialDescription },
        { property: "og:image", content: seoData.ogImage },
        { property: "og:url", content: seoData.canonicalUrl },
        { property: "og:type", content: "website" },
        { property: "og:locale", content: "es_ES" },
        { property: "og:site_name", content: "Portal BSC" },

        // Twitter Card
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: seoData.socialTitle },
        { name: "twitter:description", content: seoData.socialDescription },
        { name: "twitter:image", content: seoData.twitterImage },
        { name: "twitter:site", content: "@BSC_Banco" },

        // Artículos
        ...seoData.tags.map((tag) => ({ name: "article:tag", content: tag })),

        // Featured
        ...(seoData.isFeatured ? [{ name: "featured", content: "true" }] : []),
      ],
      link: [
        { rel: "canonical", href: seoData.canonicalUrl },
        { rel: "alternate", hreflang: "es", href: seoData.canonicalUrl },
      ],
      script: [
        {
          type: "application/ld+json",
          innerHTML: seoData.schemaMarkup,
        },
      ],
    });
  };

  return {
    applyRobustSEO,
    generateRobustSEO,
    generateBreadcrumbTitle,
    generateSchemaMarkup,
  };
};
