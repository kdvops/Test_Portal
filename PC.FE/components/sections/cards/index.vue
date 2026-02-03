<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Prop, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import IconImage from "~/components/optimized-image/IconImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-card-component',
  components: {
    IconImage,
  },
})
export default class SectionCardComponent extends Vue {
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
      style: "cardsLarge",
      type: "sectionCards",
      cards: [],
    },
  })
  public section!: SectionTypeInterface;

  /////////////
  // METHODS //
  /////////////

  // GET STYLE CARDS
  public get styleCards(): {
    cols: number;
    md: number;
    xl: number;
    width: number;
    height: number;
    background: string;
    color: string;
  } {
    // DEFAULT STYLE
    let defaultStyle = {
      cols: 8,
      md: 5,
      xl: 3,
      width: 350,
      height: 350,
      background: "#ffffff",
      color: "#fbfaff",
    };

    if (this.section.position === 2 && this.section.style === "cardsLarge") {
      defaultStyle = {
        cols: 8,
        md: 4,
        xl: 4,
        width: 260,
        height: 230,
        background: "#fbfaff",
        color: "#ffffff",
      };
    } else if (this.section.style === "cardsLarge") {
      defaultStyle = {
        cols: 8,
        md: 4,
        xl: 3,
        width: 260,
        height: 230,
        background: "#ffffff",
        color: "#fbfaff",
      };
    } else if (this.section.style === "cardsMedium") {
      defaultStyle = {
        cols: 12,
        md: 5,
        xl: 5,
        width: 230,
        height: 230,
        background: "#ffffff",
        color: "#ffffff",
      };
    }

    return defaultStyle;
  }

  public validateOnRedirect(link: string) {
    const validateRoute = link.split("/");

    if (validateRoute[0] === "https:" || validateRoute[0] === "http:") {
      window.open(link, "_blank");
    } else {
      this.$router.push(link);
    }
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="ma-0 pa-0" justify="center" :style="`background-color: ${styleCards.background}`" no-gutters>
    <v-toolbar v-if="section.name" :color="section.color? section.color: section.name? '#12499b':'transparent'" height="130" class="mt-1 d-flex justify-center">
      <v-container class="d-flex justify-center">
        <div class="d-flex flex-column align-center">
          <span class="text-h5 text-white">{{section.name}}</span>
          <span class="text-body-2 text-caption text-white">{{ section.description }}</span>
        </div>
      </v-container>
    </v-toolbar>
    <v-col class="py-10" cols="12" md="10" xl="9">
      <v-row justify="center" justify-md="start" no-gutters>
        <v-col v-for="item in section.cards!" :cols="styleCards.cols" :md="styleCards.md" :xl="styleCards.xl"
          :class="section.style === 'cardsMedium' ? 'mx-5' : ''">
          <v-card 
            :width="styleCards.width" 
            :max-width="styleCards.width" 
            :min-height="styleCards.height"
            class="section-card my-3 mx-auto mx-md-0" 
            :color="styleCards.color"
            :style="`--border-color: ${section.color || '#12499b'}`"
          >
            <v-card-text class="section-card-content">
              <div class="section-card-icon-wrapper">
                <IconImage 
                  :src="item.picture?? item.pictureImageDetail?.image" 
                  :alt="item.pictureImageDetail?.altText?? ''" 
                  :width="64"
                  :height="64"
                  :fixed-size="true"
                  loading="lazy"
                  container-class="section-card-icon-container"
                  image-class="section-card-icon"
                />
              </div>
              <div class="section-card-text">
                <p class="section-card-content-text">
                  <strong>{{ item.name }}</strong> {{ item.description }}
                </p>
              </div>
              <div v-if="item.link" class="section-card-link">
                <v-btn 
                  class="text-caption py-0 mt-2" 
                  color="primary"
                  @click="validateOnRedirect(item.link)" 
                  rounded="xl"
                >
                  Mas Información
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.section-card {
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  border-bottom: 3px solid var(--border-color, #12499b) !important;
}

.section-card-content {
  padding: 16px !important;
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100%;
  justify-content: space-between;
}

.section-card-icon-wrapper {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  width: 100%;
  margin-bottom: 16px;
}

.section-card-icon-container {
  display: inline-flex !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  width: auto !important;
  height: auto !important;
}

/* Estilos específicos solo para iconos dentro de tarjetas - 64x64px fijo */
.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(.icon-image-container) {
  width: 64px !important;
  height: 64px !important;
  max-width: 64px !important;
  max-height: 64px !important;
  min-width: 64px !important;
  min-height: 64px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  flex-shrink: 0 !important;
}

.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(.icon-image),
.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(img),
.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(.icon-image-svg),
.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(picture),
.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(picture img) {
  /* Tamaño fijo 64x64px - exacto como en referencia */
  width: 64px !important;
  height: 64px !important;
  max-width: 64px !important;
  max-height: 64px !important;
  min-width: 64px !important;
  min-height: 64px !important;
  /* Mantener proporciones sin distorsión */
  -o-object-fit: contain !important;
  object-fit: contain !important;
  -o-object-position: center !important;
  object-position: center !important;
  /* Mejorar calidad de renderizado */
  image-rendering: auto !important;
  -ms-interpolation-mode: bicubic !important;
  display: block !important;
  flex-shrink: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: none !important;
  box-shadow: none !important;
  border-radius: 0 !important;
  box-sizing: border-box !important;
  line-height: 0 !important;
  transform: none !important;
  -webkit-transform: none !important;
  scale: 1 !important;
}

/* Sobrescribir estilos inline del componente IconImage */
.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(.icon-image[style]),
.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(img[style]),
.section-card .section-card-icon-wrapper .section-card-icon-container ::v-deep(.icon-image-svg[style]) {
  width: 64px !important;
  height: 64px !important;
  max-width: 64px !important;
  max-height: 64px !important;
  min-width: 64px !important;
  min-height: 64px !important;
}

.section-card-text {
  margin-top: auto;
  padding-top: 0;
  text-align: left;
  flex: 1;
}

.section-card-content-text {
  font-size: 12px;
  line-height: 1.4;
  margin: 0;
  color: #000000;
  font-weight: 400;
  text-align: left;
  
  strong {
    font-weight: 700;
  }
}

.section-card-link {
  text-align: left;
  margin-top: 12px;
}
</style>
