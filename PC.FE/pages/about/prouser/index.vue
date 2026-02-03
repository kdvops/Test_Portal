<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: '/sobre-nosotros/proteccion-al-usuario'
})

import { Vue } from 'vue-facing-decorator'
import { useRobustSEO } from '~/composables/useRobustSEO'
// IMPORT COMPONENTS
import AppCarouselComponent from '~/components/carousel/index.vue';
import AppMenuComponent from '~/components/menu/index.vue';
import CardImage from '~/components/optimized-image/CardImage.vue';
import HeroImage from '~/components/optimized-image/HeroImage.vue';

// IMPORT INTERFACES
import type { SliderOptions } from '~/interfaces/slider.interface';
import type { CategoriesInterface } from '~/interfaces/categories.interface';

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from '~/graphql/slider.query';
import { GET_CATEGORIES_BY_TARGET } from '~/graphql/categories.query';

// Las imágenes ahora se cargan directamente desde las rutas públicas

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'prouser-home-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-carousel-component': AppCarouselComponent,
    'app-menu-component': AppMenuComponent,
    CardImage,
    HeroImage,
  }
})
export default class ProuserHomeScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  public bannerReport = '/assets/backgrounds/Banner-reclamaciones.jpg';
  public bannerChannel = '/assets/backgrounds/Banner-canales.jpg';
  public bannerDocument = '/assets/backgrounds/Banner-document.png';

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

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
    // APPLY SEO METADATA
    // this.applySEOMetadata();
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
          target: 'banner::prouser'
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
          target: 'category::prouser'
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
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row
    class="prouser-home-container"
    justify="center"
    align-content="center"
    no-gutters
  >
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <app-carousel-component :options="optionSliders" />
    </v-col>

    <v-col v-for="category in categories" class="mt-5" cols="11" md="9" lg="7">
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
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2 text-primary">
                {{ category.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ category.description }}
              </p>
              <v-btn
                width="140"
                :to="`/sobre-nosotros/proteccion-al-usuario/${category.slug}`"
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
              :src="category.pictures?.thumbnail ?? category.pictures.thumbnailImageDetail?.image"
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
              :src="category.pictures?.thumbnail ?? category.pictures.thumbnailImageDetail?.image"
              :alt="category.pictures.thumbnailImageDetail?.altText ?? ''"
              :width="600"
              :height="280"
              container-class="category-image-container"
              image-class="category-image"
            />
          </v-col>
          <v-col order="2" order-md="1" class="align-content-center" cols="12" md="12" lg="6">
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2 text-primary">
                {{ category.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ category.excerpt }}
              </p>
              <v-btn
                width="140"
                :to="`/sobre-nosotros/proteccion-al-usuario/${category.slug}`"
                color="green"
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

    <v-col cols="12" md="9" lg="7" style="position: relative; z-index: 0;">
      <div class="my-10 banner-document-wrapper" :style="{ borderRadius: $vuetify.display.mdAndDown ? '0' : '12px', overflow: 'hidden', position: 'relative' }">
        <HeroImage
          :src="bannerDocument"
          :alt="'Validación de documentos'"
          :width="1920"
          :height="200"
          loading="lazy"
          container-class="banner-document-container"
        />
        <!-- LAYER TEXT -->
        <div class="banner-overlay">
          <v-row class="h-100 pa-10 ma-0" align="center" justify="start" no-gutters>
            <v-col cols="12" md="6" lg="6" class="d-flex flex-column justify-center">
              <p class="text-title text-md-h6 font-weight-bold text-white mb-4">Validación de documentos emitidos <br> por el Banco Santa Cruz</p>
              <v-btn width="150" height="50" to="/document-validator" class="text-body-2" variant="elevated"
                rounded="xl" color="green">
                Valida Aquí
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-col>

    <v-col class="mt-10" cols="12" style="position: relative; z-index: 0;">
      <div style="position: relative; width: 100%; height: 500px; z-index: 0;">
        <HeroImage
          :src="bannerReport"
          :alt="'Banner de reclamaciones'"
          :width="1920"
          :height="500"
          loading="lazy"
          container-class="banner-report-container"
        />
        <div class="banner-overlay">
        <v-card :width="$vuetify.display.mdAndDown ? '90%' : '60%'" class="card-prouser-container mx-auto pa-8" rounded="xl" color="#01569ec7">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8" lg="7">
                <h1 class="text-title text-md-h6 text-white font-weight-bold">
                  ¿Necesitas hacer una reclamacion?
                </h1>
                <p class="text-white text-caption text-md-body-1 font-weight-thin mt-5">
                  De lunes a viernes de 8:00 AM a 10:00 PM <br>
                  Sábados de 8:00 AM a 8:00 PM <br>
                  Domingos y días feriados de 8:00 AM a 6:00 PM <br>
                  <span class="font-weight-bold"> Centros de Negocios BSC.</span>
                </p>
              </v-col>
              <v-col cols="12" md="5" lg="5" class="text-center mt-0 mt-md-5">
                <v-btn width="150" height="50" href="https://stgpwebsc.blob.core.windows.net/bsc-pweb-prod/sections/674787a43896f64580f5f1d4/6052907-1732741028399.pdf?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-01-12T02:04:48Z&st=2025-01-31T18:04:48Z&spr=https&sig=qCkGdfW9toWR6zKeR2RbqW67PigOvBjSWcz%2BcdGgPIY%3D" class="mt-15 text-body-2" variant="elevated"
                  rounded="xl" color="green">
                  Ver más
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        </div>
      </div>
    </v-col>

    <v-col cols="12" md="9" lg="7">
      <div class="my-10 banner-channel-wrapper" :style="{ borderRadius: $vuetify.display.mdAndDown ? '0' : '12px', overflow: 'hidden', position: 'relative' }">
        <HeroImage
          :src="bannerChannel"
          :alt="'Canales de consulta'"
          :width="1920"
          :height="200"
          loading="lazy"
          container-class="banner-channel-container"
        />
        <!-- LAYER TEXT -->
        <div class="banner-overlay">
          <v-row class="h-100 pa-10 ma-0" align="center" justify="start" no-gutters>
            <v-col cols="12" md="6" lg="6" class="d-flex flex-column justify-center">
              <p class="text-h5 font-weight-bold text-white mb-4">Canales de consulta y asesoramiento</p>
              <v-btn width="150" height="50" href="https://prousuario.gob.do/" class="text-body-2" variant="elevated"
                rounded="xl" color="green">
                Ver Aquí
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-col>

  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.prouser-home-container {
  background: #ffffff;

  .menu-categories {
    margin-top: -25px;
    position: relative;
    z-index: 10;
  }

  .card-prouser-container {
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

  .banner-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
  }

  .banner-document-container,
  .banner-report-container,
  .banner-channel-container {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
  }

  .banner-channel-wrapper,
  .banner-document-wrapper {
    height: 200px;

    @media (max-width: 960px) {
      height: 200px;
    }

    @media (max-width: 600px) {
      height: 180px;
    }
  }
}
</style>
