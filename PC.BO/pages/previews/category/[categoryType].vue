<!-- SCRIPT TEMPLATE -->
<script lang="ts">

import { Vue } from 'vue-facing-decorator'
// IMPORT COMPONENTS
import PreviewAppCarouselComponent from '~/components/previews/carousel/index.vue';

// IMPORT INTERFACES
import type { SliderOptions } from '~/interfaces/slider.interface';
import type { CategoriesInterface } from '~/interfaces/categories.interface';

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from '~/graphql/query/slider.query';
import { GET_CATEGORIES_BY_TARGET } from '~/graphql/query/categories.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-category-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'preview-app-carousel-component': PreviewAppCarouselComponent
  }
})
class PreviewCategoryScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET PARAM CATEGORY ID
  public categoryType = useRoute().params.categoryType;

  // SHORTCUTS
  public categories: Array<CategoriesInterface> = [];

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
    // GET SLIDERS
    this.getSliders()

    // GET SHORTCUTS BY TARGET
    this.getCategoriesByTarget()
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
          target: `banner::${this.categoryType}`
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
  public async getCategoriesByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: `category::${this.categoryType}`
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

  public imparIndex(_id: string) {
    const getCard = this.categories.filter((n, i) => i % 2 !== 0);
    const findCard = getCard.find(card => card._id === _id);
    return findCard ? true : false;
  }
}
export default PreviewCategoryScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="business-home-container" justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <preview-app-carousel-component :options="optionSliders" />
    </v-col>

    <v-col v-for="category in categories" class="mt-5" cols="11" md="9" lg="7">
      <v-card v-if="imparIndex(category._id!)" class="mx-2 my-2 pa-0"
        :height="$vuetify.display.mdAndDown ? 'auto' : 280" rounded="lg">
        <v-row no-gutters>
          <v-col order="2" order-md="2" class="align-content-center" cols="12" md="12" lg="6">
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2">
                {{ category.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ category.excerpt }}
              </p>
              <v-btn width="140" color="primary"
                class="mx-3 mt-3 text-caption text-uppercase" rounded="xl" style="">
                Mas Información
              </v-btn>
            </div>
          </v-col>
          <v-col order="1" order-md="1" cols="12" md="12" lg="6">
            <v-img width="100%" :height="$vuetify.display.mdAndDown ? 150 : 280" 
              :src="category.pictures.thumbnail?? category.pictures.thumbnailImageDetail?.image"
              :alt="category.pictures.thumbnailImageDetail?.altText?? ''"
              cover />
          </v-col>
        </v-row>
      </v-card>

      <v-card v-else class="mx-2 my-2" :height="$vuetify.display.mdAndDown ? 'auto' : 280" rounded="lg">
        <v-row no-gutters>
          <v-col order="1" order-md="2" cols="12" md="12" lg="6">
            <v-img width="100%" :height="$vuetify.display.mdAndDown ? 150 : 280" 
              :src="category.pictures.thumbnail?? category.pictures.thumbnailImageDetail?.image"
              :alt="category.pictures.thumbnailImageDetail?.altText?? ''"
              cover />
          </v-col>
          <v-col order="2" order-md="1" class="align-content-center" cols="12" md="12" lg="6">
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2">
                {{ category.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ category.excerpt }}
              </p>
              <v-btn width="140" color="primary"
                class="mx-3 mt-3 text-caption text-uppercase" rounded="xl" style="">
                Mas Información
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.business-home-container {
  background: #ffffff;

  .menu-categories {
    margin-top: -25px;
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
}
</style>