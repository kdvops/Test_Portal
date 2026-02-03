<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from 'vue-facing-decorator'
import { useRobustSEO } from '~/composables/useRobustSEO'
// IMPORT INTERFACES
import type { SliderInterface, SliderOptions } from '~/interfaces/slider.interface';

// IMPORT COMPONENTS
import AppCarouselComponent from '~/components/carousel/index.vue';
import AppShortcutsComponent from '~/components/shortcuts/index.vue';

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from '~/graphql/slider.query';
import { GET_SHORTCUTS_BY_TARGET } from '~/graphql/shortcuts.query';
import type { ShortcutInterface } from '~/interfaces/shortcuts.interface';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'home-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-carousel-component': AppCarouselComponent,
    'app-shortcuts-component': AppShortcutsComponent
  }
})
export default class HomeScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SHORTCUTS
  public shortcuts: Array<ShortcutInterface> = [];

  // ACTIVE SHORTCUTS
  public activeShortcuts: number | null = null;

  // SLIDERS
  public sliders: Array<SliderInterface> = [];

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: true,
    position: 0,
    sliders: []
  }

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // GET SLIDERS
    this.getSliders()

    // GET SHORTCUTS BY TARGET
    this.getShortcutsByTarget()

    // APPLY SEO METADATA
    this.applySEOMetadata()
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET SLIDERS
  public async getSliders() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SLIDERS_BY_TARGET,
        variables: {
          target: 'banner::home'
        },
        fetchPolicy: 'no-cache'
      })

      // FILTER SLIDERS FOR HOME
      this.optionSliders = {
        show: true,
        sliders: data.findSliderByTarget,
        position: 0
      }

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // GET SHORTCUTS BY TARGET
  public async getShortcutsByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SHORTCUTS_BY_TARGET,
        variables: {
          target: 'target::home'
        },
        fetchPolicy: 'no-cache'
      })

      // SET SHORTCUTS
      this.shortcuts = data.findShortcutsByTarget;

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // APPLY SEO METADATA
  public applySEOMetadata() {
    this.robustSEO.applyRobustSEO({ section: 'home' });
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="pb-15" justify="center" align-content="center" no-gutters>
    <v-col cols="12">
      <!-- BANNER CAROUSEL -->
      <app-carousel-component :options="optionSliders" />
    </v-col>
    <v-col cols="12" md="10" lg="9">
      <!-- MENU SHORTCUTS -->
      <app-shortcuts-component :shortcuts="shortcuts" type="tabs" />
    </v-col>
  </v-row>
</template>
<!-- SASS STYLES -->
<style lang="scss">
:root{
  --bsc-primary-color: #12499b;
  --v-theme-on-surface: --bsc-primary-color;
}
</style>