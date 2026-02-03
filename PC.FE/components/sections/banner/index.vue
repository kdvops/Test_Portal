<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Prop, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import HeroImage from "~/components/optimized-image/HeroImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "section-banner-component",
  components: {
    HeroImage,
  },
})
export default class SectionBannerComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // PROPS CARDS SECTION
  @Prop({
    default: {
      name: "",
      description: "",
      color: "",
      position: 0,
      style: "bannerLarge",
      type: "sectionBanner",
      banner: {
        newUploadPictureItem: [],
        title: {
          text: "",
          color: "",
        },
        description: {
          text: "",
          color: "",
        },
        background: "",
        button: {
          enabled: false,
          text: "",
          color: "",
          link: "",
        },
      },
    },
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

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
<template>
  <v-row class="ma-0 pa-0" no-gutters>
    <v-col class="ma-0 pa-0" cols="12">
      <template v-if="section.style === 'bannerLarge'">
        <div class="banner-container" style="position: relative; width: 100%; height: 500px;">
          <HeroImage 
            :src="section.banner.picture?? section.banner.pictureImageDetail?.image" 
            :alt="section.banner.pictureImageDetail?.altText?? ''" 
            :width="1920" 
            :height="500"
            container-class="banner-hero-image"
          />
          <div class="banner-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; display: flex; align-items: center; justify-content: center;">
            <v-row class="h-100 w-100" justify="center" align-content="center" no-gutters>
              <v-col cols="12" md="10" lg="8" class="d-flex justify-center align-center">
                <v-card width="100%" height="200" rounded="xl"
                  :color="section.banner.background ? section.banner.background : '#12539b'">
                  <v-row class="h-100 pa-10 ma-0" justify="center" align-content="center" no-gutters>
                    <v-col cols="12" md="8" lg="8" class="d-flex flex-column justify-center text-left pl-6">
                      <p class="text-h5 font-weight-bold"
                        :style="`color: ${section.banner.title && section.banner.title.color ? section.banner.title.color : '#ffffff'}`">
                        {{
                          section.banner.title && section.banner.title.text
                            ? section.banner.title.text
                            : section.name
                        }}</p>
                      <p class="text-caption font-weight-thin mt-2"
                        :style="`color: ${section.banner.title && section.banner.description.color ? section.banner.description.color : '#ffffff'}`">
                        {{
                          section.banner.description && section.banner.description.text
                            ? section.banner.description.text
                            : section.description
                        }}</p>
                      <v-btn width="200" height="45" class="text-title mt-5" v-if="section.banner.button.enabled"
                        rounded="xl" @click="validateOnRedirect(section.banner.button.link)"
                        :color="section.banner.button.color">
                        {{ section.banner.button.text }}
                      </v-btn>
                    </v-col>
                  </v-row>
                </v-card>
              </v-col>
            </v-row>
          </div>
        </div>
      </template>

      <template v-else>
        <div class="banner-small-container my-10" :class="$vuetify.display.mdAndDown ? 'rounded-none' : 'rounded-xl'" style="position: relative; height: 200px; overflow: hidden;">
          <HeroImage 
            :src="section.banner.picture?? section.banner.pictureImageDetail?.image" 
            :alt="section.banner.pictureImageDetail?.altText?? ''" 
            :width="1200" 
            :height="200"
            container-class="banner-small-hero-image"
          />
          <!-- LAYER TEXT -->
          <div class="banner-small-overlay" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 2; background-color: rgba(18, 83, 155, 0.7);">
            <v-row class="h-100 pa-10 ma-0" align-content="center" no-gutters>
              <v-col class="text-center text-md-left" cols="12" md="8" lg="8" style="padding-left: 48px;">
                <p class="text-h5 font-weight-bold"
                  :style="`color: ${section.banner.title && section.banner.title.color ? section.banner.title.color : '#ffffff'}`">
                  {{
                    section.banner.title && section.banner.title.text
                      ? section.banner.title.text
                      : section.name
                  }}</p>
                <p class="text-caption font-weight-thin pr-15"
                  :style="`color: ${section.banner.title && section.banner.description.color ? section.banner.description.color : '#ffffff'}`">
                  {{
                    section.banner.description && section.banner.description.text
                      ? section.banner.description.text
                      : section.description
                  }}</p>
                <v-btn height="45" class="text-title mt-5" @click="validateOnRedirect(section.banner.button.link)"
                  v-if="section.banner.button.enabled" rounded="xl" :color="section.banner.button.color">
                  {{ section.banner.button.text }}
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </div>
      </template>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
/* Estilos para sección de banner */

/* Banner grande - Compatibilidad Safari */
.banner-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
  
  /* Fallback para aspect-ratio en Safari antiguo */
  height: 500px;
  min-height: 400px;
  max-height: 500px;
  
  /* Aspect ratio moderno con fallback */
  @supports (aspect-ratio: 16 / 9) {
    aspect-ratio: 16 / 9;
    height: auto;
  }
}

.banner-hero-image {
  width: 100%;
  height: 100%;
  
  ::v-deep(.hero-image-container) {
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
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

/* Banner pequeño - Compatibilidad Safari */
.banner-small-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: #f5f5f5;
  
  /* Fallback para aspect-ratio en Safari antiguo */
  height: 200px;
  min-height: 200px;
  max-height: 250px;
  
  /* Aspect ratio moderno con fallback */
  @supports (aspect-ratio: 6 / 1) {
    aspect-ratio: 6 / 1;
    height: auto;
  }
}

.banner-small-hero-image {
  width: 100%;
  height: 100%;
  
  ::v-deep(.hero-image-container) {
    width: 100% !important;
    height: 100% !important;
    min-height: 100% !important;
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

/* Overlay del banner */
.banner-overlay,
.banner-small-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
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
}

/* Compatibilidad específica para Safari */
@supports (-webkit-appearance: none) {
  .banner-container,
  .banner-small-container {
    /* Asegurar que las imágenes se rendericen correctamente */
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    /* Forzar repintado en Safari */
    -webkit-perspective: 1000px;
    perspective: 1000px;
    /* Asegurar que el contenedor tenga dimensiones definidas */
    min-width: 0;
    min-height: 0;
  }
  
  .banner-hero-image,
  .banner-small-hero-image {
    ::v-deep(.hero-image-container) {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    }
    
    ::v-deep(.hero-image) {
      -webkit-transform: translateZ(0);
      transform: translateZ(0);
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      /* Prevenir distorsión en Safari */
      -webkit-perspective: 1000px;
      perspective: 1000px;
    }
  }
}

/* Fix específico para Safari iOS */
@supports (-webkit-touch-callout: none) {
  .banner-container,
  .banner-small-container {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    /* Asegurar que el contenedor no se deforme */
    overflow: hidden;
    -webkit-overflow-scrolling: touch;
  }
  
  .banner-hero-image,
  .banner-small-hero-image {
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
}

/* Responsive */
@media (max-width: 768px) {
  .banner-container {
    height: 350px;
    min-height: 250px;
    max-height: 350px;
    
    @supports (aspect-ratio: 16 / 9) {
      aspect-ratio: 16 / 9;
      height: auto;
    }
  }

  .banner-small-container {
    height: 200px;
    min-height: 150px;
    max-height: 200px;
    
    @supports (aspect-ratio: 3 / 1) {
      aspect-ratio: 3 / 1;
      height: auto;
    }
  }
}
</style>
