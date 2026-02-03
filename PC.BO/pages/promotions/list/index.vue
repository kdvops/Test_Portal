<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationPromotion from "~/assets/animations/promotions-animation.json";

// IMPORT INTERFACE
import type {
  PromotionByMonthInterface,
  PromotionDateRangeInterface,
} from "~/interfaces/promotion.interface";

// IMPORT QUERY'S
import { GET_PROMOTIONS_BY_MONTH } from "~/graphql/query/promotion.query";

// IMPORT MUTATIONS
import {
  CLONE_PROMOTION,
  REMOVE_PROMOTION,
  PUBLISH_PROMOTION,
  DRAFT_PROMOTION,
} from "~/graphql/mutations/promotion.mutation";

import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "promotions-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class PromotionsListScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION PROMO
  @Ref("animationPromo") animationPromo: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // ANIMATIONS LOTTIE
  public animationPromotion: any = AnimationPromotion;

  // PROMOTION DEFAULT VALUES
  public promotionsByMonth: Array<PromotionByMonthInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();
  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: CLONE_PROMOTION,
        REMOVE_MUTATION: REMOVE_PROMOTION,
        PUBLISH_MUTATION: PUBLISH_PROMOTION,
        DRAFT_MUTATION: DRAFT_PROMOTION,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }

  public created() {
    this.setPromotions();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PROMOTIONS
  public async setPromotions() {
    // SEARCH ARGS DTO PAYLOAD
    const searchArgsDto = {
      searchArgs: {
        month: null,
      },
    };

    try {
      // GET ALL PROMOTIONS
      const { data } = await this.$apollo.query({
        query: GET_PROMOTIONS_BY_MONTH,
        variables: searchArgsDto,
        fetchPolicy: "no-cache",
      });

      // SET PROMOTIONS TO VARIABLE Y ORDENAR POR FECHA DE CREACIÓN (MÁS ACTUAL A MÁS VIEJO)
      const promotions = data.findPromotionsByMonth || [];
      this.promotionsByMonth = promotions.sort((a: PromotionByMonthInterface, b: PromotionByMonthInterface) => {
        const dateA = this.$app.$moment(a.createdAt, "YYYY-MM").toDate();
        const dateB = this.$app.$moment(b.createdAt, "YYYY-MM").toDate();
        return dateB.getTime() - dateA.getTime(); // Orden descendente (más reciente primero)
      });
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "delete":
        this.generalStatusComposable!.removeItem(
          { promotionId: itemID },
          this.setPromotions
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { promotionId: itemID },
          this.setPromotions
        );
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { promotionId: itemID },
          status!,
          this.setPromotions
        );
        return true;
    }
    return false;
  };

  // GO TO UPDATE PROMOTION
  public goUpdate(date: string) {
    this.$router.push(`/promotions/update/${date}`);
  }

  // GO TO CREATE PROMOTION
  public goCreate() {
    this.$router.push(`/promotions/create`);
  }

  // GET FORMAT DATE
  public getFormatDateRange(date: PromotionDateRangeInterface): string {
    const startDate = this.$app.$moment(date.start);
    const endDate = this.$app.$moment(date.end);

    let dateFinal = '';

    if (startDate.isSame(endDate, 'day')) {
      dateFinal = `${this.$app.$moment(date.start).format('D')} de ${this.$app.$moment(date.start).format('MMMM')} de ${this.$app.$moment(date.start).format('YYYY')}`;
    } else {
      dateFinal = `Del ${this.$app.$moment(date.start).format('D')} de ${this.$app.$moment(date.start).format('MMMM')} de ${this.$app.$moment(date.start).format('YYYY')} al ${this.$app.$moment(date.end).format('D')}/${this.$app.$moment(date.end).format('MMMM')}/${this.$app.$moment(date.start).format('YYYY')}`;
    }

    return dateFinal;
  }

  public getDate(date: string): string {
    return `${this.$app.$moment(date, "YYYY-MM").format("MMMM")} del ${this.$app.$moment(date, "YYYY-MM").format("YYYY")}`;
  }
}

