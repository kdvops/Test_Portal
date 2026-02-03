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
import {
  CLONE_PRODUCT_ADJUDICATED,
  REMOVE_PRODUCT_ADJUDICATED,
  PUBLISH_ADJUDICATED,
  DRAFT_ADJUDICATED,
} from "~/graphql/mutations/adjudicated.mutation";

// IMPORT QUERY'S
import { GET_ADJUDICATED_BY_GROUP_CATEGORY } from "~/graphql/query/adjudicated.query";

// IMPORT INTERFACE
import type {
  AdjudicatedProductsGroup,
  ProductAdjudicatedInterface,
  TypeStatusAdjudicated,
} from "~/interfaces/adjudicated.interface";

import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";
import type { ImageDetailInterface } from "~/interfaces/detailed-image.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "adjudicated-products-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class AdjudicatedProductsListScreen extends Vue {
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
  public adjudicatedProductsGroup: Array<AdjudicatedProductsGroup> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();
  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: CLONE_PRODUCT_ADJUDICATED,
        REMOVE_MUTATION: REMOVE_PRODUCT_ADJUDICATED,
        PUBLISH_MUTATION: PUBLISH_ADJUDICATED,
        DRAFT_MUTATION: DRAFT_ADJUDICATED,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }

  public created() {
    this.setAdjudicatedProductsByParentCategory();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PRODUCTS BY PARENT CATEGORY
  public async setAdjudicatedProductsByParentCategory() {
    try {
      // PARENT KEY PAYLOAD
      const parentTarget = {
        parentTarget: "category::adjudicated",
      };

      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_ADJUDICATED_BY_GROUP_CATEGORY,
        variables: parentTarget,
        fetchPolicy: "no-cache",
      });

      // SET PRODUCTS
      this.adjudicatedProductsGroup =
        data.findAdjudicatedProductsGroupByCategory;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO CREATE SCREEN
  public goCreate() {
    this.$router.push("/adjudicated/products/create");
  }

  // GO TO UPDATE SCREEN
  public goUpdate(productID: string) {
    this.$router.push(`/adjudicated/products/update/${productID}`);
  }

  // GET STATUS PRODUCT
  public getStatus(status: TypeStatusAdjudicated) {
    let defaultValue = { name: "Disponible", color: "green" };
    switch (status) {
      case "soon":
        defaultValue = { name: "Próximamente", color: "orange" };
        break;
      case "available":
        defaultValue = { name: "Disponible", color: "green" };
        break;
      case "unavailable":
        defaultValue = { name: "No Disponible", color: "red" };
        break;
      default:
        defaultValue = { name: "Disponible", color: "green" };
        break;
    }
    return defaultValue;
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "delete":
        this.generalStatusComposable!.removeItem(
          { adjudicatedId: itemID },
          this.setAdjudicatedProductsByParentCategory
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { adjudicatedId: itemID },
          this.setAdjudicatedProductsByParentCategory
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { adjudicatedId: itemID },
          status!,
          this.setAdjudicatedProductsByParentCategory
        );
        return true;
    }
    return false;
  };

  public picturesImageDetailed(product: ProductAdjudicatedInterface) {
    product.picturesImageDetail = product.picturesImageDetail.concat(
      product.pictures
        .filter((picture) => picture.image)
        .map(
          (picture) =>
            ({
              _id: picture._id,
              image: picture.image,
              altText: null,
              isCover: picture.isCover,
            } as ImageDetailInterface)
        )
    );

    return product.picturesImageDetail;
  }
}

export default AdjudicatedProductsListScreen;
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
                  Lista de productos,
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
                  text="Crear producto"
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
    <v-col cols="12" v-for="(group, i) in adjudicatedProductsGroup" :key="i">
      <div class="banner-adjudicated-category pl-2">
        <v-avatar
          size="70"
          color="white"
          :image="group.category.pictures.thumbnail"
        ></v-avatar>
        <h3 class="text-white text-uppercase ml-5">
          Categoría - {{ group.category.name }}
        </h3>
      </div>
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item
          v-for="product in group.products"
          :key="product._id"
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
                  <div class="adjudicated-card-image pa-0">
                    <v-img
                      width="100%"
                      height="100%"
                      class="rounded-xl"
                      :src="(product.pictures?.[0]?.image as string)?.trim?.()? (product.pictures?.[0]?.image as string):product.picturesImageDetail?.[0]?.image"
                      cover
                    >
                      <item-action-component
                        :item="{ ...product, status: product.item_status }"
                        :onItemAction="itemAction"
                        update
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
                    </v-img>
                  </div>
                </v-col>
                <v-col cols="12" class="adjudicated-card-info pa-3 text-left">
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="adjudicated-card-icon"
                      style="background-color: #12539b"
                      :color="getStatus(product.status).color"
                      size="20"
                    >
                      mdi-circle
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Estado</p>
                      <p class="my-0 text-caption">
                        {{ getStatus(product.status).name }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="adjudicated-card-icon"
                      style="background-color: #12539b"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Nombre</p>
                      <p class="my-0 text-caption">
                        {{ product.name }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="adjudicated-card-icon"
                      style="background-color: #12539b"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">
                        Subtitulo
                      </p>
                      <p class="my-0 text-caption">
                        {{ product.price }}
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
    margin-top: -80px;
  }

  .card-principal-animation {
    margin-top: -50px;
    margin-right: -20px;
  }
}

.adjudicated-card-image {
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

.adjudicated-card-info {
  background-color: #ffffff;
  color: #535353;

  .adjudicated-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .adjudicated-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }
}

.banner-adjudicated-category {
  height: 90px;
  border-radius: 100px;
  display: flex;
  justify-content: start;
  align-items: center;
  background-color: #12539b;
}
</style>
