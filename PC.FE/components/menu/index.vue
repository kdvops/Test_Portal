<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Emit, Prop, Vue } from 'vue-facing-decorator'

// IMPORT INTERFACES
import type { OptionsMenuInterface } from '~/interfaces/menu.interface';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-menu-component',
  components: {}
})
export default class AppMenuComponent extends Vue {
  ////////////
  // PROPS //
  ////////////

  // PROPS MENU
  @Prop({
    default: {
      route: '',
      current: '',
      color: '#4CAF50',
      default: {
        name: '',
        icon: 'mdi-card-text-outline',
        to: '',
      },
      items: []
    }
  }) options!: OptionsMenuInterface;

  ///////////////
  /// METHODS ///
  ///////////////

  public get currentRoute() {
    let current = this.$route.fullPath.split('item')[1] || this.$route.fullPath.split('/season')[1];
    const noFirstLevelPath = this.$route.fullPath.lastIndexOf('/') != this.$route.fullPath.indexOf('/')
    if(!current && noFirstLevelPath && (this.$route.fullPath.includes('profit')|| this.$route.fullPath.includes('beneficios'))){
      const paths = this.$route.fullPath.split('/')
      return paths[paths.length-1]
    }
    let splitCurrent = ''
    if (current) {
      splitCurrent = current.split('/')[1] || current.split('=')[1]
    }

    return splitCurrent;
  }

  public getRouteKeyFromItem(item: any){
    return item.hasOwnProperty('slug') && item.slug? item.slug: item._id
  }

  ///////////////
  //// EMITS ////
  ///////////////

  @Emit('changeRoute')
  public changeRoute(url: string, item: any): string {
    const routeKey = this.getRouteKeyFromItem(item)
    this.$router.push(`${url}${routeKey}`);

    this.currentRoute

    return `${url}${routeKey}`;
  }

  public isCurrentRoute(item: any){
    const routeKey = this.getRouteKeyFromItem(item)
    return this.currentRoute == routeKey
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <v-col class="py-0" cols="12" md="8" lg="8" style="position: relative; z-index: 10;">
      <v-card height="50" class="card-categories" color="white" elevation="3"
        :rounded="$vuetify.display.mdAndDown ? 'none' : 'xl'" density="comfortable"
        style="position: relative; z-index: 10;">
        <v-slide-group class="text-center h-100" show-arrows>
          <v-slide-group-item class="h-100">
            <v-btn :to="options.default.to" elevation="0" :color="'primary'"
              :prepend-icon="options.default.icon" class="text-caption font-weight-bold text-white" height="100%"
              variant="elevated" tile>
              {{ options.default.name }}
            </v-btn>
          </v-slide-group-item>
          <v-slide-group-item style="position: relative" class="h-100" v-for="item in options.items" :key="item._id">
            <v-btn :color="isCurrentRoute(item) ? options.color ? options.color : 'primary' : ''" elevation="0"
              class="text-caption border-e-sm" @click="changeRoute(options.route, item)" height="100%"
              variant="elevated" tile>
              {{ item.name }}
            </v-btn>
          </v-slide-group-item>
        </v-slide-group>
      </v-card>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>