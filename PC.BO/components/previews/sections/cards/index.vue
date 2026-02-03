<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Emit, Prop, Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { SectionTypeInterface, DialogCreateNewSectionCard, TypeCard } from "~/interfaces/sections.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'section-card-component',
})
class SectionCardComponent extends Vue {
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
      type: 'sectionCards',
      cards: []
    }
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
      background: '#ffffff',
      color: '#fbfaff'
    };

    if (this.section.position === 2 && this.section.style === 'cardsLarge') {
      defaultStyle = {
        cols: 8,
        md: 4,
        xl: 4,
        width: 260,
        height: 230,
        background: '#fbfaff',
        color: '#ffffff'
      };
    } else if (this.section.style === 'cardsLarge') {
      defaultStyle = {
        cols: 8,
        md: 4,
        xl: 3,
        width: 260,
        height: 230,
        background: '#ffffff',
        color: '#fbfaff'
      };
    } else if (this.section.style === 'cardsMedium') {
      defaultStyle = {
        cols: 12,
        md: 5,
        xl: 5,
        width: 230,
        height: 230,
        background: '#ffffff',
        color: '#ffffff'
      };
    }

    return defaultStyle;
  }

  public validateOnRedirect(link: string) {
    const validateRoute = link.split('/');

    if (validateRoute[0] === 'https:' || validateRoute[0] === 'http:') {
      window.open(link, '_blank');
    } else {
      this.$router.push(link)
    }
  }
}
export default SectionCardComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="ma-0 pa-0" justify="center" :style="`background-color: ${styleCards.background}`" no-gutters>
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
    <v-col class="py-10" cols="12" md="10" xl="9">
      <v-row justify="center" justify-md="start" no-gutters>
        <v-col v-for="item in section.cards!" :cols="styleCards.cols" :md="styleCards.md" :xl="styleCards.xl"
          :class="this.section.style === 'cardsMedium' ? 'mx-5' : ''">
          <v-card :width="styleCards.width" :max-width="styleCards.width" :min-height="styleCards.height"
            height="auto" max-height="auto" class="pa-2 my-3 mx-auto mx-md-0" :color="styleCards.color"
            :style="`border-bottom: ${section.color} solid 5px`">
            <v-card-text class="px-3 py-1">
              <v-row justify="start" no-gutters>
                <v-col cols="12" class="my-2">
                  <img :color="styleCards.background" 
                    :src="item.picture?? item.pictureImageDetail?.image?? ''" 
                    :alt="item.pictureImageDetail?.altText?? ''"
                    />
                </v-col>
                <v-col cols="12">
                  <p class="text-caption my-3">
                    <strong>{{ item.name }}</strong> {{ item.description }}
                  </p>
                </v-col>
                <v-col v-if="item.link" cols="12" class=" text-center">
                  <v-btn  class="text-caption py-0 mt-2" color="primary"
                    @click="validateOnRedirect(item.link)" rounded="xl">Mas
                    Información</v-btn>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>