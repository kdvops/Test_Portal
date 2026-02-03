<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue, Watch } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { SliderInterface, SliderOptions } from '~/interfaces/slider.interface';
import type { PromotionInterface } from '~/interfaces/promotion.interface';

// IMPORT COMPONENTS
import PreviewAppCarouselComponent from '~/components/previews/carousel/index.vue';
import AppPromotionCardComponent from '~/components/previews/promotion/index.vue';

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from '~/graphql/query/slider.query';
import { GET_PROMOTIONS_BY_DATE } from '~/graphql/query/promotion.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'promotions-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'preview-app-carousel-component': PreviewAppCarouselComponent,
    'app-promotion-card-component': AppPromotionCardComponent
  }
})
class PromotionsScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // INSTANCE FOR APP
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET QUERY PARAMS PROMOTIONS
  public monthParam: any = useRoute().query;

  // SLIDERS
  public sliders: Array<SliderInterface> = [];

  // PROMOTIONS BY MONTH
  public promotions: Array<PromotionInterface> = [];

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: false,
    sliders: [],
    position: 0
  }

  // SET SLIDERS
  public params: { search: string; start: string | null; end: string | null } = {
    search: "",
    start: null,
    end: null,
  }

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // GET SLIDERS
    this.getSliders();

    // SET DEFAULT MONTH PARAMS
    this.setParamsDate();
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
          target: 'banner::promotions'
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

  // GET PROMOTIONS BY DATE
  public async getPromotionsByDate() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_PROMOTIONS_BY_DATE,
        variables: {
          paramsByDate: this.params,
        },
        fetchPolicy: 'no-cache'
      })

      // SET PROMOTIONS
      this.promotions = data.findPromotionByDate

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // GET FORMAT DATE
  public setParamsDate() {
    this.params = {
      search: '',
      start: this.$app.$moment(this.monthParam.start, 'YYYY-MM-DD').toDate(),
      end: this.$app.$moment(this.monthParam.end, 'YYYY-MM-DD').toDate(),
    }
  }

  // GET FORMAT DATE
  public getFormatDate(format: string, date?: string) {
    return date ? this.$app.$moment(date).format(format) : this.$app.$moment().format(format);
  }

  @Watch('params', { deep: true })
  public watchParamsChange() {
    if (this.params.start && this.params.end) {
      this.getPromotionsByDate()
    }
  }
}
export default PromotionsScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="hero-banners-container" justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <preview-app-carousel-component :options="optionSliders" />
    </v-col>

    <v-col class="banner-info-promotion ma-0 pa-0" cols="12">
      <h2 class="text-white mr-5">
        Promociones de {{ getFormatDate('MMMM') }}
      </h2>
      <img width="26px" src="~/assets/icons/shopping-bag.svg">
    </v-col>

    <!-- FILTERS -->
    <v-col class="d-none d-md-block" cols="2">
      <v-card height="100vh" color="#fbfaff">
        <v-row justify="center">
          <v-col cols="10">
            <v-text-field v-model="params.search" @keyup.enter="getPromotionsByDate()" variant="solo" rounded="xl"
              label="Buscar" density="compact" class="my-5">
              <template #append-inner>
                <v-icon>mdi-magnify</v-icon>
              </template>
            </v-text-field>

            <v-menu :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" class="text-body-2 mt-10" color="primary" rounded="xl" block flat>
                  <v-icon>mdi-calendar</v-icon>
                  <span class="ml-2">
                    {{ params.start !== null
                      ? `${getFormatDate('DD', params.start)} ${getFormatDate('MMMM', params.start)}
                    ${getFormatDate('YYYY', params.start)}`
                      : 'FechaInicial' }}
                  </span>
                </v-btn>
              </template>
              <v-date-picker v-model="params.start" color="primary"></v-date-picker>
            </v-menu>

            <v-menu :close-on-content-click="false">
              <template v-slot:activator="{ props }">
                <v-btn v-bind="props" class="text-body-2 mt-10" color="green" rounded="xl" block flat>
                  <v-icon>mdi-calendar</v-icon>
                  <span class="ml-2">
                    {{ params.end !== null
                      ? `${getFormatDate('DD', params.end)} ${getFormatDate('MMMM', params.end)} ${getFormatDate('YYYY',
                        params.end)}`
                      : 'Fecha Final' }}
                  </span>
                </v-btn>
              </template>
              <v-date-picker v-model="params.end" color="primary"></v-date-picker>
            </v-menu>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <!-- FILTERS RESPONSIVE-->
    <v-col class="d-block d-md-none" cols="9">
      <v-text-field v-model="params.search" @keyup.enter="getPromotionsByDate()" variant="solo" rounded="xl"
        label="Buscar" density="compact" class="mt-5 mb-2">
        <template #append-inner>
          <v-icon>mdi-magnify</v-icon>
        </template>
      </v-text-field>

      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="text-body-2 mb-5" color="primary" rounded="xl" block flat>
            <v-icon>mdi-calendar</v-icon>
            <span class="ml-2">
              {{ params.start !== null
                ? `${getFormatDate('DD', params.start)} ${getFormatDate('MMMM', params.start)}
              ${getFormatDate('YYYY', params.start)}`
                : 'FechaInicial' }}
            </span>
          </v-btn>
        </template>
        <v-date-picker v-model="params.start" color="primary"></v-date-picker>
      </v-menu>

      <v-menu :close-on-content-click="false">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" class="text-body-2" color="green" rounded="xl" block flat>
            <v-icon>mdi-calendar</v-icon>
            <span class="ml-2">
              {{ params.end !== null
                ? `${getFormatDate('DD', params.end)} ${getFormatDate('MMMM', params.end)} ${getFormatDate('YYYY',
                  params.end)}`
                : 'Fecha Final' }}
            </span>
          </v-btn>
        </template>
        <v-date-picker v-model="params.end" color="primary"></v-date-picker>
      </v-menu>
    </v-col>

    <!-- PROMOTIONS -->
    <v-col class="pa-10" cols="10">
      <v-row justify="center">
        <v-col v-for="promotion in promotions" :key="promotion._id" cols="12" md="5" lg="4">
          <app-promotion-card-component :promotion="promotion" />
        </v-col>
      </v-row>
    </v-col>

  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.promotion-card-image {
  width: 95%;
  height: 120px;
  margin: 5px auto 0 auto;
  border-radius: 20px;
  background: var(--bsc-primary-color);
  color: #ffffff;
  align-items: center;
  text-align: center;

  p {
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 30px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.banner-info-promotion {
  height: 90px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color:#12499b;
}

.promotion-card-info {
  background-color: #ffffff;
  color: #535353;

  .promotion-card-condition {
    min-height: 115px;
    height: auto;
    max-height: auto;
  }

  .promotion-card-icon {
    width: 30px !important;
    height: 30px !important;
    background-color: #00a44f;
    border-radius: 100px;
  }
}
</style>