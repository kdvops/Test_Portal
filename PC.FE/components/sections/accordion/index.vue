<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface } from "~/interfaces/sections.interface";
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-accordion-component',
})
export default class SectionAccordionComponent extends Vue {
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
      style: 'cardLarge',
      type: 'sectionAccordion',
      text: '',
    }
  })
  public section!: SectionTypeInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

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
      background: '#ffffff',
      color: '#fbfaff'
    };

     if (this.section.style === 'cardsLarge') {
      defaultStyle = {
        cols: 12,
        md: 12,
        xl: 12,
        width: 260,
        height: 230,
        background: '#ffffff',
        color: '#fbfaff'
      };
    } else if (this.section.style === 'cardsMedium') {
      defaultStyle = {
        cols: 12,
        md: 6,
        xl: 6,
        width: 230,
        height: 230,
        background: '#ffffff',
        color: '#ffffff'
      };
    }

    return defaultStyle;
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-col 
  class="ma-0 pa-0" 
  justify="center" 
  :style="`background-color: ${styleCards.background}`" 
  no-gutters 
  :cols="styleCards.cols" 
  :md="styleCards.md" 
  :xl="styleCards.xl">
          <v-container class="pa-4">
            <v-expansion-panels multiple>
              <v-expansion-panel color="white"
                v-for="(item, index) in section.accordion?.items"
                :key="index"
              >
                <v-expansion-panel-title>
                  <div class="d-flex justify-space-between align-center w-100">
                    <span class="text-primary font-weight-bold">{{ item.title }}</span>
                  </div>
                </v-expansion-panel-title>

                <v-expansion-panel-text class="bg-grey-lighten-5">
                  {{ item.content }}
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
          </v-container>
  </v-col>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
::v-deep(.v-expansion-panel-title__icon .v-icon) {
  color: green !important;
}
</style>