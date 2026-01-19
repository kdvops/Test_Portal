<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit } from "vue-facing-decorator";

// IMPORT INTERFACES
import type {
  SliderInterface,
  SliderOptions,
} from "~/interfaces/slider.interface";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import HeroImage from "~/components/optimized-image/HeroImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "app-carousel-component",
  components: {
    HeroImage,
  },
})
export default class AppCarouselComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // BANNER PROPS
  @Prop({
    default: {
      show: false,
      sliders: [],
      position: 0,
    },
  })
  options!: SliderOptions;

  /////////////
  // METHODS //
  /////////////

  // GET SORTED SLIDERS BY POSITION
  public get sortedSliders() {
    if (!this.options.sliders || this.options.sliders.length === 0) {
      return [];
    }

    const sliders = [...this.options.sliders];

    return sliders.sort((a: SliderInterface, b: SliderInterface) => {
      const positionA = a.position !== undefined && a.position !== null ? Number(a.position) : Infinity;
      const positionB = b.position !== undefined && b.position !== null ? Number(b.position) : Infinity;
      
      return positionA - positionB;
    });
  }
  
  // GET JUSTIFY TEXT
  public getJustifyText(slider: SliderInterface) {
    return slider.title.align === "left" ||
      slider.subtitle.align === "left" ||
      slider.description.align === "left"
      ? "start"
      : slider.title.align === "center" ||
        slider.subtitle.align === "center" ||
        slider.description.align === "center"
      ? "center"
      : "end";
  }

  public get heightCarousel() {
    const breakpoints = {
      sm: "400px",
      md: "500px",
      lg: "600px",
      xl: "700px",
      default: "320px",
    };

    const { sm, md, lg, xl } = this.$vuetify.display;

    if (sm) return breakpoints.sm;
    if (md) return breakpoints.md;
    if (lg) return breakpoints.lg;
    if (xl) return breakpoints.xl;

    return breakpoints.default;
  }

  public get heightCarouselNumber() {
    const breakpoints = {
      sm: 400,
      md: 500,
      lg: 600,
      xl: 700,
      default: 320,
    };

    const { sm, md, lg, xl } = this.$vuetify.display;

    if (sm) return breakpoints.sm;
    if (md) return breakpoints.md;
    if (lg) return breakpoints.lg;
    if (xl) return breakpoints.xl;

    return breakpoints.default;
  }

  public validateOnRedirect(link: string) {
    if (!link || typeof link !== "string") {
      // Manejo de error: link inválido
      return;
    }

    // Expresión regular para detectar URLs externas
    const externalUrlPattern = /^https?:\/\//i;

    if (externalUrlPattern.test(link)) {
      window.open(link, "_blank");
    } else {
      this.$router.push(link);
    }
  }
}
</script>

<!-- HTML TEMPLATE -->
<template v-if="options.show">
  <v-carousel
    min-height="auto"
    :height="heightCarousel"
    mandatory="force"
    v-model="options.position"
    :show-arrows="sortedSliders.length > 1 ? 'hover' : false"
    interval="7000"
    hide-delimiters
    cycle
  >
    <!-- SET SLIDERS FOR API -->
    <template v-for="(slider, i) in sortedSliders" :key="slider._id">
      <v-carousel-item :value="i" eager>
        <div
          class="carousel-item-container"
          :style="{ height: heightCarousel, position: 'relative' }"
          @click="
            !slider.button.enabled && slider.button.link
              ? validateOnRedirect(slider.button.link)
              : null
          "
          :class="
            !slider.button.enabled && slider.button.link ? 'cursor-pointer' : ''
          "
        >
          <!-- HERO IMAGE -->
          <HeroImage
            :src="
              $vuetify.display.mdAndDown &&
              (slider.responsive || slider.responsiveImageDetail)
                ? slider.responsive ?? slider.responsiveImageDetail?.image
                : slider.picture ?? slider.pictureImageDetail?.image
            "
            :alt="
              slider.responsiveImageDetail?.altText ??
              slider.pictureImageDetail?.altText ??
              ''
            "
            :width="1920"
            :height="heightCarouselNumber"
            container-class="carousel-hero-image"
            image-class="carousel-hero-image-content"
            loading="eager"
          />

          <!-- OVERLAY TEXT -->
          <div
            class="carousel-overlay"
            style="
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
              z-index: 2;
              display: flex;
              align-items: center;
              justify-content: center;
            "
          >
            <v-container class="banner-container-image" fluid>
              <v-row
                class="banner-row-image"
                align-content="center"
                :justify="getJustifyText(slider)"
              >
                <v-col
                  :cols="$vuetify.display.mdAndDown ? 12 : 6"
                  :md="6"
                  :lg="6"
                  class="py-2"
                >
                  <p
                    v-if="slider.title.text"
                    :style="`color: ${slider.title.color}`"
                    :class="`${slider.title.size} text-${slider.title.align} font-weight-${slider.title.weight}`"
                  >
                    {{ slider.title.text }}
                  </p>
                </v-col>
                <v-col
                  :cols="$vuetify.display.mdAndDown ? 12 : 6"
                  :md="6"
                  :lg="6"
                  class="py-2"
                >
                  <p
                    v-if="slider.subtitle.text"
                    :style="`color: ${slider.subtitle.color}`"
                    :class="`${slider.subtitle.size} text-${slider.subtitle.align} font-weight-${slider.subtitle.weight}`"
                  >
                    {{ slider.subtitle.text }}
                  </p>
                </v-col>
                <v-col
                  :cols="$vuetify.display.mdAndDown ? 12 : 6"
                  :md="6"
                  :lg="6"
                  class="py-2"
                >
                  <p
                    v-if="slider.description.text"
                    :style="`color: ${slider.description.color}`"
                    :class="`${slider.description.size} text-${slider.description.align} font-weight-${slider.description.weight}`"
                  >
                    {{ slider.description.text }}
                  </p>
                </v-col>
                <v-col
                  v-if="slider.button.enabled"
                  cols="12"
                  :class="`text-${slider.button.align}`"
                  class="py-2"
                >
                  <v-btn
                    @click.stop="validateOnRedirect(slider.button.link)"
                    :color="slider.button.background"
                    variant="flat"
                    :size="$vuetify.display.mdAndDown ? 'small' : 'default'"
                    :style="`color: ${slider.button.color}!important`"
                    :class="`font-weight-${slider.button.weight}`"
                  >
                    {{ slider.button.text }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
          </div>
        </div>
      </v-carousel-item>
    </template>
  </v-carousel>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.carousel-item-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  /* Asegurar renderizado correcto en Safari */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* Prevenir distorsión en Safari */
  min-width: 0;
  min-height: 0;
}

