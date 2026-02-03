<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationPodcast from "~/assets/animations/podcast-animation.json";

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
  name: "podcast-seasons-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class PodcastSeasonsListScreen extends Vue {
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
  public animationPodcast: any = AnimationPodcast;

  // SLIDER DEFAULT VALUES
  public seasons: Array<CategoriesInterface> = [];

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
    this.setSeasons();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET CATEGORIES
  public async setSeasons() {
    try {
      await this.categoryStore.loadCategories("category::podcast");
      this.seasons = this.categoryStore.state.categories;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO UPDATE SEASON
  public goUpdate(seasonID: string) {
    this.$router.push(`/podcast/seasons/update/${seasonID}`);
  }

  // GO TO CREATE SLIDER
  public goCreate() {
    this.$router.push(`/podcast/seasons/create`);
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "copy":
        this.categoryStatusComposable!.cloneItem(itemID, this.setSeasons);
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.categoryStatusComposable!.switchStatus(
          itemID,
          status!,
          this.setSeasons
        );
        return true;
    }
    return false;
  };
}
export default PodcastSeasonsListScreen;
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
                  Lista de temporadas de podcast,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus temporadas de podcast de una manera
                  mas sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-3 ml-9 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Temporada"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="350px"
                  height="350px"
                  :loop="true"
                  :animationData="animationPodcast"
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
        label="Buscar Temporada"
      />
    </v-col>
  </v-row>
  <v-row class="px-15 pb-10" justify="start" align-content="center">
    <!-- CATEGORIES CARD -->
    <v-col v-for="season in seasons" :key="season._id" cols="4">
      <v-card rounded="xl" color="#00a44f">
        <v-toolbar color="transparent">
          <v-toolbar-title
            class="text-subtitle-2 text-caption text-uppercase text-white font-weight-bold"
            :text="season.name"
          >
            <v-tooltip activator="parent" location="bottom">{{
              season.name
            }}</v-tooltip>
          </v-toolbar-title>
          <template v-slot:append>
            <item-action-component
              :item="season"
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
              season.pictures.responsive ??
              season.pictures.responsiveImageDetail?.image
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
    margin-top: -110px;
  }

  .card-principal-animation {
    margin-top: -80px;
    margin-right: -20px;
  }
}
</style>
