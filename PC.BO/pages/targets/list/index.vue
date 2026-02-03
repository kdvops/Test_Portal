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
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT QUERY'S
import { GET_ALL_TARGETS } from "~/graphql/query/targets.query";

import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";
import { useGeneralActions } from "~/composables/generalActions";

// IMPORT MUTATIONS
import {
  ENABLE_TARGET,
  DISABLE_TARGET,
} from "~/graphql/mutations/targets.mutation";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "targets-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class TargetsListScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public override $apollo: any;

  // ANIMATIONS LOTTIE
  public animationCategories: any = AnimationCategories;

  // SLIDER DEFAULT VALUES
  public targets: Array<TargetInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();
  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: null,
        REMOVE_MUTATION: null,
        PUBLISH_MUTATION: ENABLE_TARGET,
        DRAFT_MUTATION: DISABLE_TARGET,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }

  public created() {
    this.setTargets();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET TARGETS
  public async setTargets() {
    try {
      // GET ALL TARGETS
      const { data } = await this.$apollo.query({
        query: GET_ALL_TARGETS,
        fetchPolicy: "no-cache",
      });

      // SET TARGETS
      this.targets = data.findAllTargets;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        // DETERMINAR QUÉ MUTACIÓN USAR BASÁNDOSE EN EL STATUS SELECCIONADO
        // Si el usuario selecciona 'publish', usar ENABLE_TARGET
        // Si el usuario selecciona 'draft', usar DISABLE_TARGET
        await this.generalStatusComposable!.switchStatus(
          { targetId: itemID },
          status!,
          null
        );
        // RECARGAR LA LISTA DE TARGETS DESPUÉS DE CAMBIAR EL ESTADO
        await this.setTargets();
        return true;
    }
    return false;
  };

  // GO TO CREATE SCREEN
  public goCreate() {
    this.$router.push("/targets/create");
  }

  // GO TO UPDATE SCREEN
  public goUpdate(targetID: string) {
    this.$router.push(`/targets/update/${targetID}`);
  }
}

export default TargetsListScreen;
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
                  Lista de Modulos
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus modulos de una manera mas sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-3 ml-9 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Target"
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
  <v-row class="pa-12">
    <v-col cols="4" v-for="(target, i) in targets" :key="i">
      <v-card rounded="xl" class="pa-0 mx-4">
        <v-card-text class="pa-0">
          <v-row
            class="my-0"
            align-content="center"
            justify="center"
            no-gutters
          >
            <v-col cols="4">
              <div
                class="target-card-image pa-0 d-flex justify-center align-center"
                :style="{ backgroundColor: target.color }"
              >
                <v-icon class="target-card-icon" color="#ffffff" size="100">
                  {{ target.icon }}
                </v-icon>
                <item-action-component
                  :item="{ ...target, name: target.name, status: target.status || 'publish' }"
                  :onItemAction="itemAction"
                  update
                  status
                  variant="flat"
                  color="white"
                  density="comfortable"
                  location="right top"
                  position="absolute"
                  class="mt-2 mr-2"
                ></item-action-component>
              </div>
            </v-col>
            <v-col cols="8" class="target-card-info pa-3 text-left">
              <div class="my-2 d-flex align-center">
                <v-icon
                  class="target-card-icon"
                  :style="{ backgroundColor: target.color }"
                  color="#ffffff"
                  size="20"
                >
                  mdi-folder
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">ID</p>
                  <p class="my-0 text-caption">
                    {{ target._id }}
                  </p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <v-icon
                  class="target-card-icon"
                  :style="{ backgroundColor: target.color }"
                  color="#ffffff"
                  size="20"
                >
                  mdi-text-box
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Nombre</p>
                  <p class="my-0 text-caption">
                    {{ target.name }}
                  </p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <v-icon
                  class="target-card-icon"
                  :style="{ backgroundColor: target.color }"
                  color="#ffffff"
                  size="20"
                >
                  mdi-text
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Slug</p>
                  <p class="my-0 text-caption">
                    {{ target.slug }}
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
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

.target-card-image {
  width: 95%;
  height: 94%;
  margin: 5px auto 0 auto;
  border-radius: 20px;
  color: #535353;
  align-items: center;
  text-align: center;
  justify-content: center;

  p {
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 30px;
  }
}

.target-card-info {
  background-color: #ffffff;
  color: #535353;

  .target-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .target-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }
}
</style>
