<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator"

// IMPORT COMPONENTS
import AppSnackbarComponent from '~/components/snackbar/index.vue'

// IMPORT INTERFACES
import type { SnackbarOptions } from "~/interfaces/snackbar.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'default-layout',
  components: {
    // COMPONENTS CUSTOM APP
    'app-snackbar-component': AppSnackbarComponent
  }
})
class DefaultLayout extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // SNACKBAR DEFAULT OPTIONS
  public snackbar: SnackbarOptions = {
    show: false,
    btn: '',
    y: 'bottom',
    x: '',
    mode: '',
    timeout: 0,
    text: '',
    color: 'black lighten-2'
  }

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // CICLE LIFE METHODS
  public created() {
    // SET EMIT EVENTS
    this.setEmitEvent()
  }

  ///////////////////
  /// EMIT EVENTS ///
  ///////////////////

  // SET EMIT EVENT 
  private setEmitEvent() {
    this.$bus.$on('showSnackbar', (options: any) => {
      this.showSnackbar(options)
    })
    this.$bus.$on('handleError', (error: string) => {
      this.handleError(error)
    })
  }

  // EMI SHOW SNACKBAR
  public showSnackbar(snackbar: any) {
    this.snackbar = snackbar
    setTimeout(() => {
      this.closeSnackbar()
    }, this.snackbar.timeout)
  }

  // EMIT HANDLE ERROR
  public handleError(error: string) {
    const snackbar = {
      show: true,
      btn: '',
      y: 'bottom',
      x: 'center',
      mode: '',
      timeout: 6000,
      text: error,
      color: 'red darken-3'
    }
    this.showSnackbar(snackbar)
  }

  // EMIT CLOSE SNACKBAR
  public closeSnackbar() {
    this.snackbar = {
      show: false,
      btn: '',
      y: 'bottom',
      x: '',
      mode: '',
      timeout: 0,
      text: '',
      color: 'black lighten-2'
    }
  }
}
export default DefaultLayout;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-app>
    <v-layout full-height class="layout-default">
      <v-main class="layout-default-main">
        <!-- APP SNACKBAR -->
        <app-snackbar-component :options="snackbar" @close="closeSnackbar" />

        <!-- LAYOUT MAIN APP -->
        <v-container fluid fill-height class="pa-0">
          <slot @showSnackbar="showSnackbar" @handleError="handleError" />
        </v-container>
      </v-main>
    </v-layout>
  </v-app>
</template>