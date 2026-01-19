<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: '/beneficios'
})

import { Vue } from 'vue-facing-decorator'
import { useRobustSEO } from '~/composables/useRobustSEO'
// IMPORT COMPONENTS
import AppCarouselComponent from '~/components/carousel/index.vue';
import AppMenuComponent from '~/components/menu/index.vue';

// IMPORT OPTIMIZED IMAGE COMPONENTS
import HeroImage from '~/components/optimized-image/HeroImage.vue';
import CardImage from '~/components/optimized-image/CardImage.vue';
import IconImage from '~/components/optimized-image/IconImage.vue';

// IMPORT INTERFACES
import type { SliderOptions } from '~/interfaces/slider.interface';
import type { CategoriesInterface } from '~/interfaces/categories.interface';
import type { OptionsMenuInterface } from '~/interfaces/menu.interface';

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from '~/graphql/slider.query';
import { GET_CATEGORIES_BY_TARGET } from '~/graphql/categories.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'profits-home-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-carousel-component': AppCarouselComponent,
    'app-menu-component': AppMenuComponent,
    // OPTIMIZED IMAGE COMPONENTS
    HeroImage,
    CardImage,
    IconImage,
  }
})
export default class ProfitsHomeScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  public bannerPromotion = '/assets/backgrounds/Banner-promociones.jpg';
  public bannerPoints = '/assets/backgrounds/Banner-Puntos.jpg';

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // CATEGORIES
  public categories: Array<CategoriesInterface> = [];

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: false,
    sliders: [],
    position: 0,
  };

  // MENU OPTIONS
  public menuOptions: OptionsMenuInterface = {
    route: "",
    current: "",
    default: {
      name: "",
      icon: "mdi-card",
      to: "",
    },
    items: [],
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // APPLY SEO METADATA
    // this.applySEOMetadata();
    // GET SLIDERS
    this.getSliders();

    // GET CATEGORIES BY TARGET
    this.getCategoriesByTarget();
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
          target: "banner::profits",
        },
        fetchPolicy: "no-cache",
      });

      // FILTER SLIDERS FOR HOME
      this.optionSliders = {
        show: true,
        sliders: data.findSliderByTarget,
        position: 0,
      };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GET CATEGORIES BY TARGET
  public async getCategoriesByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: "category::profits",
        },
        fetchPolicy: "no-cache",
      });

      // SET PROFITS
      this.categories = data.findCategoryByTarget.filter(
        (category: CategoriesInterface) => category.disabled === false
      );

      // SET MENU OPTIONS
      this.setMenuOptions();
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET MENU OPTIONS
  public setMenuOptions() {
    this.menuOptions = {
      route: "/beneficios/categoria/",
      current: "",
      default: {
        name: "Beneficios Santa Cruz",
        icon: "mdi-home",
        to: "/beneficios",
      },
      items: this.categories,
    };
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
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <app-carousel-component :options="optionSliders" />
    </v-col>

    <!-- MENU COMPONENT -->
    <v-col class="menu-categories py-0" cols="12">
      <app-menu-component :options="menuOptions" />
    </v-col>

    <v-col cols="12">
      <h5 class="text-center mt-15 px-5 text-primary d-block d-md-none">
        Disfruta de los beneficios que te brindas tus
        Tarjetas de Crédito y Débito de Banco Santa Cruz
        al
        pagar con
        tus tarjetas en estos comercios
      </h5>
      <h3 class="text-center mt-15 text-primary d-none d-md-block">
        Disfruta de los beneficios que te brindas tus
        <br> Tarjetas de Crédito y Débito de Banco Santa Cruz
        <br> al
        pagar con
        tus tarjetas en estos comercios
      </h3>
    </v-col>
    <v-col class="text-center" cols="12">
      <v-divider class="my-5 mx-auto border-opacity-100" thickness="5" color="green" length="60" />
    </v-col>
    <v-col class="mt-10" cols="11" md="10" lg="7">
      <v-row justify="center">
        <v-col cols="10" md="4" lg="3" v-for="category in categories">
          <v-hover :key="category._id">
            <template v-slot:default="{ isHovering, props }">
              <v-card width="180" height="270" :to="`/beneficios/categoria/${category.slug}`" class="pa-0 mx-auto"
                v-on="props" flat>
                <CardImage
                  :src="
                    category.pictures.thumbnail ??
                    category.pictures.thumbnailImageDetail?.image
                  "
                  :alt="category.pictures.thumbnailImageDetail?.altText ?? ''"
                  :width="180"
                  :height="270"
                />
              </v-card>
            </template>
          </v-hover>
        </v-col>
      </v-row>
    </v-col>
    <v-col class="mt-10" cols="12">
      <div class="banner-promotion-wrapper">
        <HeroImage
          :src="bannerPromotion"
          alt="Banner de promociones Banco Santa Cruz"
          :width="1920"
          :height="500"
          loading="lazy"
          :container-class="'banner-promotion-bg'"
        />
        <!-- Elemento decorativo izquierda -->
        <div class="banner-decorative-left promotion-symbol">£</div>
        <!-- Elemento decorativo derecha -->
        <IconImage
          src="/assets/icons/shopping-bag.svg"
          alt="Icono de compras"
          :width="200"
          :height="200"
          class="banner-decorative-right promotion-icon"
        />
        <!-- Contenido del banner -->
        <div class="banner-content-wrapper">
          <v-card :width="$vuetify.display.mdAndDown ? '90%' : '60%'" class="card-promotions-container mx-auto pa-8"
            rounded="xl" color="#0961ad">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <h1 class="text-white font-weight-bold text-h4">
                  Promociones
                </h1>
                <IconImage
                  src="/assets/icons/shopping-bag.svg"
                  alt="Icono de compras"
                  :width="32"
                  :height="32"
                  class="ml-4"
                />
              </div>
              <p class="text-white text-body-2 font-weight-regular mb-6">
                Ahorro en tu experiencias de compras al pagar con tus <strong>Tarjetas de Crédito del Banco Santa Cruz.</strong>
              </p>
              <div class="d-flex justify-start">
                <v-btn
                  width="200"
                  height="45"
                  to="/promociones"
                  class="text-body-2"
                  variant="elevated"
                  rounded="xl"
                  color="green"
                >
                  Nuestras Promociones
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-col>
    <v-col class="mt-10" cols="12">
      <div class="banner-points-wrapper">
        <HeroImage
          :src="bannerPoints"
          alt="Banner de Puntos Santa Cruz"
          :width="1920"
          :height="500"
          loading="lazy"
          :container-class="'banner-points-bg'"
        />
        <!-- Elemento decorativo izquierda -->
        <div class="banner-decorative-left points-circle"></div>
        <!-- Elemento decorativo derecha inferior -->
        <div class="banner-decorative-bottom-right accessibility-icon">
          <v-icon size="40" color="white">mdi-human-handsup</v-icon>
        </div>
        <!-- Contenido del banner -->
        <div class="banner-content-wrapper">
          <v-card :width="$vuetify.display.mdAndDown ? '90%' : '60%'" class="card-points-container mx-auto pa-8"
            rounded="xl" color="rgba(255, 255, 255, 0.9)">
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <h1 class="text-primary font-weight-bold text-h4">
                  Puntos Santa Cruz
                </h1>
                <IconImage
                  src="/assets/icons/puntos-bsc.svg"
                  alt="Icono Puntos BSC"
                  :width="36"
                  :height="36"
                  class="ml-4"
                />
              </div>
              <p class="text-primary text-body-2 font-weight-regular mb-6">
                Tu satisfacción es lo más importante para nosotros, por eso hemos creado para ti nuestro programa de recompensa Puntos Santa Cruz, a través del cual acumulas puntos por cada consumo que realices con tus <strong>Tarjetas de Crédito VISA.</strong>
              </p>
              <div class="d-flex justify-start">
                <v-btn
                  width="200"
                  height="45"
                  to="/productos/puntos"
                  class="text-body-2"
                  variant="elevated"
                  rounded="xl"
                  color="primary"
                >
                  Nuestro Programa
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.menu-categories {
  margin-top: -25px;
  position: relative;
  z-index: 10;
}

// Banner de Promociones
.banner-promotion-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;

  .banner-promotion-bg {
    width: 100%;
    height: 100%;
    
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.hero-image),
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.blur-image) {
      filter: blur(2px);
      transform: scale(1.1);
    }
  }

  .banner-decorative-left {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;

    &.promotion-symbol {
      font-size: 300px;
      font-weight: 300;
      color: rgba(255, 255, 255, 0.15);
      line-height: 1;
      transform: translateX(-20%);
    }
  }

  .banner-decorative-right {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.3;

    &.promotion-icon {
      transform: translate(20%, -20%);
    }
  }

  .banner-content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .card-promotions-container {
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
}

// Banner de Puntos
.banner-points-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;

  .banner-points-bg {
    width: 100%;
    height: 100%;
    
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.hero-image),
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.blur-image) {
      filter: blur(2px);
      transform: scale(1.1);
    }
  }

  .banner-decorative-left {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;

    &.points-circle {
      width: 300px;
      height: 300px;
      background-color: #4caf50;
      border-radius: 50%;
      transform: translate(-30%, -30%);
    }
  }

  .banner-decorative-bottom-right {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1;
    pointer-events: none;

    &.accessibility-icon {
      width: 60px;
      height: 60px;
      background-color: rgba(18, 73, 155, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .banner-content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .card-points-container {
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
}

// Responsive
@media (max-width: 960px) {
  .banner-promotion-wrapper,
  .banner-points-wrapper {
    height: 400px;
  }

  .banner-decorative-left.promotion-symbol {
    font-size: 200px;
  }

  .banner-decorative-left.points-circle {
    width: 200px;
    height: 200px;
  }

  .banner-decorative-right.promotion-icon {
    width: 150px !important;
    height: 150px !important;
  }
}
</style>
