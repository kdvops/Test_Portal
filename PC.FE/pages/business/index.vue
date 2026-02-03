<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: '/negocio'
})

import { Vue } from 'vue-facing-decorator'
import { useRobustSEO } from '~/composables/useRobustSEO'
// IMPORT COMPONENTS
import AppCarouselComponent from '~/components/carousel/index.vue';
import AppMenuComponent from '~/components/menu/index.vue';
import AppShortcutsComponent from '~/components/shortcuts/index.vue';
import CardImage from '~/components/optimized-image/CardImage.vue';

// IMPORT INTERFACES
import type { SliderOptions } from '~/interfaces/slider.interface';
import type { CategoriesInterface } from '~/interfaces/categories.interface';
import type { ShortcutInterface } from '~/interfaces/shortcuts.interface';

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from '~/graphql/slider.query';
import { GET_CATEGORIES_BY_TARGET } from '~/graphql/categories.query';
import { GET_SHORTCUTS_BY_TARGET } from '~/graphql/shortcuts.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'business-home-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-carousel-component': AppCarouselComponent,
    'app-menu-component': AppMenuComponent,
    'app-shortcuts-component': AppShortcutsComponent,
    CardImage,
  }
})
export default class BusinessHomeScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // SHORTCUTS
  public categories: Array<CategoriesInterface> = [];

  // SHORTCUTS
  public shortcuts: Array<ShortcutInterface> = [];

  // ACTIVE SHORTCUTS
  public activeShortcuts: string = '';

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: false,
    sliders: [],
    position: 0
  }

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // APPLY SEO METADATA
    // // this.applySEOMetadata();
  
    // GET SLIDERS
    this.getSliders()

    // GET CATEGORIES BY TARGET
    this.getCategoriesByTarget()

    // GET SHORTCUTS BY TARGET
    this.getShortcutsByTarget()

    // GET QUERY PARAMS
    this.getQueryParamsItsExist();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET SLIDERS
  public async getSliders() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SLIDERS_BY_TARGET,
        variables: {
          target: 'banner::business'
        },
        fetchPolicy: 'no-cache'
      })

      // FILTER SLIDERS FOR HOME
      this.optionSliders = {
        show: true,
        sliders: data.findSliderByTarget,
        position: 0
      }

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // GET SHORTCUTS BY TARGET
  public async getShortcutsByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SHORTCUTS_BY_TARGET,
        variables: {
          target: 'target::business'
        },
        fetchPolicy: 'no-cache'
      })

      // SET SHORTCUTS
      this.shortcuts = data.findShortcutsByTarget;

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // GET SHORTCUTS BY TARGET
  public async getCategoriesByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: 'category::business'
        },
        fetchPolicy: 'no-cache'
      })

      // SET CATEGORIES
      this.categories = data.findCategoryByTarget.filter((category: CategoriesInterface) => category.disabled === false);

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  public getQueryParamsItsExist () {
    const {name, item}: any = this.$route.query
    if (name && item) {
      this.activeShortcuts = item;
    }
  }

  public imparIndex(_id: string) {
    const getCard = this.categories.filter((n, i) => i % 2 !== 0);
    const findCard = getCard.find(card => card._id === _id);
    return findCard ? true : false;
  }

  // APPLY SEO METADATA
  public applySEOMetadata() {
    const seoData = this.robustSEO.applyRobustSEO();
    this.pageSEO.applySEO();
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row
    class="business-home-container"
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

    <!-- CATEGORIES DEFAULT -->
    <template v-else>
      <v-col
        v-for="category in categories"
        class="mt-5"
        cols="11"
        md="9"
        lg="7"
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
                  {{ category.excerpt }}
                </p>
                <v-btn
                  width="140"
                  :to="`/negocio/${category.slug}`"
                  color="primary"
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
                  category.pictures.thumbnail ??
                  category.pictures.thumbnailImageDetail?.image
                "
                :alt="category.pictures.thumbnailImageDetail?.altText ?? ''"
                :width="600"
                :height="$vuetify.display.mdAndDown ? 150 : 280"
                container-class="category-image-container"
                image-class="category-image"
              />
            </v-col>
          </v-row>
        </v-card>

        <v-card v-else class="mx-2 my-2" :height="$vuetify.display.mdAndDown ? 'auto' : 280" rounded="lg">
          <v-row no-gutters>
            <v-col order="1" order-md="2" cols="12" md="12" lg="6">
              <CardImage
                :src="
                  category.pictures.thumbnail ??
                  category.pictures.thumbnailImageDetail?.image
                "
                :alt="category.pictures.thumbnailImageDetail?.altText ?? ''"
                :width="600"
                :height="$vuetify.display.mdAndDown ? 150 : 280"
                container-class="category-image-container"
                image-class="category-image"
              />
            </v-col>
            <v-col order="2" order-md="1" class="align-content-center" cols="12" md="12" lg="6">
              <div class="info-category-card-large-container">
                <p class="px-3 py-2 text-h5 font-weight-bold mt-2">
                  {{ category.name }}
                </p>
                <p class="px-3 pb-2 text-caption category-card-description">
                  {{ category.excerpt }}
                </p>
                <v-btn
                  width="140"
                  :to="`/negocio/${category.slug}`"
                  color="primary"
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
.business-home-container {
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
      width: 100%;
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
}
</style>
