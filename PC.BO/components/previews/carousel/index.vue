<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit } from "vue-facing-decorator"

// IMPORT INTERFACES
import type { SliderInterface, SliderOptions } from "~/interfaces/slider.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-carousel-component'
})
class AppCarouselComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // BANNER PROPS
  @Prop({
    default: {
      show: false,
      sliders: [],
      position: 0
    }
  })
  options!: SliderOptions;

  /////////////
  // METHODS //
  /////////////

  // GET JUSTIFY TEXT
  public getJustifyText(slider: SliderInterface) {
    return slider.title.align === 'left' ||
      slider.subtitle.align === 'left' ||
      slider.description.align === 'left'
      ? 'start'
      : slider.title.align === 'center' ||
        slider.subtitle.align === 'center' ||
        slider.description.align === 'center'
        ? 'center'
        : 'end'
  }

  public get heightCarousel() {
    const breakpoints = {
      sm: '400px',
      md: '500px',
      lg: '600px',
      xl: '700px',
      default: '320px'
    };

    const { sm, md, lg, xl } = this.$vuetify.display;

    if (sm) return breakpoints.sm;
    if (md) return breakpoints.md;
    if (lg) return breakpoints.lg;
    if (xl) return breakpoints.xl;

    return breakpoints.default
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

export default AppCarouselComponent;
</script>

<!-- HTML TEMPLATE -->
<template v-if="options.show">
  <v-carousel min-height="auto" :height="heightCarousel" mandatory="force" v-model="options.position"
    :show-arrows="options.sliders.length > 1 ? 'hover' : false" interval="7000" hide-delimiters cycle>

    <!-- SET SLIDERS FOR API -->
    <template v-for="(slider, i) in options.sliders" :key="slider._id">
      <v-carousel-item :value="i"
          v-if="$vuetify.display.mdAndDown" :src="slider.responsive ?? slider.responsiveImageDetail?.image?? slider.picture?? slider.pictureImageDetail?.image"
          :alt="(slider.responsiveImageDetail? slider.responsiveImageDetail?.altText:slider.pictureImageDetail?.altText) || ''"
          @click="!slider.button.enabled && slider.button.link
          ? validateOnRedirect(slider.button.link)
          : null" :class="!slider.button.enabled && slider.button.link
            ? 'cursor-pointer'
            : ''" cover eager>
        <!-- LAYER EDIT TEXT -->
        <v-container v-if="$vuetify.display.mdAndDown" class="banner-container-image px-15" fluid>
          <v-row class="banner-row-image px-5" align-content="center" :justify="getJustifyText(slider)">
            <v-col cols="6" class="mr-10 py-1 pr-12">
              <p :style="`color: ${slider.title.color}`"
                :class="`${slider.title.size} text-${slider.title.align} font-weight-${slider.title.weight}`">
                {{ slider.title.text }}
              </p>
            </v-col>
            <v-col cols="6" class="mr-10 py-1 pr-12">
              <p :style="`color: ${slider.subtitle.color}`"
                :class="`${slider.subtitle.size} text-${slider.subtitle.align} font-weight-${slider.subtitle.weight}`">
                {{ slider.subtitle.text }}
              </p>
            </v-col>
            <v-col cols="6" class="mr-10 py-1 pr-12">
              <p :style="`color: ${slider.description.color}`"
                :class="`${slider.description.size} text-${slider.description.align} font-weight-${slider.description.weight}`">
                {{ slider.description.text }}
              </p>
            </v-col>
            <v-col v-if="slider.button.enabled" cols="12" :class="`text-${slider.button.align}`">
              <v-btn @click="validateOnRedirect(slider.button.link)" :color="slider.button.background" variant="flat" small
                :style="`color: ${slider.button.color}!important`" :class="`font-weight-${slider.button.weight}`">
                {{ slider.button.text }}
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-carousel-item>
    </template>
  </v-carousel>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}
</style>