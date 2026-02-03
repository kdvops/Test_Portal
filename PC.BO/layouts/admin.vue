<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT INTERFACES
import type { SnackbarOptions } from "~/interfaces/snackbar.interface";
import type { DrawerOptions } from "~/interfaces/drawer.interface";
import type { Route } from "~/interfaces/route.interface";
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT COMPONENTS
import AppDrawerComponent from "~/components/drawer/index.vue";
import AppHeaderComponent from "~/components/header/index.vue";
import AppSnackbarComponent from "~/components/snackbar/index.vue";

// IMPORT QUERY'S
import { GET_ALL_TARGETS } from "~/graphql/query/targets.query";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "admin-layout",
  components: {
    // COMPONENTS CUSTOM APP
    "app-header-component": AppHeaderComponent,
    "app-drawer-component": AppDrawerComponent,
    "app-snackbar-component": AppSnackbarComponent,
  },
})
class AdminLayout extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // APOLLO INSTANCE
  public override $apollo: any;

  // SNACKBAR DEFAULT OPTIONS
  public snackbar: SnackbarOptions = {
    show: false,
    btn: "",
    y: "bottom",
    x: "",
    mode: "",
    timeout: 0,
    text: "",
    color: "black lighten-2",
  };

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // DRAWER OPTIONS
  public drawerOptions: DrawerOptions = {
    show: true,
    rail: true,
    absolute: false,
    right: false,
    expandOnHover: false,
    app: false,
    routes: [],
    routesUserConfig: [],
  };

  // CICLE LIFE METHODS
  public created() {
    // SET EMIT EVENTS
    this.setEmitEvent();

    // SET TARGETS
    this.setTargets();
  }

  public mounted() {
    // INICIAR MONITOREO DE INACTIVIDAD
    this.startInactivityMonitoring();
  }

  public beforeUnmount() {
    // DETENER MONITOREO DE INACTIVIDAD
    this.stopInactivityMonitoring();
  }

  ///////////////////
  /// EMIT EVENTS ///
  ///////////////////

  // SET EMIT EVENT
  private setEmitEvent() {
    this.$bus.$on("showSnackbar", (options: SnackbarOptions) => {
      this.showSnackbar(options);
    });
    this.$bus.$on("handleError", (error: string) => {
      this.handleError(error);
    });
  }

  // EMI SHOW SNACKBAR
  public showSnackbar(snackbar: SnackbarOptions) {
    this.snackbar = { ...this.snackbar, ...snackbar, show: true };
    setTimeout(() => {
      this.closeSnackbar();
    }, this.snackbar.timeout);
  }

  // EMIT HANDLE ERROR
  public handleError(error: string) {
    const snackbar = {
      show: true,
      btn: "",
      y: "bottom",
      x: "center",
      mode: "",
      timeout: 6000,
      text: error,
      color: "red darken-3",
    };
    this.showSnackbar(snackbar);
  }

  // EMIT CLOSE SNACKBAR
  public closeSnackbar() {
    this.snackbar = {
      show: false,
      btn: "",
      y: "bottom",
      x: "",
      mode: "",
      timeout: 0,
      text: "",
      color: "black lighten-2",
    };
  }

  // LOAD TARGETS AND BUILD ROUTES
  private async setTargets() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_ALL_TARGETS,
        fetchPolicy: "no-cache",
      });

      const routes = data.findAllTargets.map((target: TargetInterface) => ({
        name: target.name,
        icon: target.icon,
        path: `/targets/${target._id}/categories/list`,
        disabled: false,
        children: [
          {
            name: "Categorías",
            icon: "mdi-apps",
            path: `/targets/${target._id}/categories/list`,
            disabled: false,
          },
          {
            name: "Posts",
            icon: "mdi-file-document",
            path: `/targets/${target._id}/post/list`,
            disabled: false,
          },
        ],
      }));

      // SET TARGETS TO DRAWER OPTIONS
      this.drawerOptions.routes = routes;
    } catch (error) {
      console.error("Error loading targets:", error);
    }
  }

   ///////////////////////////////
  /// INACTIVITY MONITORING ///
  ///////////////////////////////

  // INICIAR MONITOREO DE INACTIVIDAD
  private startInactivityMonitoring() {
    const { startInactivityMonitoring } = useInactivity();
    startInactivityMonitoring();
  }

  // DETENER MONITOREO DE INACTIVIDAD
  private stopInactivityMonitoring() {
    const { stopInactivityMonitoring } = useInactivity();
    stopInactivityMonitoring();
  }
}
export default AdminLayout;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-app>
    <v-layout full-height class="layout-admin">
      <v-main class="layout-admin-main">
        <!-- CUSTOM APP DRAWER COMPONENT -->
        <app-drawer-component :options="drawerOptions" />

        <!-- CUSTOM APP HEADERS COMPONENT -->
        <app-header-component />

        <!-- CUSTOM APP SNACKBAR COMPONENT -->
        <app-snackbar-component :options="snackbar" @close="closeSnackbar" />

        <!-- LAYOUT MAIN APP -->
        <v-container fluid class="pa-0 layout-admin-container">
          <slot @showSnackbar="showSnackbar" @handleError="handleError" />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>

<style lang="scss">
.layout-admin {
  align-items: end;

  .layout-admin-main {
    height: 93vh;
    --v-layout-top: 5px !important;

    .layout-admin-container {
      border-radius: 20px 0 0 0;
      background-color: #e0e0e0;
      height: 96vh;
      overflow-y: scroll;

      &::-webkit-scrollbar {
        display: none !important;
      }
    }
  }
}
</style>
