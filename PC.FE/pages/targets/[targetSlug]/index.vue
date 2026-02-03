<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/seccion/:targetSlug",
});

import { Vue } from "vue-facing-decorator";
import { useRobustSEO } from "~/composables/useRobustSEO";
// IMPORT COMPONENTS
import AppCarouselComponent from "~/components/carousel/index.vue";
import AppShortcutsComponent from "~/components/shortcuts/index.vue";
import AppSectionsComponent from "~/components/sections/index.vue";
import CardImage from "~/components/optimized-image/CardImage.vue";

// IMPORT INTERFACES
import type { SliderOptions } from "~/interfaces/slider.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { ShortcutInterface } from "~/interfaces/shortcuts.interface";
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET_ID } from "~/graphql/slider.query";
import { GET_CATEGORIES_BY_TARGET_ID } from "~/graphql/categories.query";
import { GET_SHORTCUTS_BY_TARGET_ID } from "~/graphql/shortcuts.query";
import { GET_TARGET_BY_SLUG } from "~/graphql/targets.query";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "target-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-carousel-component": AppCarouselComponent,
    "app-shortcuts-component": AppShortcutsComponent,
    "app-sections-component": AppSectionsComponent,
    CardImage,
  },
})
export default class TargetScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET PARAM TARGET SLUG
  public targetSlug = useRoute().params.targetSlug;

  // TARGET DATA
  public target: TargetInterface | null = null;

  // CATEGORIES
  public categories: Array<CategoriesInterface> = [];

  // SHORTCUTS
  public shortcuts: Array<ShortcutInterface> = [];

  // ACTIVE SHORTCUTS
  public activeShortcuts: string = "";

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: false,
    sliders: [],
    position: 0,
  };

  // LOADING STATE
  public loading: boolean = true;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public async mounted() {
    await this.getTargetData();
    await this.getSliders();
    await this.getCategoriesByTarget();
    await this.getShortcutsByTarget();
    this.getQueryParamsItsExist();
    
    // APPLY SEO METADATA AFTER INITIAL LOAD
    // this.applySEOMetadata();
    
    this.loading = false;
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET TARGET DATA BY SLUG
  public async getTargetData() {
    try {
      const targetSlug = this.targetSlug as string;

      // GET TARGET BY SLUG
      const { data } = await this.$apollo.query({
        query: GET_TARGET_BY_SLUG,
        variables: {
          slug: targetSlug,
        },
        fetchPolicy: "no-cache",
      });

      // GET TARGET
      const target = data.findTargetBySlug;

      // GET SECTIONS
      const sections = target.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : "",
        };
      });

      // SET TARGET
      this.target = { ...target, sections };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
      // Redirect to home on error
      this.$router.push("/");
    }
  }

  // APPLY SEO METADATA
  public applySEOMetadata() {
    if (this.target) {
      this.robustSEO.applyRobustSEO({
        section: 'targets',
        item: this.target.name,
        target: this.target
      });
    }
  }

  // GET SLIDERS BY TARGET ID
  public async getSliders() {
    if (!this.target?._id) return;

    try {
      const { data } = await this.$apollo.query({
        query: GET_SLIDERS_BY_TARGET_ID,
        variables: {
          targetId: this.target._id,
        },
        fetchPolicy: "no-cache",
      });

      // FILTER SLIDERS FOR TARGET
      this.optionSliders = {
        show: true,
        sliders: data.findSliderByTargetId,
        position: 0,
      };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GET SHORTCUTS BY TARGET ID
  public async getShortcutsByTarget() {
    if (!this.target?._id) return;

    try {
      const { data } = await this.$apollo.query({
        query: GET_SHORTCUTS_BY_TARGET_ID,
        variables: {
          targetId: this.target._id,
        },
        fetchPolicy: "no-cache",
      });

      // SET SHORTCUTS
      this.shortcuts = data.findShortcutsByTargetId;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GET CATEGORIES BY TARGET ID
  public async getCategoriesByTarget() {
    if (!this.target?._id) return;

    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET_ID,
        variables: {
          targetId: this.target._id,
        },
        fetchPolicy: "no-cache",
      });

      // SET CATEGORIES
      this.categories = data.findCategoriesByTargetId.filter(
        (category: CategoriesInterface) => category.disabled === false
      );
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public getQueryParamsItsExist() {
    const { name, item }: any = this.$route.query;
    if (name && item) {
      this.activeShortcuts = item;
    }
  }

  public imparIndex(_id: string) {
    const getCard = this.categories.filter((n, i) => i % 2 !== 0);
    const findCard = getCard.find((card) => card._id === _id);
    return findCard ? true : false;
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <div
    v-if="loading"
    class="d-flex justify-center align-center"
    style="height: 50vh"
  >
    <v-progress-circular
      indeterminate
      :color="target?.color || 'primary'"
      size="64"
    ></v-progress-circular>
  </div>

  <div
    v-else-if="!target"
    class="d-flex justify-center align-center"
    style="height: 50vh"
  >
    <v-card class="pa-8 text-center">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <h2 class="mt-4">Target no encontrado</h2>
      <p class="text-grey">
        El target que buscas no existe o ha sido eliminado.
      </p>
      <v-btn to="/" :color="target?.color || 'primary'" class="mt-4">Volver al inicio</v-btn>
    </v-card>
  </div>

  <v-row
    v-else
    class="target-home-container"
    justify="center"
    align-content="center"
    no-gutters
  >
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <app-carousel-component :options="optionSliders" />
    </v-col>

    <!-- MENU SHORTCUTS -->
    <template v-if="shortcuts.length > 0">
      <v-col cols="12" md="10" lg="9">
        <app-shortcuts-component
          :shortcuts="shortcuts"
          type="tabs"
          :tabSelected="activeShortcuts"
        />
      </v-col>
    </template>

    <!-- TARGET SECTIONS -->
    <template v-if="target.sections && target.sections.length > 0">
      <v-col cols="12">
        <app-sections-component :sections="target.sections" />
      </v-col>
    </template>

    <!-- CATEGORIES DEFAULT -->
    <template v-if="target.showCategories && categories.length > 0">
      <v-col
        v-for="category in categories"
        class="mt-5"
        cols="11"
        md="9"
        lg="7"
        :key="category._id"
      >
        <v-card
          v-if="imparIndex(category._id!)"
          class="mx-2 my-2 pa-0"
          :height="$vuetify.display.mdAndDown ? 'auto' : 280"
          rounded="lg"
        >
          <v-row no-gutters>
            <v-col
              order="2"
              order-md="2"
              class="align-content-center"
              cols="12"
              md="12"
              lg="6"
            >
              <div class="info-category-card-large-container">
                <p class="px-3 py-2 text-h5 font-weight-bold mt-2">
                  {{ category.name }}
                </p>
                <p class="px-3 pb-2 text-caption category-card-description">
                  {{ category.description }}
                </p>
                <v-btn
                  width="140"
                  :to="`/seccion/${targetSlug}/${category.slug}`"
                  :color="target?.color || 'primary'"
                  class="mx-3 mt-3 text-caption text-uppercase"
                  rounded="xl"
                  style=""
                >
                  Mas Información
                </v-btn>
              </div>
            </v-col>
            <v-col order="1" order-md="1" cols="12" md="12" lg="6">
              <CardImage
                :src="
                  category.pictures?.thumbnailImageDetail?.image ??
                  category.pictures?.thumbnail ??
                  ''
                "
                :alt="
                  category.pictures?.thumbnailImageDetail?.altText ??
                  category.name ??
                  'Imagen de categoría'
                "
                :width="600"
                :height="$vuetify.display.mdAndDown ? 150 : 280"
                container-class="category-image-container"
                image-class="category-image"
              />
            </v-col>
          </v-row>
        </v-card>

        <v-card
          v-else
          class="mx-2 my-2"
          :height="$vuetify.display.mdAndDown ? 'auto' : 280"
          rounded="lg"
        >
          <v-row no-gutters>
            <v-col order="1" order-md="2" cols="12" md="12" lg="6">
              <CardImage
                :src="
                  category.pictures?.thumbnailImageDetail?.image ??
                  category.pictures?.thumbnail ??
                  ''
                "
                :alt="
                  category.pictures?.thumbnailImageDetail?.altText ??
                  category.name ??
                  'Imagen de categoría'
                "
                :width="600"
                :height="280"
                container-class="category-image-container"
                image-class="category-image"
              />
            </v-col>
            <v-col
              order="2"
              order-md="1"
              class="align-content-center"
              cols="12"
              md="12"
              lg="6"
            >
              <div class="info-category-card-large-container">
                <p class="px-3 py-2 text-h5 font-weight-bold mt-2">
                  {{ category.name }}
                </p>
                <p class="px-3 pb-2 text-caption category-card-description">
                  {{ category.excerpt }}
                </p>
                <v-btn
                  width="140"
                  :to="`/seccion/${targetSlug}/${category.slug}`"
                  :color="target?.color || 'primary'"
                  class="mx-3 mt-3 text-caption text-uppercase"
                  rounded="xl"
                  style=""
                >
                  Mas Información
                </v-btn>
              </div>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </template>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.target-home-container {
  background: #ffffff;

  .menu-categories {
    margin-top: -25px;
    position: relative;
    z-index: 10;
  }

  .card-promotions-container {
    overflow: inherit !important;

    .icon-large-card {
      top: -80px;
      right: -40px;
      position: absolute;

      &.circle {
        top: -60px;
        right: -50px;
      }
    }
  }

  .info-category-card-large-container {
    width: 100%;
    bottom: 0;
    padding: 10px;
    display: flex;
    flex-direction: column;
    align-content: center;

    .category-card-description {
      color: #000000;
      max-height: 120px;
      overflow: hidden;
    }
  }

  .category-image-container {
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }

  .category-image {
    border-radius: inherit;
  }

  // Estilos para las tarjetas de secciones
  /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
  ::v-deep(.section-card) {
    min-height: 230px !important;
    display: flex !important;
    flex-direction: column !important;
  }

  /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
  ::v-deep(.section-card-content) {
    min-height: 100% !important;
    flex: 1 !important;
  }

  // Min-height para las imágenes del banner
  /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
  ::v-deep(.banner-hero-image),
  /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
  ::v-deep(.banner-small-hero-image) {
    min-height: 200px !important;
  }
}
</style>
