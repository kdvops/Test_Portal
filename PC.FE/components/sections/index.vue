<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Prop, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface, DialogCreateNewSection, TypeCard, TypeAttachment } from "~/interfaces/sections.interface";

// IMPORT COMPONENTS
import SectionCardComponent from "~/components/sections/cards/index.vue";
import SectionBannerComponent from "~/components/sections/banner/index.vue";
import SectionVideoComponent from "~/components/sections/video/index.vue";
import SectionImageComponent from "~/components/sections/image/index.vue";
import SectionTextComponent from "~/components/sections/text/index.vue";
import SectionTableComponent from "~/components/sections/table/index.vue"
import SectionAttachmentsComponent from "~/components/sections/attachments/index.vue";
import SectionGridsComponent from '~/components/sections/grids/index.vue'
import SectionGalleryComponent from "./gallery/index.vue";
import SectionAccordionComponent from "./accordion/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'sections-component',
  components: {
    // COMPONENTS CUSTOM APP
    'section-card-component': SectionCardComponent,
    'section-banner-component': SectionBannerComponent,
    'section-image-component': SectionImageComponent,
    'section-video-component': SectionVideoComponent,
    'section-text-component': SectionTextComponent,
    'section-table-component': SectionTableComponent,
    'section-attachments-component': SectionAttachmentsComponent,
    'section-grids-component' : SectionGridsComponent,
    'section-gallery-component': SectionGalleryComponent,
    "section-accordion-component": SectionAccordionComponent
  },
})
export default class SectionComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // PROPS SECTION
  @Prop({
    default: {
      name: '',
      description: '',
      color: '',
      position: 0,
      style: '',
      type: '',
      image: {
        url: '',
        newUploadPictureItem: []
      },
      text: '',
      video: '',
      cards: [],
      table: {
        headers: [],
        columns: []
      },
      banner: {
        button: {
          text: '',
          color: '',
          link: '',
          background: '',
          enabled: false,
        },
        picture: '',
        newUploadPictureItem: []
      },
      attachments: [],
    }
  })
  public sections!: Array<SectionTypeInterface>;

  ///////////////
  /// METHODS ///
  ///////////////

  // VALIDATE TYPE SECTION AND SIZE
  public validateTypeSectionAndSize(section: SectionTypeInterface): string {
    // DEFAULT COLS
    let cols = '12';

    // VALIDATE TYPE SECTION
    if (section.type === 'sectionCards') {
      section.style === 'cardsLarge' ? cols = '12' : cols = '6'
    } else if (section.type === 'sectionGrids') {
      section.style === 'cardsLarge' ? cols = '12' : cols = '6'
    } else if (section.type === 'sectionBanner') {
      section.style === 'bannerLarge' ? cols = '12' : cols = '7'
    } else if (section.type === 'sectionVideo') {
      section.style === 'videoLarge' ? cols = '12' : cols = '6'
    } else if (section.type === 'sectionText') {
      section.style === 'textLarge' ? cols = '12' : cols = '7'
    } else if (section.type === 'sectionTable') {
      section.style === 'tableLarge'
        ? cols = '12' : section.style === 'tableMedium'
          ? cols = '7' : cols = '6'
    } else if (section.type === 'sectionImage') {
      section.style === 'imageLarge'
        ? cols = '12'
        : section.style === 'imageMedium'
          ? cols = '6'
          : cols = '4'
    } else {
      cols = '12'
    }

    // RETURN COLS
    return cols;
  }

}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" no-gutters>
    
      <template v-for="section in sections">
        
          <template v-if="section.type === 'sectionCards'">
            <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
              <section-card-component :section="section" />
            </v-col>
          </template>
          <template v-else-if="section.type === 'sectionBanner'">
            <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
              <section-banner-component :section="section" />
            </v-col>
          </template>
          <template v-else-if="section.type === 'sectionImage'">
            <v-col v-if="section.image && section.style !== 'imageCover'" class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
              <section-image-component :section="section" />
            </v-col>
            <v-col v-else cols="12">
              <section-image-component :section="section" />
            </v-col>
          </template>
          <template v-else-if="section.type === 'sectionVideo'">
            <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
              <section-video-component :section="section" />
            </v-col>
          </template>
          <template v-else-if="section.type === 'sectionText'">
            <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
              <section-text-component :section="section" />
            </v-col>
          </template>
          <template v-else-if="section.type === 'sectionTable'">
            <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
              <section-table-component :section="section" />
            </v-col>
          </template>
          <template v-else-if="section.type === 'sectionGrids'">
              <section-grids-component :section="section" />
          </template>          
          <template v-else-if="section.type === 'sectionGallery'">
              <v-col cols="12">
                <section-gallery-component :section="section" />
              </v-col>
          </template>
          <template v-else-if="section.type === 'sectionAccordion'">
              <section-accordion-component :section="section" />
          </template>
          <template v-else>
            <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
              <section-attachments-component :section="section" />
            </v-col>
          </template>
        
      </template>
    
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
/* Estilos para componente de secciones */
</style>