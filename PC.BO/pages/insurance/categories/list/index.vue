<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationCategories from "~/assets/animations/categories-animation.json";

// IMPORT INTERFACE
import type { CategoriesInterface } from "~/interfaces/categories.interface";

import { useCategoryStore } from "~/features/categories/store/categoryStore.factory";
import type { CategoryStorePort } from "~/features/categories/store/categoryStore.port";

import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";
import { useCategoryActions } from "~/composables/categoryActions";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "insurance-categories-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class InsuranceCategoriesListScreen extends Vue {
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
  public animationCategories: any = AnimationCategories;

  // SLIDER DEFAULT VALUES
  public categories: Array<CategoriesInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public categoryStatusComposable: ReturnType<typeof useCategoryActions> =
    useCategoryActions();
  public async mounted() {
    this.categoryStatusComposable.init(this.$apollo, this.$bus, this.$router);
  }

  public created() {
    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });

    this.categoryStore = useCategoryStore(this.$apollo);
    this.setCategories();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET CATEGORIES
  public async setCategories() {
    try {
      await this.categoryStore.loadCategories("category::insurance");
      this.categories = this.categoryStore.state.categories;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO UPDATE SLIDER
  public goUpdate(categoryID: string) {
    this.$router.push(`/insurance/categories/update/${categoryID}`);
  }

  // GO TO CREATE SLIDER
  public goCreate() {
    this.$router.push(`/insurance/categories/create`);
  }

  // GET CATEGORIES FOR TARGET
  public get categoriesForTarget(): Array<CategoriesInterface> {
    const categories = this.categories;
    const categoriesInsurance = categories.filter(
      (category: CategoriesInterface) =>
        category.target === "categories::insurance"
    );

    return categoriesInsurance;
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
export default InsuranceCategoriesListScreen;
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
                  Lista de categorías de Seguros,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus categorías de para tu empresa de
                  una manera mas sencilla!
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
                  width="400px"
                  height="400px"
                  :loop="true"
                  :animationData="animationCategories"
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
    <!-- CATEGORIES CARD -->
    <v-col v-for="category in categories" :key="category._id" cols="4">
      <v-card rounded="xl" color="#12539b">
        <v-toolbar color="transparent">
          <v-toolbar-title
            class="text-subtitle-2 text-caption text-uppercase text-white font-weight-bold"
            :text="category.name"
          >
            <v-tooltip activator="parent" location="bottom">{{
              category.name
            }}</v-tooltip>
          </v-toolbar-title>
          <template v-slot:append>
            <item-action-component
              :item="category"
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
              category.pictures.responsive ??
              category.pictures.responsiveImageDetail?.image
            "
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
    margin-top: -130px;
    margin-right: -20px;
  }
}
</style>
