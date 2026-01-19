<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "section-text-component",
})
export default class SectionTextComponent extends Vue {
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
      style: "textLarge",
      type: "sectionText",
      text: "",
    },
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

  public qty = useQuillToVuetify({
    ssrSafe: true,
    indentRem: 1.25,
    enable: {
      alignment: true,
      indent: true,
      size: true,
      colorClass: true,
      cleanup: true,
    },
    mappings: {
      align: {
        center: "text-center",
        right: "text-end",
        justify: "text-justify",
      },
      size: { small: "text-body-2", large: "text-h6", huge: "text-h4" },
      colorClass: { "ql-color-red": "text-error" },
    },
  });

  get vuetifyHtml() {
    return this.qty.transform(this.section.text);
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="my-5" no-gutters>
    <v-col cols="12">
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
    <v-col class="mx-auto" cols="10">
      <client-only>
        <div class="html-container" v-html="vuetifyHtml"></div>
      </client-only>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.html-container {
}
</style>
