<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationProductsCategories from "~/assets/animations/products-animation.json";

// IMPORT INTERFACE
import type { CategoriesByParentInterface } from "~/interfaces/categories.interface";

import { useCategoryStore } from "~/features/categories/store/categoryStore.factory";
import type { CategoryStorePort } from "~/features/categories/store/categoryStore.port";

import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";
import { useCategoryActions } from "~/composables/categoryActions";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "products-categories-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class ProductsCategoriesListScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public override $apollo: any;

  public categoryStore!: CategoryStorePort;

  // ANIMATIONS LOTTIE
  public animationProductsCategories: any = AnimationProductsCategories;

  // CATEGORIES DEFAULT VALUES
  public categories: Array<CategoriesByParentInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public categoryStatusComposable: ReturnType<typeof useCategoryActions> =
    useCategoryActions();
  public async mounted() {
    this.categoryStatusComposable.init(this.$apollo, this.$bus, this.$router);
  }

  public created() {
    this.categoryStore = useCategoryStore(this.$apollo);
    this.setCategories();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET CATEGORIES
  public async setCategories() {
    try {
      this.categories = await this.categoryStore.loadCategoriesByParent(
        "category::products"
      );
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO UPDATE SLIDER
  public goUpdate(categoryID: string) {
    navigateTo(`/products/categories/update/${categoryID}`);
  }

  // GO TO CREATE SLIDER
  public goCreate() {
    navigateTo(`/products/categories/create`);
  }

  // GET NAME PARENT KEY
  public getNameParentTarget(parent: string) {
    switch (parent) {
      case "category::cards":
        return "Tarjetas";
      case "category::accounts":
        return "Cuentas";
      case "category::loans":
        return "Prestamos";
      case "category::deposits":
        return "Depósitos";
      case "category::points-bsc":
        return "Puntos BSC";
      case "category::global":
        return "Categorias Globales o Padres";
      default:
        return "Desconocido";
    }
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "copy":
        this.categoryStatusComposable!.cloneItem(itemID, this.setCategories);
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.categoryStatusComposable!.switchStatus(
          itemID,
          status!,
          this.setCategories
        );
        return true;
    }
    return false;
  };
}
export default ProductsCategoriesListScreen;
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
          color="#00a44f"
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
                  Lista de categorías de productos,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus categorías de productos de una
                  manera mas sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-3 ml-9 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Categoría"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="350px"
                  height="350px"
                  :loop="true"
                  :animationData="animationProductsCategories"
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
        label="Buscar Categoría"
      />
    </v-col>
  </v-row>
  <v-row class="px-15 pb-10" justify="start" align-content="center">
    <v-col v-for="category in categories" :key="category.parent" cols="12">
      <div class="banner-categories-by-parent pl-2 pr-15">
        <v-avatar class="mr-5" size="75" color="#ffffff">
          <v-img width="100%" height="100%" cover />
        </v-avatar>
        <h3 class="text-white text-uppercase">
          Categorías de {{ getNameParentTarget(category.parent) }}
        </h3>
      </div>
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item
          v-for="subcategory in category.subcategories"
          :key="subcategory._id"
        >
          <v-card width="250" rounded="xl" class="pa-0 mx-4" color="#00a44f">
            <v-toolbar color="transparent">
              <v-toolbar-title
                class="text-subtitle-2 text-caption text-uppercase text-white font-weight-bold"
                :text="subcategory.name"
              >
                <v-tooltip activator="parent" location="bottom">{{
                  subcategory.name
                }}</v-tooltip>
              </v-toolbar-title>
              <template v-slot:append>
                <item-action-component
                  :item="subcategory"
                  :onItemAction="itemAction"
                  update
                  copy
                  status
                ></item-action-component>
              </template>
            </v-toolbar>
            <v-card-text class="pa-0">
              <v-img
                width="100%"
                height="200px"
                :src="
                  subcategory.pictures.responsive ??
                  subcategory.pictures.responsiveImageDetail?.image
                "
                cover
              />
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
    margin-top: -110px;
  }

  .card-principal-animation {
    margin-top: -80px;
    margin-right: -20px;
  }
}

.banner-categories-by-parent {
  height: 90px;
  border-radius: 100px;
  display: flex;
  justify-content: start;
  align-items: center;
  background-color: #00a44f;
}
</style>
