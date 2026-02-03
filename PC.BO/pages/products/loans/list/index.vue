<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationProductsCards from "~/assets/animations/cards-animation.json";

// IMPORT QUERY'S
import { GET_PRODUCTS_BY_PARENTS_CATEGORY } from "~/graphql/query/products.query";

// IMPORT INTERFACE
import type { ProductInterface } from "~/interfaces/products.interface";

import { useProductActions } from "~/composables/productActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "products-loans-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class ProductsLoansListScreen extends Vue {
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
  public animationProductsCards: any = AnimationProductsCards;

  // PRODUCTS DEFAULT VALUES
  public products: Array<ProductInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public productStatusComposable: ReturnType<typeof useProductActions> =
    useProductActions();
  public async mounted() {
    this.productStatusComposable.init(this.$apollo, this.$bus, this.$router);
  }

  public created() {
    this.setProductsByParentCategory();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PRODUCTS BY PARENT CATEGORY
  public async setProductsByParentCategory() {
    try {
      // PARENT KEY PAYLOAD
      const parentTarget = {
        parentTarget: "category::loans",
      };

      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_PRODUCTS_BY_PARENTS_CATEGORY,
        variables: parentTarget,
        fetchPolicy: "no-cache",
      });

      // SET PRODUCTS
      this.products = data.findProductsByParentTargetCategory;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO CREATE SCREEN
  public goCreate() {
    this.$router.push("/products/loans/create");
  }

  // GO TO UPDATE SCREEN
  public goUpdate(productID: string) {
    this.$router.push(`/products/loans/update/${productID}`);
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "delete":
        this.productStatusComposable!.removeItem(
          itemID,
          this.setProductsByParentCategory
        );
        return true;
      case "copy":
        this.productStatusComposable!.cloneItem(
          itemID,
          this.setProductsByParentCategory
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.productStatusComposable!.switchStatus(
          itemID,
          status!,
          this.setProductsByParentCategory
        );
        return true;
    }
  };
}
export default ProductsLoansListScreen;
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
                  Lista de prestamos,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus productos de una manera mas
                  sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-3 ml-9 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear préstamo"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="350px"
                  height="350px"
                  :loop="true"
                  :animationData="animationProductsCards"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="pa-12">
    <v-col cols="4" v-for="product in products">
      <v-card width="250" rounded="xl" class="pa-0 mx-4" color="#12539b">
        <v-toolbar color="transparent">
          <v-toolbar-title
            class="text-subtitle-2 text-caption text-uppercase text-white font-weight-bold"
            :text="product.name"
          >
            <v-tooltip activator="parent" location="bottom">{{
              product.name
            }}</v-tooltip>
          </v-toolbar-title>
          <template v-slot:append>
            <item-action-component
              :item="product"
              :onItemAction="itemAction"
              update
              delete
              copy
              status
            ></item-action-component>
          </template>
        </v-toolbar>
        <v-card-text class="pa-0">
          <v-img
            width="100%"
            height="200px"
            :src="product.banner ?? product.bannerImageDetail?.image"
            cover
          />
        </v-card-text>
      </v-card>
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
    margin-top: -80px;
    margin-right: -20px;
  }
}
</style>
