<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-video-component',
})
class SectionVideoComponent extends Vue {
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
      style: 'videoLarge',
      type: 'sectionVideo',
      video: '',
    }
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;
}
export default SectionVideoComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="my-5" no-gutters>
    <v-col class="my-5" cols="12">
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
      <v-card class="mt-0" color="#12539b" rounded="xl" :height="section.style === 'videoLarge' ? 500 : 300">
        <iframe width="100%" height="100%" :src="`https://www.youtube.com/embed/${section.video}`" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </v-card>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>