export default PromotionsListScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="11">
      <client-only>
        <v-card width="100%" height="180px" rounded="xl" class="card-principal-container pa-0 ma-0" color="#00a44f"
          flat>
          <v-card-text>
            <v-row align-content="center" justify="space-between">
              <v-col cols="6" class="card-principal-info-container text-left d-flex flex-column align-self-center">
                <p class="text-h5 text-uppercase text-white font-weight-bold ml-10">
                  Lista de promociones,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus promociones de una manera mas
                  sencilla!
                </p>
                <v-btn @click="goCreate()" width="130" variant="outlined" class="mt-5 ml-10 text-caption" rounded="xl"
                  density="compact" text="Crear Promociones" />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie width="360px" height="360px" :loop="true" ref="animationPromo"
                  :animationData="animationPromotion" />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5" justify="start" align-content="center">
    <v-col cols="3">
      <v-text-field class="ml-5" prepend-inner-icon="mdi-magnify" rounded="xl" density="compact" variant="solo"
        label="Buscar Promoción" />
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="start">
    <v-col cols="12" v-for="(promotionByMonth, i) in promotionsByMonth" :key="i">
      <div class="banner-promotion-month px-15">
        <h3 class="text-white text-uppercase">
          Promociones creadas el mes de {{ getDate(promotionByMonth.createdAt) }}
        </h3>
        <v-spacer />
        <v-btn width="80" class="text-caption mx-3" variant="outlined" color="white" rounded="xl" density="compact"
          text="Editar" @click="goUpdate(promotionByMonth.createdAt)" />
      </div>
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item v-for="promotion in promotionByMonth.promotions" :key="promotion._id">
          <v-card width="250" height="300" rounded="xl" class="pa-0 mx-4">
            <v-card-text class="pa-0">
              <v-row class="my-0" align-content="center" justify="center" no-gutters>
                <v-col cols="12">
                  <div class="promotion-card-image pa-5">
                    <v-img v-if="
                      promotion.picture || promotion.pictureImageDetail?.image
                    " width="100%" height="100%" :src="promotion.picture ?? promotion.pictureImageDetail?.image
                      " contain />
                    <p v-else>{{ promotion.name }}</p>
                    <item-action-component :item="{
                      ...promotion,
                      name: `RD$${promotion.devolution}`,
                    }" :onItemAction="itemAction" :update="false" copy status delete variant="flat" color="white"
                      density="comfortable" location="right top" position="absolute"
                      class="mt-2 mr-2"></item-action-component>
                  </div>
                </v-col>
                <v-col cols="12" class="promotion-card-info pa-3 text-left">
                  <div class="my-2 d-flex align-center">
                    <v-icon class="promotion-card-icon" color="#ffffff" size="20">
                      mdi-cash
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">
                        Devolución
                      </p>
                      <p class="my-0 text-caption">
                        RD${{ promotion.devolution }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon class="promotion-card-icon" color="#ffffff" size="20">
                      mdi-percent
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">
                        Porcentaje
                      </p>
                      <p class="my-0 text-caption">{{ promotion.percent }}%</p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon class="promotion-card-icon" color="#ffffff" size="20">
                      mdi-alarm
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Fecha</p>
                      <p class="my-0 text-caption">
                        {{ getFormatDateRange(promotion.date) }}
                      </p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -70px;
  }

  .card-principal-animation {
    margin-top: -90px;
    margin-right: -20px;
  }
}

.promotion-card-image {
  width: 95%;
  height: 120px;
  margin: 5px auto 0 auto;
  border-radius: 20px;
  background: #12539b;
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

.promotion-card-info {
  background-color: #ffffff;
  color: #535353;

  .promotion-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .promotion-card-icon {
    width: 30px !important;
    height: 30px !important;
    background-color: #00a44f;
    border-radius: 100px;
  }
}

.banner-promotion-month {
  height: 90px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}
</style>
