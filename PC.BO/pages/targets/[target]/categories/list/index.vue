<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// @ts-nocheck
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
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT QUERY'S
import { GET_TARGET_BY_ID } from "~/graphql/query/targets.query";

import { useCategoryStore } from "~/features/categories/store/categoryStore.factory";
import type { CategoryStorePort } from "~/features/categories/store/categoryStore.port";

import ItemActionComponent, { type ItemActionType } from "~/components/item-action/item-action.vue";
import { useCategoryActions } from "~/composables/categoryActions"

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "target-categories-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class TargetCategoriesListScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM TARGET
  public targetParam = useRoute().params.target;

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

  // TARGET INFO
  public targetInfo: TargetInterface | null = null;

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public categoryActionsComposable: ReturnType<typeof useCategoryActions> =
    useCategoryActions();
  public async mounted() {
    this.categoryActionsComposable.init(this.$apollo, this.$bus, this.$router);
  }

  public created() {
    this.categoryStore = useCategoryStore(this.$apollo);
    this.setTargetInfo();
    this.setCategories();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET TARGET INFO
  public async setTargetInfo() {
    try {
      // GET TARGET INFO
      const { data } = await this.$apollo.query({
        query: GET_TARGET_BY_ID,
        variables: {
          targetId: this.targetParam,
        },
        fetchPolicy: "no-cache",
      });

      // SET TARGET INFO
      this.targetInfo = data.findTargetById;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET CATEGORIES
  public async setCategories() {
    try {
      await this.categoryStore.loadCategoriesByTargetId(
        this.targetParam as string
      );
      this.categories = this.categoryStore.state.categories;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "copy":
        this.categoryActionsComposable!.cloneItem(itemID, this.setCategories);
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.categoryActionsComposable!.switchStatus(
          itemID,
          status!,
          this.setCategories
        );
        return true;
    }
    return false;
  };

  // GO TO CREATE SCREEN
  public goCreate() {
    this.$router.push(`/targets/${this.targetParam}/categories/create`);
  }

  // GO TO UPDATE SCREEN
  public goUpdate(categoryID: string) {
    this.$router.push(
      `/targets/${this.targetParam}/categories/update/${categoryID}`
    );
  }
}
export default TargetCategoriesListScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <div>
    <v-row class="px-5 pt-10" justify="center" align-content="center">
      <v-col cols="11">
        <client-only>
          <v-card
            width="100%"
            height="180px"
            rounded="xl"
            class="card-principal-container pa-0 ma-0"
            :color="targetInfo?.color || '#12539b'"
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
                    {{ targetInfo?.name || "Cargando..." }} - Categorías
                  </p>
                  <p class="text-caption text-white font-weight-light ml-10">
                    Gestiona las categorías de
                    {{ targetInfo?.name || "este target" }} de manera sencilla!
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
                    :animationData="animationCategories"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </client-only>
      </v-col>
    </v-row>

    <v-row class="px-15 pb-10" justify="start" align-content="center">
      <!-- CATEGORIES CARD -->
      <v-col v-for="category in categories" :key="category._id" cols="4">
        <v-card rounded="xl" :color="targetInfo?.color || '#12539b'">
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
              :src="category.pictures.responsive ??
                  category.pictures.responsiveImageDetail?.image"
              cover
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
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

.category-card-image {
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

.category-card-info {
  background-color: #ffffff;
  color: #535353;

  .category-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .category-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }
}
</style>
