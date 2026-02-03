<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop } from "vue-facing-decorator"

// IMPORT INTERFACES
import type { HeaderOptions } from '~/interfaces/header.interface'

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-header-component',
})
class AppHeaderComponent extends Vue {
  ///////////////////
  //// VARIABLES ////
  ///////////////////

  // INSTANCE VUE ROUTER
  public override $router: any = useRouter();

  // INSTANCE APOLLO HELPERS
  public $apolloHelpers: any;

  ///////////////
  //// PROPS ////
  ///////////////

  // DRAWER OPTIONS
  @Prop({
    default: {
      show: true,
      absolute: false,
      notification: []
    }
  })
  options!: HeaderOptions;

  public async logout() {
    await this.$apolloHelpers.onLogout();
    this.$router.push('/');
  }

  public async goToWebClient() {
    window.open('https://bsc.com.do', '_self')
  }
}
export default AppHeaderComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <template v-if="options.show">
    <v-app-bar :absolute="options.absolute" elevation="0" color="transparent" height="50" dark app>
      <v-toolbar-title>Dashboard</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon>
        <v-icon>mdi-magnify</v-icon>
      </v-btn>
      <v-btn rounded="rounded-xl" @click="logout()" append-icon="mdi-exit-to-app" class="text-subtitle-2">
        Cerrar Sesión
      </v-btn>
      <v-btn rounded="rounded-xl" @click="goToWebClient()" append-icon="mdi-web" class="text-subtitle-2">
        Ir a la web
      </v-btn>
    </v-app-bar>
  </template>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>