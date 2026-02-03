<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Prop, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// IMPORT COMPONENTS
import PreviewSectionCardComponent from "~/components/previews/sections/cards/index.vue";
import PreviewSectionBannerComponent from "~/components/previews/sections/banner/index.vue";
import PreviewSectionVideoComponent from "~/components/previews/sections/video/index.vue";
import PreviewSectionImageComponent from "~/components/previews/sections/image/index.vue";
import PreviewSectionTextComponent from "~/components/previews/sections/text/index.vue";
import PreviewSectionTableComponent from "~/components/previews/sections/table/index.vue"
import PreviewSectionAttachmentsComponent from "~/components/previews/sections/attachments/index.vue";
import PreviewSectionGridsComponent from '~/components/previews/sections/grids/index.vue'
import PreviewSectionGalleryComponent from "~/components/previews/sections/gallery/index.vue";
import PreviewSectionAccordionComponent from "~/components/previews/sections/accordion/index.vue";
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-sections-component',
  components: {
    // COMPONENTS CUSTOM APP
    'preview-section-card-component': PreviewSectionCardComponent,
    'preview-section-banner-component': PreviewSectionBannerComponent,
    'preview-section-image-component': PreviewSectionImageComponent,
    'preview-section-video-component': PreviewSectionVideoComponent,
    'preview-section-text-component': PreviewSectionTextComponent,
    'preview-section-table-component': PreviewSectionTableComponent,
    'preview-section-attachments-component': PreviewSectionAttachmentsComponent,
    'preview-section-grids-component' : PreviewSectionGridsComponent,
    'preview-section-gallery-component': PreviewSectionGalleryComponent,
    "preview-section-accordion-component": PreviewSectionAccordionComponent
  },
})
class PreviewSectionComponent extends Vue {
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
export default PreviewSectionComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" no-gutters>
    
      <template v-for="section in sections">
        
          <template v-if="section.type === 'sectionCards'">
            <div class="d-flex flex-wrap justify-center w-100">
              <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
                <preview-section-card-component :section="section" />
              </v-col>
            </div>
          </template>
          <template v-else-if="section.type === 'sectionBanner'">
            <div class="d-flex flex-wrap justify-center w-100">
              <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
                <preview-section-banner-component :section="section" />
              </v-col>
            </div>
          </template>
          <template v-else-if="section.type === 'sectionImage'">
            <div class="d-flex flex-wrap justify-center w-100" v-if="section.image && section.style !== 'imageCover'">
              <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
                <preview-section-image-component :section="section" />
              </v-col>
            </div>
            <template v-else cols="12">
              <v-col cols="12">
                <preview-section-image-component :section="section" />
              </v-col>
            </template>
          </template>
          <template v-else-if="section.type === 'sectionVideo'">
            <div class="d-flex flex-wrap justify-center w-100">
              <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
                <preview-section-video-component :section="section" />
              </v-col>
            </div>
          </template>
          <template v-else-if="section.type === 'sectionText'">
            <div class="d-flex flex-wrap justify-center w-100">
              <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
                <preview-section-text-component :section="section" />
              </v-col>
            </div>
          </template>
          <template v-else-if="section.type === 'sectionTable'">
            <div class="d-flex flex-wrap justify-center w-100">
              <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
                <preview-section-table-component :section="section" />
              </v-col>
            </div>
          </template>
          <template v-else-if="section.type === 'sectionGrids'">
              <preview-section-grids-component :section="section" />
          </template>          
          <template v-else-if="section.type === 'sectionGallery'">
              <v-col cols="12">
                <preview-section-gallery-component :section="section" />
              </v-col>
          </template>
          <template v-else-if="section.type === 'sectionAccordion'">
              <v-col cols="12">
                <preview-section-accordion-component :section="section" />
              </v-col>
          </template>
          <template v-else>
            <div class="d-flex flex-wrap justify-center w-100">
              <v-col class="pa-0 ma-0" cols="12" :md="validateTypeSectionAndSize(section)">
                <preview-section-attachments-component :section="section" />
              </v-col>
            </div>
          </template>
        
      </template>
    
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>