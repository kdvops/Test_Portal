<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-image-component',
})
class SectionImageComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // PROPS CARDS SECTION
  @Prop({
    default: {
      name: '',
      description: '',
      color: '',
      position: 0,
      style: 'imageLarge',
      type: 'sectionImage',
      text: '',
    }
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;
}
export default SectionImageComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="ma-0 pa-0" no-gutters>
    <v-col class="mb-5" cols="12">
      <div v-if="section.name" class="text-center py-10"
        :style="`background-color: ${section.color ? section.color : 'var(--bsc-primary-color)'}; position: relative`">
        <h1 class="text-h5 text-white">
          {{ section.name }}
        </h1>
        <p class="text-white text-caption">
          {{ section.description }}
        </p>
      </div>
    </v-col>
    <v-col cols="12" class="px-3">
      <v-img width="100%" :height="section.style === 'imageSmall' ? 230 : section.style === 'imageMedium' ? 300 : 400"
         :src="section.image.url?? section.imageDetail?.image" 
         :alt="section.imageDetail?.altText?? ''"
         :cover="section.style !== 'imageLarge'" />
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>