<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue, Watch } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { SliderInterface, SliderOptions } from '~/interfaces/slider.interface';
import type { FinanciallyInterface, TypePostFinancially } from '~/interfaces/financially.interface';

// IMPORT COMPONENTS
import AppCarouselComponent from '~/components/carousel/index.vue';
import AppFinanciallyCardComponent from '~/components/financially/index.vue';

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from '~/graphql/slider.query';
import { GET_FINANCIALLY } from '~/graphql/financially.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'financially-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-carousel-component': AppCarouselComponent,
    'app-financially-card-component': AppFinanciallyCardComponent
  }
})
export default class FinanciallyScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // SLIDERS
  public sliders: Array<SliderInterface> = [];

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: true,
    position: 0,
    sliders: []
  }

  // FILTER POSTS
  public filter: { search: string; type: TypePostFinancially } = {
    search: '',
    type: 'all'
  }

  // POSTS
  public posts: Array<FinanciallyInterface> = [];

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // APPLY SEO METADATA
    // this.applySEOMetadata();
    // GET POSTS
    this.getFinanciallyPosts()

    // GET SLIDERS
    this.getSliders()
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
          target: 'banner::financially'
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

  // GET FINANCIALLY POSTS
  public async getFinanciallyPosts() {
    try {

      // ARGS FILTER DTO
      const argsFinancially = {
        argsFinancially: {
          search: this.filter.search,
          type: this.filter.type === 'all' ? '' : this.filter.type
        }
      }

      const { data } = await this.$apollo.query({
        query: GET_FINANCIALLY,
        variables: argsFinancially,
        fetchPolicy: 'no-cache'
      })

      // GET POSTS
      const financiallyPosts = data.findFinancially

      // ORDER LIST
      const orderByCreatedAt = [...financiallyPosts].sort((a: any, b: any) => b.createdAt - a.createdAt)

      console.log(orderByCreatedAt);
      

      // SET POSTS
      this.posts = [...orderByCreatedAt]

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  ///////////////
  /// WATCHER ///
  ///////////////

  // WATCH FILTER SEARCH
  @Watch('filter.type')
  public watchFilterSearch() {
    this.getFinanciallyPosts()
  }

  // APPLY SEO METADATA
  public applySEOMetadata() {
    const seoData = this.robustSEO.applyRobustSEO();
    this.pageSEO.applySEO();
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="hero-banners-container" justify="space-between" no-gutters>
    <v-col cols="12">
      <!-- BANNER CAROUSEL -->
      <app-carousel-component :options="optionSliders" />
    </v-col>

    <v-col cols="12" md="2" lg="2">
      <v-card :height="$vuetify.display.mdAndDown ? 'auto' : '100vh'" color="#fbfaff">
        <v-row justify="center">
          <v-col cols="10">
            <v-text-field v-model="filter.search" @keyup.enter="getFinanciallyPosts()" variant="solo" rounded="xl"
              label="Buscar" density="compact" class="mt-5">
              <template #append-inner>
                <v-icon>mdi-magnify</v-icon>
              </template>
            </v-text-field>

            <v-list bg-color="transparent" mandatory>
              <v-list-item @click="filter.type = 'all'"
                :style="filter.type === 'all' ? 'background: var(--bsc-primary-color); color: #ffffff' : 'background: transparent; color: grey'"
                rounded="xl" class="text-body-2 mt-0">
                <template v-slot:prepend>
                  <v-icon icon="mdi-home"></v-icon>
                </template>
                <v-list-item-title>Home</v-list-item-title>
              </v-list-item>

              <v-list-item @click="filter.type = 'post::article'"
                :style="filter.type === 'post::article' ? 'background: var(--bsc-primary-color); color: #ffffff' : 'background: transparent; color: grey'"
                rounded="xl" class="text-body-2 mt-5">
                <template v-slot:prepend>
                  <v-icon icon="mdi-book"></v-icon>
                </template>
                <v-list-item-title>Artículos</v-list-item-title>
              </v-list-item>

              <v-list-item @click="filter.type = 'post::events'"
                :style="filter.type === 'post::events' ? 'background: var(--bsc-primary-color); color: #ffffff' : 'background: transparent; color: grey'"
                rounded="xl" class="text-body-2 mt-5">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file"></v-icon>
                </template>
                <v-list-item-title>Eventos</v-list-item-title>
              </v-list-item>

              <v-list-item @click="filter.type = 'post::release'"
                :style="filter.type === 'post::release' ? 'background: var(--bsc-primary-color); color: #ffffff' : 'background: transparent; color: grey'"
                rounded="xl" class="text-body-2 mt-5">
                <template v-slot:prepend>
                  <v-icon icon="mdi-camera"></v-icon>
                </template>
                <v-list-item-title>Nota de prensa</v-list-item-title>
              </v-list-item>
            </v-list>

            <!-- <v-btn class="text-body-2 my-15" color="green" rounded="xl" block>
              <v-icon>mdi-email</v-icon>
              <span class="text-left ml-2">Suscribete</span>
            </v-btn> -->
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="10" class="pa-15">
      <v-row justify="center">
        <v-col v-for="post in posts" :key="post._id" cols="12" md="5" lg="4">
          <app-financially-card-component :financially="post" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>