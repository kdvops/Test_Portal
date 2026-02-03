import { defineNuxtConfig } from "nuxt/config";
// import authProviderLocal from "./providers/auth.provider";

export default defineNuxtConfig({
  // SSR
  ssr: true,

  // AUTO IMPORT COMPONENTS OFF
  components: false,

  // DEFINE DIR SRC
  srcDir: "./",

  // DEVTOOLS OFF
  devtools: {
    enabled: false,
  },

  // IMPORT MODULES
  modules: [
    "vuetify-nuxt-module",
    "nuxt3-class-component",
    "@nuxtjs/apollo",
    "@nuxt/test-utils/module",
  ],

  // IMPORT PLUGINS
  plugins: [
    "~/plugins/mitt.ts",
    "~/plugins/papa.client.ts",
    "~/plugins/moment.ts",
    "~/plugins/quill.client.ts",
    "~/plugins/draggable.client.ts",
    "~/plugins/vue3-grid-layout.client.ts",
  ],

  // VUETIFY CONFIGURATION
  vuetify: {
    moduleOptions: {
      importComposables: true,
      includeTransformAssetsUrls: true,
    },
    vuetifyOptions: {},
  },

  // APOLLO CONFIG
  apollo: {
    clients: {
      default: "./apollo/default.ts",
    },
  },

  // APOLLO CONFIG - Now handled manuallyT CONFIG GLOBAL
  typescript: {
    strict: false,
    typeCheck: false,
    tsConfig: {
      compilerOptions: {
        experimentalDecorators: true,
        skipLibCheck: true,
        types: ["vuetify", "@nuxt/types"],
      },
    },
  },

  nitro: {
    externals: {
      inline: ['rehackt']
    },
    routeRules: {
      '/graphql': {
        body: {
          maxSize: '300mb'
        }
      }
    }
  },

  // VITE CONFIG GLOBAL
  vite: {
    vue: {
      template: {
        transformAssetUrls: true,
      },
    },
    esbuild: {
      target: "esnext",
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
        },
      },
    },
  },

  // BUILD OPTIONS
  build: {
    transpile: ["vuetify", "vuetify-nuxt-module", "nuxt-auth-utils"],
  },

  experimental: {
    scanPageMeta: false,
    sharedPrerenderData: true,
    templateRouteInjection: true,
    navigationRepaint: true,
    renderJsonPayloads: false,
  },

  compatibilityDate: "2024-08-03",
});
