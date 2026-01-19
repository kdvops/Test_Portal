<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop } from "vue-facing-decorator";

// IMPORT COMPONENTS
import AppHeaderComponent from "~/components/header/index.vue";
import AppFooterComponent from "~/components/footer/index.vue";
import AppShortcutsComponent from "~/components/shortcuts/index.vue";

// IMPORT INTERFACES
import type { HeaderOptions } from "~/interfaces/header.interface";
import type { ShortcutInterface } from "~/interfaces/shortcuts.interface";

// IMPORT GRAPHQL QUERY
import { GET_CATEGORIES_BY_TARGET } from "~/graphql/categories.query";
import { GET_ALL_TARGETS } from "~/graphql/targets.query";
import { GET_SHORTCUTS_BY_TARGET } from "~/graphql/shortcuts.query";
import type { TargetInterface } from "~/interfaces/targets.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "error-page",
  components: {
    "app-header-component": AppHeaderComponent,
    "app-footer-component": AppFooterComponent,
    "app-shortcuts-component": AppShortcutsComponent,
  },
})
export default class ErrorPage extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // ERROR PROP - Nuxt 3 pasa el error como prop automáticamente
  @Prop({ default: null })
  public error!: any;

  // HEADER OPTIONS
  public headerOptions: HeaderOptions = {
    show: true,
    absolute: false,
    notifications: [],
    seasons: [],
    products: {
      cards: [],
      deposits: [],
      accounts: [],
      loans: [],
      global: [],
    },
    about: [],
    targets: [],
  };

  // SHORTCUTS
  public shortcuts: Array<ShortcutInterface> = [];

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public async mounted() {
    // SET SEO METADATA FOR 404
    if (this.is404) {
      useHead({
        title: "404 - Página no encontrada | Banco Santa Cruz",
        meta: [
          {
            name: "description",
            content:
              "La página que intentas solicitar no está disponible en estos momentos.",
          },
          {
            name: "robots",
            content: "noindex, nofollow",
          },
        ],
      });
    }

    // LOAD HEADER DATA
    await this.loadHeaderData();

    // LOAD SHORTCUTS FOR 404 PAGE
    if (this.is404) {
      await this.getShortcutsByTarget();
    }
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // LOAD HEADER DATA
  public async loadHeaderData() {
    try {
      // GET ALL TARGETS
      const { data: targetsData } = await this.$apollo.query({
        query: GET_ALL_TARGETS,
        fetchPolicy: "cache-first",
      });

      const targets: Array<TargetInterface> = targetsData.findAllTargets;

      // GET PRODUCTS CATEGORIES
      const productsTarget = targets.find(
        (target: TargetInterface) => target.slug === "productos"
      );

      if (productsTarget) {
        const { data: productsData } = await this.$apollo.query({
          query: GET_CATEGORIES_BY_TARGET,
          variables: {
            targetKey: "productos",
          },
          fetchPolicy: "cache-first",
        });

        const categories: Array<CategoriesInterface> =
          productsData.findCategoriesByTarget;

        // ORGANIZE CATEGORIES BY TYPE
        const cards = categories.filter((cat) =>
          cat.slug?.includes("tarjetas")
        );
        const deposits = categories.filter((cat) =>
          cat.slug?.includes("depositos")
        );
        const accounts = categories.filter((cat) =>
          cat.slug?.includes("cuentas")
        );
        const loans = categories.filter((cat) =>
          cat.slug?.includes("prestamos")
        );

        this.headerOptions.products = {
          cards,
          deposits,
          accounts,
          loans,
          global: categories,
        };
      }

      // GET ABOUT CATEGORIES
      const aboutTarget = targets.find(
        (target: TargetInterface) => target.slug === "sobre-nosotros"
      );

      if (aboutTarget) {
        const { data: aboutData } = await this.$apollo.query({
          query: GET_CATEGORIES_BY_TARGET,
          variables: {
            targetKey: "sobre-nosotros",
          },
          fetchPolicy: "cache-first",
        });

        this.headerOptions.about = aboutData.findCategoriesByTarget;
      }
    } catch (err) {
      // SILENT FAIL - USE DEFAULT OPTIONS
      console.warn("Error loading header data:", err);
    }
  }

  // GET SHORTCUTS BY TARGET
  public async getShortcutsByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SHORTCUTS_BY_TARGET,
        variables: {
          target: "target::home",
        },
        fetchPolicy: "cache-first",
      });

      // SET SHORTCUTS
      this.shortcuts = data.findShortcutsByTarget;
    } catch (err) {
      // SILENT FAIL - USE EMPTY ARRAY
      console.warn("Error loading shortcuts:", err);
      this.shortcuts = [];
    }
  }

  // HANDLE ERROR CLEAR
  public handleError() {
    this.error = null;
    this.$router.push("/");
  }

  ///////////////
  // COMPUTED //
  ///////////////

  // CHECK IF 404 ERROR
  public get is404(): boolean {
    return this.error?.statusCode === 404 || this.error?.status === 404;
  }

  // GET ERROR MESSAGE
  public get errorMessage(): string {
    if (this.is404) {
      return "LA PÁGINA QUE INTENTAS SOLICITAR no está disponible en estos momentos";
    }
    return this.error?.message || "Ha ocurrido un error inesperado";
  }

  // GET ERROR TITLE
  public get errorTitle(): string {
    if (this.is404) {
      return "404";
    }
    return this.error?.statusCode?.toString() || "500";
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-app>
    <v-layout class="error-layout">
      <!-- HEADER -->
      <app-header-component :options="headerOptions" />

      <!-- MAIN CONTENT -->
      <v-main class="error-main">
        <!-- 404 ERROR SECTION -->
        <div v-if="is404" class="error-404-section">
          <!-- HERO SECTION WITH BACKGROUND IMAGE -->
          <div class="error-hero-container">
            <!-- BACKGROUND IMAGE -->
            <div class="error-hero-background">
              <img
                src="/assets/backgrounds/banner-404.png"
                alt="Background 404"
                class="error-hero-image"
                loading="eager"
                fetchpriority="high"
              />
            </div>
            <!-- OVERLAY -->
            <div class="error-hero-overlay"></div>
            <!-- TEXT CONTENT -->
            <div class="error-hero-content">
              <div class="error-hero-text">
                <h1 class="error-code">{{ errorTitle }}</h1>
                <h2 class="error-message-line-1">LA PÁGINA QUE</h2>
                <h2 class="error-message-line-2">INTENTAS SOLICITAR</h2>
                <h3 class="error-message-line-3">
                  no está disponible en estos
                </h3>
                <h3 class="error-message-line-4">momentos</h3>
              </div>
            </div>
          </div>

          <!-- SHORTCUTS SECTION -->
          <v-container v-if="shortcuts.length > 0" class="shortcuts-container">
            <h2 class="shortcuts-title">Intenta en los siguientes enlaces</h2>
            <v-row justify="center">
              <v-col cols="12" md="12" lg="12">
                <app-shortcuts-component :shortcuts="shortcuts" type="tabs" />
              </v-col>
            </v-row>
          </v-container>
        </div>

        <!-- OTHER ERRORS (500, etc.) -->
        <div v-else class="error-other-section">
          <v-container class="text-center py-16">
            <v-icon size="120" color="error" class="mb-4"
              >mdi-alert-circle</v-icon
            >
            <h1 class="text-h2 mb-4">{{ errorTitle }}</h1>
            <p class="text-h6 mb-8 text-grey-darken-1">
              {{ errorMessage }}
            </p>
            <v-btn
              color="primary"
              size="large"
              rounded="xl"
              @click="handleError"
            >
              Volver al inicio
            </v-btn>
          </v-container>
        </div>
      </v-main>

      <!-- FOOTER -->
      <app-footer-component />
    </v-layout>
  </v-app>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
::v-deep(.v-application) {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

::v-deep(.v-application__wrap) {
  width: 100%;
  max-width: 100%;
}

.error-layout {
  width: 100%;
  max-width: 100%;
  min-height: 100vh;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

.error-main {
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
  padding: 0 !important;
  margin: 0;
  overflow-x: hidden;
}

// 404 ERROR SECTION
.error-404-section {
  width: 100%;
  max-width: 100%;
  overflow-x: hidden;
}

// HERO SECTION
.error-hero-container {
  position: relative;
  width: 100%;
  max-width: 100%;
  min-height: 600px;
  display: flex;
  align-items: center;
  overflow: hidden;
  margin: 0;
  padding: 0;

  @media (max-width: 960px) {
    min-height: 500px;
  }
}

.error-hero-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  margin: 0;
  padding: 0;
}

.error-hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  z-index: 1;
}

.error-hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to right,
    rgba(18, 73, 155, 0.85) 0%,
    rgba(18, 73, 155, 0.6) 40%,
    rgba(18, 73, 155, 0.3) 60%,
    transparent 100%
  );
  z-index: 2;

  @media (max-width: 960px) {
    background: linear-gradient(
      to bottom,
      rgba(18, 73, 155, 0.85) 0%,
      rgba(18, 73, 155, 0.6) 50%,
      transparent 100%
    );
  }
}

