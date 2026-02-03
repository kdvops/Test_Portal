<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import HeroImage from '~/components/optimized-image/HeroImage.vue';
import GalleryImage from '~/components/optimized-image/GalleryImage.vue';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-image-component',
  components: {
    HeroImage,
    GalleryImage
  }
})
export default class SectionImageComponent extends Vue {
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
      style: "imageLarge",
      type: "sectionImage",
      text: "",
    },
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="ma-0 pa-0" no-gutters>
    <v-col class="mb-5" cols="12">
      <div
        v-if="section.name"
        class="text-center py-10"
        :style="`background-color: ${
          section.color ? section.color : 'var(--bsc-primary-color)'
        }; position: relative`"
      >
        <h2 class="text-h5 text-white">
          {{ section.name }}
        </h2>
        <p class="text-white text-caption">
          {{ section.description }}
        </p>
      </div>
    </v-col>
    <v-col cols="12" class="px-3" v-if="section.style !== 'imageCover'">
      <GalleryImage
        :src="section.image?.url ?? section.imageDetail?.image"
        :alt="section.imageDetail?.altText ?? ''"
        :width="1200"
        :height="section.style === 'imageSmall' ? 230 : section.style === 'imageMedium' ? 300 : 400"
      />
    </v-col>
    <v-col v-else cols="12">
      <HeroImage
        :src="section.image?.url ?? section.imageDetail?.image"
        :alt="section.imageDetail?.altText ?? ''"
        :width="1920"
        :height="400"
        loading="lazy"
      />
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
/* Estilos para sección de imagen */
</style>
