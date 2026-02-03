<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-text-component',
})
class SectionTextComponent extends Vue {
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
      style: 'textLarge',
      type: 'sectionText',
      text: '',
    }
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  public created() {
    console.log(this);

  }
}
export default SectionTextComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="my-5" no-gutters>
    <v-col cols="12">
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
    <v-col class="mx-auto" cols="10">
      <client-only>
        <div class="html-container" v-html="section.text"></div>
      </client-only>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.html-container {}
</style>