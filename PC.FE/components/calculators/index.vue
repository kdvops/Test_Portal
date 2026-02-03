<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit } from "vue-facing-decorator";

// IMPORT INTERFACES
import type { DrawerCalculatorsPropsInterface } from "~/interfaces/calculators.interface";

// IMPORT COMPONENTS
import AppDrawerCalculatorExchangeComponent from "~/components/calculators/exchange/index.vue";
import AppDrawerCalculatorsAppComponent from "~/components/calculators/calculators/index.vue";
import IconImage from "~/components/optimized-image/IconImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "app-drawer-calculators-component",
  components: {
    // COMPONENTS CUSTOM APP
    "app-drawer-calculator-exchange-component":
      AppDrawerCalculatorExchangeComponent,
    "app-drawer-calculator-app-component": AppDrawerCalculatorsAppComponent,
    IconImage,
  },
})
export default class AppDrawerCalculatorsComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // DRAWER CALCULATOR PROPS
  @Prop({
    default: {
      show: false,
      type: "calculator",
      coins: [],
    },
  })
  options!: DrawerCalculatorsPropsInterface;
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-navigation-drawer
    width="600"
    v-model="options.show"
    location="right"
    class="app-drawer-calculators w-xs-100"
    :class="$vuetify.display.mdAndUp ? 'rounded-ts-xl rounded-bs-xl' : 'rounded-none'"
    fixed
    temporary
    app
  >
    <template v-if="options.type === 'calculator'">
      <v-list-item class="pa-0 ma-0">
        <div class="py-5 d-flex align-center" style="background-color: var(--bsc-primary-color)">
          <p class="text-title font-weight-bold text-white mx-5">
            Calculadoras
          </p>
          <IconImage
            src="/assets/icons/calculator_white.svg"
            alt="Calculadora"
            :width="24"
            :height="24"
          />
          <v-spacer></v-spacer>
          <v-btn
            class="mr-5"
            @click="options.show = false"
            density="compact"
            variant="text"
            icon
          >
            <v-icon size="16" color="#ffffff"> mdi-close </v-icon>
          </v-btn>
        </div>
      </v-list-item>

      <v-divider></v-divider>

      <app-drawer-calculator-app-component />
    </template>

    <template v-if="options.type === 'exchange'">
      <v-list-item class="pa-0 ma-0">
        <div class="py-5 d-flex align-center" style="background-color: var(--bsc-primary-color)">
          <p class="text-title font-weight-bold text-white mx-5">Divisas</p>
          <IconImage
            src="/assets/icons/Icono_pago_white.svg"
            alt="Divisas"
            :width="24"
            :height="24"
          />
          <v-spacer></v-spacer>
          <v-btn
            class="mr-5"
            @click="options.show = false"
            density="compact"
            variant="text"
            icon
          >
            <v-icon size="16" color="#ffffff"> mdi-close </v-icon>
          </v-btn>
        </div>
      </v-list-item>

      <v-divider></v-divider>
      <app-drawer-calculator-exchange-component :options="options" />
    </template>
  </v-navigation-drawer>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.app-drawer-calculators {
  padding: 0;
  overflow: hidden;
}
</style>
