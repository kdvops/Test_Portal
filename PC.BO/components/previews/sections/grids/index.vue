<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface, DialogCreateNewSectionCard, TypeCard, SectionStyle, GridInterface } from "~/interfaces/sections.interface";
import type { GridStyle } from "~/enums/gridStyle.enum";
import GridItemComponent from "../grid-item/index.vue";
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-grids-component',
  components: {
    'grid-item-component': GridItemComponent
  }
})
class SectionGridsComponent extends Vue {
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
      style: 'cardsLarge',
      type: 'sectionGrid',
      grid: null
    }
  })
  public section!: SectionTypeInterface;

  /////////////
  // METHODS //
  /////////////

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
export default SectionGridsComponent;
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
    <v-toolbar v-if="section.name" :color="section.color? section.color: section.name? 'var(--bsc-primary-color)':'transparent'" height="130" class="mt-1 d-flex justify-center">
      <v-container class="d-flex justify-center">
        <div class="d-flex flex-column align-center">
          <span class="text-h5 text-white">{{section.name}}</span>
          <span class="text-body-2 text-caption text-white">{{ section.description }}</span>
        </div>
      </v-container>
    </v-toolbar>
    <v-row justify="center" dense>
      <template v-for="grid in section.grids">
        <v-col cols="12" class="py-0 my-0" style="height: 0;" v-if="grid.breakLine"/>
        <grid-item-component :grid="grid" :cardStyle="section.style" v-else></grid-item-component>        
      </template>
    </v-row>
  </v-col>
</template>