.carousel-hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  /* Asegurar renderizado correcto en Safari */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  
  ::v-deep(.hero-image-container) {
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  ::v-deep(.hero-image) {
    width: 100% !important;
    height: 100% !important;
    /* Prefijos webkit para Safari antiguo */
    -webkit-object-fit: cover !important;
    -moz-object-fit: cover !important;
    -o-object-fit: cover !important;
    object-fit: cover !important;
    -webkit-object-position: center !important;
    -moz-object-position: center !important;
    -o-object-position: center !important;
    object-position: center !important;
    /* Forzar aceleración de hardware en Safari */
    -webkit-transform: translateZ(0) !important;
    transform: translateZ(0) !important;
    -webkit-backface-visibility: hidden !important;
    backface-visibility: hidden !important;
    /* Prevenir distorsión en Safari */
    max-width: 100% !important;
    max-height: 100% !important;
  }
}

.carousel-hero-image-content {
  width: 100%;
  height: 100%;
  /* Prefijos webkit para Safari antiguo */
  -webkit-object-fit: cover;
  -moz-object-fit: cover;
  -o-object-fit: cover;
  object-fit: cover;
  -webkit-object-position: center;
  -moz-object-position: center;
  -o-object-position: center;
  object-position: center;
  /* Forzar aceleración de hardware en Safari */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  /* Prevenir distorsión en Safari */
  max-width: 100%;
  max-height: 100%;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  /* Asegurar renderizado correcto en Safari */
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  /* Forzar aceleración de hardware en Safari */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}

/* Compatibilidad específica para Safari */
@supports (-webkit-appearance: none) {
  .carousel-item-container {
    /* Forzar repintado en Safari */
    -webkit-perspective: 1000px;
    perspective: 1000px;
  }
  
  .carousel-hero-image {
    -webkit-perspective: 1000px;
    perspective: 1000px;
    
    ::v-deep(.hero-image-container) {
      -webkit-perspective: 1000px;
      perspective: 1000px;
    }
    
    ::v-deep(.hero-image) {
      -webkit-perspective: 1000px;
      perspective: 1000px;
    }
  }
}

/* Fix específico para Safari iOS */
@supports (-webkit-touch-callout: none) {
  .carousel-item-container {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    /* Asegurar que el contenedor no se deforme */
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
  }
  
  .carousel-hero-image {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    
    ::v-deep(.hero-image-container) {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
    }
    
    ::v-deep(.hero-image) {
      -webkit-transform: translate3d(0, 0, 0);
      transform: translate3d(0, 0, 0);
      /* Asegurar que las imágenes no se estiren en Safari iOS */
      max-width: 100%;
      max-height: 100%;
      /* Forzar renderizado correcto */
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
  }
  
  .carousel-overlay {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
}
</style>
