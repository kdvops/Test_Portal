<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationShortcut from "~/assets/animations/shortcuts-animation.json";

// IMPORT INTERFACE
import type {
  ShortcutsGroupByTargetInterface,
  ShortcutInterface,
  TargetShortcut,
} from "~/interfaces/shortcuts.interface";
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT QUERY'S
import { GET_SHORTCUTS_GROUP_BY_TARGET } from "~/graphql/query/shortcuts.query";

// IMPORT MUTATIONS
import { REMOVE_SHORTCUT } from "~/graphql/mutations/shortcuts.mutation";

// IMPORT LODASH
import _ from "lodash";

// COMPOSABLES
import { useTargetManager } from "~/composables/useTargetManager";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "shortcuts-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
  },
})
class ShortcutsListScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION SHORTCUTS
  @Ref("animationShortcuts") animationShortcuts: any;

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
  public override $apollo: any;

  // ANIMATIONS LOTTIE
  public animationShortcut: any = AnimationShortcut;

  // TARGET MANAGER
  public targetManager = useTargetManager();

  // DEFAULT SHORTCUTS ARRAY VALUES
  public shortcutsGroupByTarget: Array<ShortcutsGroupByTargetInterface> = [];

  // TARGETS DINÁMICOS CARGADOS
  public dynamicTargets: Array<TargetInterface> = [];

  // DIALOG DELETE SHORTCUTS OPTIONS
  public dialogRemove: { show: boolean; shortcutID: string; loading: boolean } =
    {
      show: false,
      shortcutID: "",
      loading: false,
    };

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public async created() {
    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });

    // CARGAR TARGETS DINÁMICOS
    await this.loadDynamicTargets();

    // CARGAR SHORTCUTS
    await this.setShortcuts();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // CARGAR TARGETS DINÁMICOS
  public async loadDynamicTargets() {
    try {
      await this.targetManager.loadDynamicTargets(this.$apollo);
      this.dynamicTargets = this.targetManager.dynamicTargets;
    } catch (error) {
      console.error("Error loading dynamic targets:", error);
      this.dynamicTargets = [];
    }
  }

  // SET SHORTCUTS
  public async setShortcuts() {
    try {
      // GET ALL SHORTCUTS
      const { data } = await this.$apollo.query({
        query: GET_SHORTCUTS_GROUP_BY_TARGET,
        fetchPolicy: "no-cache",
      });

      // SET SHORTCUTS TO VARIABLE
      const shortcutsData = data.findShortcutsGroupByTarget;

      // SET SHORTCUTS DIRECTAMENTE (LA API YA TRAE TODO)
      this.shortcutsGroupByTarget = shortcutsData;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GET NAME TARGETS
  public getNameTarget(target: TargetShortcut) {
    // DETECTAR SI TARGET ES UN ID DINÁMICO (24 caracteres hexadecimales)
    if (target && this.isDynamicTargetId(target)) {
      const dynamicTarget = this.dynamicTargets.find((dt) => dt._id === target);
      if (dynamicTarget) {
        return {
          name: dynamicTarget.name,
          icon: dynamicTarget.icon,
        };
      }
    }

    // TARGETS ESTÁTICOS
    if (target) {
      switch (target) {
        case "targetHome":
        case "target::home":
          return "Home";
        case "targetBusiness":
        case "target::business":
          return "Negocios";
        case "targetEnterprise":
        case "target::enterprise":
          return "Empresa";
        case "targetInsurance":
        case "target::insurance":
          return "Seguros";
        default:
          return "Sin nombre";
      }
    }

    return "Sin nombre";
  }

  // DETECTAR SI UN TARGET ES UN ID DINÁMICO
  public isDynamicTargetId(target: string): boolean {
    // Un ID de MongoDB tiene 24 caracteres hexadecimales
    return /^[0-9a-fA-F]{24}$/.test(target);
  }

  // OPEN DIALOG ALERT REMOVE SHORTCUTS
  public openDialogAlertRemove(shortcutID: string) {
    this.dialogRemove.show = true;
    this.dialogRemove.shortcutID = shortcutID;
    this.dialogRemove.loading = false;
  }

  // CLOSE DIALOG ALERT REMOVE SHORTCUTS
  public closeDialogAlertRemove() {
    this.dialogRemove.show = false;
    this.dialogRemove.shortcutID = "";
    this.dialogRemove.loading = false;
  }

  // REMOVE SHORTCUT
  public async removeShortcut() {
    // SET LOADING
    this.dialogRemove.loading = true;

    try {
      // REMOVE SHORTCUT
      await this.$apollo.mutate({
        mutation: REMOVE_SHORTCUT,
        variables: {
          shortcutsId: this.dialogRemove.shortcutID,
        },
      });

      // SET LOADING
      this.dialogRemove.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Acceso directo eliminado correctamente!",
        color: "success",
        timeout: 6000,
      });

      // CLOSE DIALOG
      this.closeDialogAlertRemove();

      // RELOAD SHORTCUTS
      await this.setShortcuts();
    } catch (err) {
      // SET LOADING
      this.dialogRemove.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO UPDATE SHORTCUTS
  public goToUpdate(shortcutID: string) {
    this.$router.push(`/settings/shortcuts/update/${shortcutID}`);
  }
}

export default ShortcutsListScreen;
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
                  Lista de accesos directos,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus accesos directos de una manera mas
                  sencilla!
                </p>
                <v-btn
                  @click="$router.push('/settings/shortcuts/create')"
                  width="130"
                  variant="outlined"
                  class="mt-5 ml-10 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Acceso"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="300px"
                  height="300px"
                  :loop="true"
                  ref="animationPromo"
                  :animationData="animationShortcut"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="start">
    <v-col cols="12" v-for="(group, i) in shortcutsGroupByTarget" :key="i">
      <div class="banner-shortcuts-target pl-2 pr-15">
        <h3 class="text-white text-uppercase d-flex align-center">
          <v-icon
            color="#ffffff"
            class="mr-2"
            size="24"
          >
            {{
              isDynamicTargetId(group.target)
                ? getNameTarget(group.target).icon
                : "mdi-folder"
            }}
          </v-icon>
          Tabs ubicados en -
          {{
            isDynamicTargetId(group.target)
              ? getNameTarget(group.target).name
              : getNameTarget(group.target)
          }}
        </h3>
      </div>
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item
          v-for="shortcut in group.shortcuts"
          :key="shortcut._id"
        >
          <v-card width="300" height="95" rounded="xl" class="pa-0 mx-4">
            <v-card-text class="pa-0">
              <v-row
                class="my-0"
                align-content="center"
                justify="center"
                no-gutters
              >
                <v-col cols="4" class="d-flex justify-center h-100">
                  <v-icon
                    class="pa-10 mt-2 rounded-xl"
                    color="#ffffff"
                    size="50"
                    style="background: #12539b"
                  >
                    {{ shortcut.icon }}
                  </v-icon>
                </v-col>
                <v-col cols="8" class="shortcuts-card-info pl-1 text-left">
                  <div class="mt-2 mb-0 d-flex align-center">
                    <v-icon
                      class="shortcuts-card-icon"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">
                        Nombre de tab
                      </p>
                      <p class="my-0 text-caption">
                        {{ shortcut.name }}
                      </p>
                    </div>
                  </div>
                  <div class="d-flex align-center">
                    <v-icon
                      class="shortcuts-card-icon"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-card
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">
                        Ubicación
                      </p>
                      <p class="my-0 text-caption">
                        {{ getNameTarget(shortcut.target) }}
                      </p>
                    </div>
                  </div>
                  <div>
                    <v-btn
                      @click="goToUpdate(shortcut._id!)"
                      color="#12539b"
                      density="compact"
                      location="right top"
                      position="absolute"
                      class="mt-2 mr-2"
                      style="z-index: 10"
                      icon
                    >
                      <v-icon color="#ffffff" size="20"> mdi-pencil </v-icon>
                    </v-btn>
                    <v-btn
                      @click="openDialogAlertRemove(shortcut._id!)"
                      color="error"
                      density="compact"
                      location="right bottom"
                      position="absolute"
                      class="mb-2 mr-2"
                      style="z-index: 10"
                      icon
                    >
                      <v-icon color="#ffffff" size="20">
                        mdi-delete
                      </v-icon>
                    </v-btn>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-col>
  </v-row>

  <!-- DIALOG DELETE SHORTCUTS -->
  <v-dialog v-model="dialogRemove.show" max-width="480">
    <v-card class="" rounded="xl" color="primary">
      <v-card-item>
        <v-card-title class="text-body-1 text-orange">Advertencia</v-card-title>
        <v-card-subtitle class="text-caption"
          >Una vez eliminado se pierde la imagen, y datos de este
          item!</v-card-subtitle
        >
      </v-card-item>
      <v-card-text>
        <p class="my-2">
          <strong>¿Estas seguro de eliminar el acceso directo?</strong>
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text="Cancelar"
          variant="text"
          @click="closeDialogAlertRemove()"
        />
        <v-spacer />
        <v-btn
          text="Aceptar"
          variant="text"
          @click="removeShortcut()"
          :loading="dialogRemove.loading"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -30px;
  }

  .card-principal-animation {
    margin-top: -90px;
    margin-right: -20px;
  }
}

.shortcuts-card-image {
  width: 100px;
  height: 180px;
  display: flex;
  align-items: center;
  margin: 5px auto 0 auto;
  background: #12539b;
  color: #ffffff;
  position: relative;
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

.shortcuts-card-info {
  position: relative;
  background-color: #ffffff;
  color: #535353;

  .shortcuts-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .shortcuts-card-icon {
    width: 30px !important;
    height: 30px !important;
    background-color: #00a44f;
    border-radius: 100px;
  }
}

.banner-shortcuts-month {
  height: 90px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}

.banner-shortcuts-target {
  height: 90px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}
</style>