.error-hero-content {
  position: relative;
  z-index: 3;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px;
  box-sizing: border-box;

  @media (max-width: 960px) {
    padding: 40px 16px;
    text-align: center;
  }
}

.error-hero-text {
  max-width: 600px;

  @media (max-width: 960px) {
    max-width: 100%;
  }
}

.error-code {
  font-size: 120px;
  font-weight: 900;
  color: #ffffff;
  line-height: 1;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 960px) {
    font-size: 80px;
  }

  @media (max-width: 600px) {
    font-size: 60px;
  }
}

.error-message-line-1,
.error-message-line-2 {
  font-size: 48px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 960px) {
    font-size: 32px;
  }

  @media (max-width: 600px) {
    font-size: 24px;
  }
}

.error-message-line-3,
.error-message-line-4 {
  font-size: 36px;
  font-weight: 600;
  color: #ffffff;
  line-height: 1.2;
  margin-bottom: 8px;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);

  @media (max-width: 960px) {
    font-size: 24px;
  }

  @media (max-width: 600px) {
    font-size: 20px;
  }
}

// SHORTCUTS SECTION
.shortcuts-container {
  padding: 80px 24px;

  @media (max-width: 960px) {
    padding: 40px 16px;
  }
}

.shortcuts-title {
  font-size: 32px;
  font-weight: 700;
  color: #12499b;
  text-align: center;
  margin-bottom: 48px;

  @media (max-width: 960px) {
    font-size: 24px;
    margin-bottom: 32px;
  }
}

// OTHER ERRORS SECTION
.error-other-section {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
