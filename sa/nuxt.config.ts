export default defineNuxtConfig({
  // SSR
  ssr: true,

  // AUTO IMPORT COMPONENTS OFF
  components: false,

  // CONFIG APP
  app: {
    pageTransition: {
      name: "fade",
      mode: "out-in",
    },
    head: {
      script: [
        {
          innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-PCNRW3LC');`,
          type: "text/javascript",
          tagPosition: "bodyClose", // Cargar al final para no bloquear
        },
      ],
    },
  },

  // OPTIMIZACIÓN DE RENDIMIENTO
  nitro: {
    // Compresión de assets
    compressPublicAssets: true,
    // Minificación de HTML
    minify: true,
    // Prerenderización optimizada
    prerender: {
      crawlLinks: false,
    },
    // Headers para mejorar cache y back/forward cache
    routeRules: {
      "/_nuxt/**": {
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
        },
      },
      "/**/*.{png,jpg,jpeg,gif,webp,avif,svg,ico,css,js,woff,woff2,ttf,eot,otf,mp4,webm,mp3,ogg,pdf}":
        {
          headers: {
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        },
      "/**": {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    },
  },

  // DEVTOOLS OFF
  devtools: {
    enabled: false,
  },

  // IMPORT MODULES
  modules: [
    "vuetify-nuxt-module",
    "nuxt3-class-component",
    "@nuxtjs/apollo",
    "nuxt-gtag",
    "@nuxt/test-utils/module",
    "@nuxt/image",
  ],

  // IMPORT PLUGINS
  plugins: [
    "~/plugins/mitt.ts",
    "~/plugins/moment.ts",
    "~/plugins/seo.ts",
    "~/plugins/consent-cookies.server.ts",
  ],

  // VUETIFY CONFIGURATION
  vuetify: {
    moduleOptions: {
      importComposables: true,
      // Tree-shaking de componentes Vuetify (reduce CSS de 944KB)
      // El módulo de Nuxt ya hace tree-shaking automático de componentes no usados
    },
    vuetifyOptions: {
      theme: {
        defaultTheme: "customTheme",
        themes: {
          customTheme: {
            colors: {
              primary: "#12499b",
            },
          },
        },
      },
    },
  },

  // GA4
  gtag: {
    id: "G-D9M5BS85JL",
  },

  // APOLLO CONFIG
  apollo: {
    clients: {
      default: "./apollo/default.ts",
    },
  },

  // TYPESCRIPT CONFIG GLOBAL
  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        useDefineForClassFields: false,
        types: ["vuetify"],
      },
    },
  },

  // VITE CONFIG GLOBAL
  vite: {
    esbuild: {
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          useDefineForClassFields: false,
        },
      },
      // Tree-shaking conservador (solo en producción)
      // Conservador para evitar problemas con decoradores
      ...(process.env.NODE_ENV === "production"
        ? {
            treeShaking: true,
          }
        : {}),
    },
    optimizeDeps: {
      include: ["vue-facing-decorator"],
    },
    build: {
      minify: false,
      sourcemap: true,
      cssMinify: process.env.NODE_ENV === "production",
    },
    css: {
      devSourcemap: false,
    },
  },

  build: {
    transpile: ["vuetify", "vuetify-nuxt-module"],
    analyze: false,
  },

  experimental: {
    scanPageMeta: false,
    sharedPrerenderData: true,
    templateRouteInjection: true,
    navigationRepaint: true,
    payloadExtraction: true,
  },

  compatibilityDate: "2024-07-12",

  //SEO
  runtimeConfig: {
    public: {
      siteName: "Banco Santa Cruz",
      siteUrl: "https://www.bsc.com.do",
      defaultDescription: "Descripción genérica del sitio.",
      defaultImage: "/logo.svg",
    },
  },

  // IMAGE OPTIMIZATION CONFIGURATION
  image: {
    quality: 80,
    format: ["webp", "avif", "jpg"],
    screens: {
      xs: 320,
      sm: 640,
      md: 768,
      lg: 1024,
      xl: 1280,
      xxl: 1536,
    },
    presets: {
      hero: {
        modifiers: {
          format: "webp,avif,jpg",
          quality: 85,
          fit: "cover",
          sizes: "100vw",
          densities: [1, 2],
        },
      },
      gallery: {
        modifiers: {
          format: "webp,avif,jpg",
          quality: 80,
          fit: "cover",
          sizes:
            "(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw",
          densities: [1, 2],
        },
      },
      thumbnail: {
        modifiers: {
          format: "webp,jpg",
          quality: 75,
          fit: "cover",
          sizes:
            "(max-width: 480px) 150px, (max-width: 768px) 200px, (max-width: 1200px) 250px, 300px",
        },
      },
      card: {
        modifiers: {
          format: "webp,jpg",
          quality: 78,
          fit: "cover",
          sizes:
            "(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw",
        },
      },
      icon: {
        modifiers: {
          format: "webp,png",
          quality: 90,
          fit: "contain",
          sizes: "(max-width: 768px) 32px, 64px",
        },
      },
    },
    domains: ["localhost", "127.0.0.1"],
    provider: "ipx",
    densities: [1, 2],
    loading: "lazy",
    ipx: {
      maxAge: 60 * 60 * 24 * 7, // 7 días
    },
  },
});
