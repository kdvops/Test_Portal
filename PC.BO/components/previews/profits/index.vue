<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop } from "vue-facing-decorator"

// IMPORT INTERFACES
import type { ProfitDateRangeInterface } from '~/interfaces/profits.interface'

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-app-profit-card-component'
})
class PreviewAppProfitCardComponent extends Vue {
  //////////////
  //// PROPS ///
  //////////////

  @Prop({
    default: {
      show: true,
      profit: null
    }
  })
  options!: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // APP INSTANCE
  public $app: any;

  // DIALOG DETAILS
  public dialog: boolean = false

  ////////////////////////
  // METHODS FUNCTIONS //
  ////////////////////////

  // GET FORMAT DATE RANGE
  public getFormatDateRange(date: ProfitDateRangeInterface): string {
    const monthStart = this.$app.$moment(date.start).month();
    const monthEnd = this.$app.$moment(date.end).month();

    let dateFinal = '';

    monthStart === monthEnd
      ? dateFinal = `Del ${this.$app.$moment(date.start).format('D')} al ${this.$app.$moment(date.end).format('D')} de ${this.$app.$moment(date.end).format('MMMM')}`
      : dateFinal = `Del ${this.$app.$moment(date.start).format('D')} de ${this.$app.$moment(date.start).format('MMMM')} al ${this.$app.$moment(date.end).format('D')} de ${this.$app.$moment(date.end).format('MMMM')}`

    return dateFinal;
  }

  public spliceSecondText(text: string) {
    let words = text.split(" ");
    let part1 = `${words.slice(0, 3)[0]} ${words.slice(0, 3)[1] || ''} ${words.slice(0, 3)[2] || ''}`;
    let substring = words.slice(3).join(" ") || '';

    return { part1, substring };
  }

  public openDialogDetails() {
    this.dialog = true
  }

  public getHtmlProfit(target: string) {
    if (target === 'description') {
      return decrypt(this.options.profit.description.text)
    } else {
      return decrypt(this.options.profit.condition)
    }
  }
}
export default PreviewAppProfitCardComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <div>
    <v-card min-height="280" width="auto" max-width="auto" height="480" rounded="lg" class="pa-0 mx-4 d-flex flex-column w-100 h-100">
      <v-card-text class="pa-0 flex-grow-1">
        <v-row class="my-0" align-content="center" justify="center" no-gutters>
          <v-col cols="12">
            <div class="profit-card-image pa-5" :style="`background-color: ${options.profit.color}`">
              <v-img v-if="options.profit.picture" width="100%" height="100%" 
                :src="options.profit.picture?? options.profit.pictureImageDetail?.image" 
                :alt="options.profit.pictureImageDetail?.altText?? ''" 
                contain />
              <p v-else>{{ options.profit.name }}</p>
            </div>
          </v-col>
          <v-col cols="12" class="profit-card-info text-left">
            <div v-if="options.profit.percent" class="mb-2 mt-0 align-center">
              <p class="title-percent-card-profit text-green mt-0 mb-0">
                {{ options.profit.percent }}%
              </p>
              <p class="my-0 subtitle-percent-card-profit text-primary mb-1">
                DE DESCUENTO
              </p>
            </div>
            <div class="pa-5" style="width: 100%;" v-html="getHtmlProfit('condition')"></div>
            <div class=" text-center align-center px-5 pb-15">
              <v-btn v-if="options.profit.description.enabled" @click="openDialogDetails()" color="primary" rounded="xl"
                class="mt-4 text-caption">Mas Información</v-btn>
            </div>
            <div class="date-card-profit">
              <p class="text-center font-weight-bold">
                <v-icon size="20" color="primary">
                  mdi-calendar
                </v-icon>
                Valido {{ getFormatDateRange(options.profit.date) }}
              </p>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <v-dialog width="600" height="90%" v-model="dialog" :fullscreen="$vuetify.display.mdAndDown">
      <v-card height="100%" rounded="lg">
        <v-card-text class="pa-0">
          <v-row no-gutters>
            <v-col cols="12">
              <div class="profit-card-image pa-5 mt-0" :style="`background-color: ${options.profit.color}`">
                <v-img v-if="options.profit.picture" width="100%" height="100%" 
                :src="options.profit.picture?? options.profit.pictureImageDetail?.image" 
                :alt="options.profit.pictureImageDetail?.altText?? '' "
                contain />
                <p v-else>{{ options.profit.name }}</p>
              </div>
            </v-col>
            <v-col cols="12" class="mt-5 px-10">
              <div v-html="getHtmlProfit('description')"></div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.profit-card-image {
  width: 100%;
  height: 120px;
  margin: 5px auto 0 auto;
  color: #ffffff;
  border-radius: 10px;
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

.profit-card-info {
  background-color: #ffffff;
  color: #535353;

  .title-percent-card-profit {
    text-align: center;
    font-size: 80px;
    font-weight: 700;
    margin-top: -10px !important;
  }

  .subtitle-percent-card-profit {
    text-align: center;
    font-size: 20px;
    font-weight: 600;
    margin-top: -15px !important;
  }

  .condition-card-profit {
    position: relative;
    font-size: 11px;
    color: #a7a7a7;

    span {
      color: #1867c0;
      font-weight: 700;
    }
  }

  .date-card-profit {
    width: 100%;
    bottom: 5px;
    background: #fbfaff;
    padding: 8px 0;
    position: absolute;

    p {
      font-size: 11px;
      color: #757479;
    }
  }

  .profit-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }
}
</style>