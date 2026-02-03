<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationProfit from "~/assets/animations/profits-animation.json";

// IMPORT INTERFACE
import type {
  ProfitGroupByCategoryInterface,
  ProfitDateRangeInterface,
  ProfitInterface,
} from "~/interfaces/profits.interface";

// IMPORT QUERY'S
import { GET_PROFITS_GROUP_BY_CATEGORY } from "~/graphql/query/profits.query";

// IMPORT MUTATIONS
import {
  CLONE_PROFITS,
  REMOVE_PROFITS,
  PUBLISH_PROFITS,
  DRAFT_PROFITS,
} from "~/graphql/mutations/profits.mutation";

import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "profits-items-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class ProfitsItemsListScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION PROMO
  @Ref("animationPromo") animationPromo: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APP INSTANCE
  public $app: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // ANIMATIONS LOTTIE
  public animationProfit: any = AnimationProfit;

  // PROFITS DEFAULT VALUES
  public profitsGroupByCategory: Array<ProfitGroupByCategoryInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();
  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: CLONE_PROFITS,
        REMOVE_MUTATION: REMOVE_PROFITS,
        PUBLISH_MUTATION: PUBLISH_PROFITS,
        DRAFT_MUTATION: DRAFT_PROFITS,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }

  public created() {
    this.setProfitsGroupByCategory();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PROFITS
  public async setProfitsGroupByCategory() {
    try {
      // GET ALL PROFITS
      const { data } = await this.$apollo.query({
        query: GET_PROFITS_GROUP_BY_CATEGORY,
        fetchPolicy: "no-cache",
      });

      // SET PROFITS TO VARIABLE
      this.profitsGroupByCategory = data.profitsGroupByCategory;
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
          { profitId: itemID },
          this.setProfitsGroupByCategory
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { profitId: itemID },
          this.setProfitsGroupByCategory
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { profitId: itemID },
          status!,
          this.setProfitsGroupByCategory
        );
        return true;
    }
  };

  // GO TO UPDATE PROFITS BY CATEGORY
  public goUpdate(categoryID: string) {
    this.$router.push(`/profits/items/update/${categoryID}`);
  }

  // GO TO CREATE PROFITS
  public goCreate() {
    this.$router.push(`/profits/items/create`);
  }

  // GET FORMAT DATE
  public getFormatDateRange(date: ProfitDateRangeInterface): string {
    const monthStart = this.$app.$moment(date.start).month();
    const monthEnd = this.$app.$moment(date.end).month();

    let dateFinal = "";

    monthStart === monthEnd
      ? (dateFinal = `Del ${this.$app
          .$moment(date.start)
          .format("D")} al ${this.$app
          .$moment(date.end)
          .format("D")} de ${this.$app.$moment(date.end).format("MMMM")}`)
      : (dateFinal = `Del ${this.$app
          .$moment(date.start)
          .format("D")} de ${this.$app
          .$moment(date.start)
          .format("MMMM")} al ${this.$app
          .$moment(date.end)
          .format("D")} de ${this.$app.$moment(date.end).format("MMMM")}`);

    return dateFinal;
  }

  public getMonth(month: number): string {
    return this.$app
      .$moment()
      .month(month - 1)
      .format("MMMM");
  }
}

export default ProfitsItemsListScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="11">
      <client-only>
        <v-card
          width="100%"
          height="180px"
          rounded="xl"
          class="card-principal-container pa-0 ma-0"
          color="#12539b"
          flat
        >
          <v-card-text>
            <v-row align-content="center" justify="space-between">
              <v-col
                cols="6"
                class="card-principal-info-container text-left d-flex flex-column align-self-center"
              >
                <p
                  class="text-h5 text-uppercase text-white font-weight-bold ml-10"
                >
                  Lista de beneficios,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus beneficios por categoría de una
                  manera mas sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-5 ml-10 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Beneficios"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="300px"
                  height="360px"
                  :loop="true"
                  ref="animationPromo"
                  :animationData="animationProfit"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5" justify="start" align-content="center">
    <v-col cols="3">
      <v-text-field
        class="ml-5"
        prepend-inner-icon="mdi-magnify"
        rounded="xl"
        density="compact"
        variant="solo"
        label="Buscar Beneficio"
      />
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="start">
    <v-col
      cols="12"
      v-for="(profitGroup, i) in profitsGroupByCategory"
      :key="i"
    >
      <div class="banner-profit-category pl-2 pr-15">
        <v-avatar class="mr-5" size="75">
          <v-img
            width="100%"
            height="100%"
            :src="profitGroup.category.pictures.thumbnail"
            cover
          />
        </v-avatar>
        <h3 class="text-white text-uppercase">
          Beneficios de categoría - {{ profitGroup.category.name }}
        </h3>
        <v-spacer />
        <v-btn
          width="80"
          class="text-caption mx-3"
          variant="outlined"
          color="white"
          rounded="xl"
          density="compact"
          text="Editar"
          @click="goUpdate(profitGroup.category._id!)"
        />
      </div>
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item
          v-for="profit in profitGroup.profits"
          :key="profit._id"
        >
          <v-card width="250" height="300" rounded="xl" class="pa-0 mx-4">
            <v-card-text class="pa-0">
              <v-row
                class="my-0"
                align-content="center"
                justify="center"
                no-gutters
              >
                <v-col cols="12">
                  <div
                    class="profit-card-image pa-5"
                    :style="`background-color: ${profit.color}`"
                  >
                    <v-img
                      v-if="profit.picture || profit.pictureImageDetail?.image"
                      width="100%"
                      height="100%"
                      :src="profit.picture ?? profit.pictureImageDetail?.image"
                      contain
                    />
                    <p v-else>{{ profit.name }}</p>
                    <item-action-component
                      :item="profit"
                      :onItemAction="itemAction"
                      :update="false"
                      copy
                      status
                      delete
                      variant="flat"
                      color="white"
                      density="comfortable"
                      location="right top"
                      position="absolute"
                      class="mt-2 mr-2"
                    ></item-action-component>
                  </div>
                </v-col>
                <v-col cols="12" class="profit-card-info pa-3 text-left">
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="profit-card-icon"
                      :style="`background-color: ${profit.color}`"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-cash
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">
                        Devolución
                      </p>
                      <p class="my-0 text-caption">
                        RD${{ profit.devolution }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="profit-card-icon"
                      :style="`background-color: ${profit.color}`"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-percent
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">
                        Porcentaje
                      </p>
                      <p class="my-0 text-caption">{{ profit.percent }}%</p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="profit-card-icon"
                      :style="`background-color: ${profit.color}`"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-alarm
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Fecha</p>
                      <p class="my-0 text-caption">
                        {{ getFormatDateRange(profit.date) }}
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

.profit-card-image {
  width: 95%;
  height: 120px;
  margin: 5px auto 0 auto;
  border-radius: 20px;
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

.profit-card-info {
  background-color: #ffffff;
  color: #535353;

  .profit-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .profit-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }
}

.banner-profit-category {
  height: 90px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}
</style>
