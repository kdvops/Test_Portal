<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from 'vue-facing-decorator'
import { useRobustSEO } from '~/composables/useRobustSEO'

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'products-screen',
  components: {}
})
export default class ProductsScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // APPLY SEO METADATA
    this.applySEOMetadata()
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // APPLY SEO METADATA
  public applySEOMetadata() {
    this.robustSEO.applyRobustSEO({ section: 'products' });
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <v-col cols="12" class="text-center pa-10">
      <h1>Productos Financieros</h1>
      <p>Descubre todos nuestros productos financieros disponibles.</p>
      
      <!-- Navigation to product categories -->
      <v-row justify="center" class="mt-5">
        <v-col cols="12" md="3" class="pa-2">
          <v-card 
            class="pa-4 text-center" 
            hover 
            @click="$router.push('/products/accounts')"
          >
            <v-icon size="48" color="primary">mdi-bank</v-icon>
            <h3 class="mt-2">Cuentas</h3>
            <p>Cuentas de ahorro y corrientes</p>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="3" class="pa-2">
          <v-card 
            class="pa-4 text-center" 
            hover 
            @click="$router.push('/products/cards')"
          >
            <v-icon size="48" color="primary">mdi-credit-card</v-icon>
            <h3 class="mt-2">Tarjetas</h3>
            <p>Tarjetas de crédito y débito</p>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="3" class="pa-2">
          <v-card 
            class="pa-4 text-center" 
            hover 
            @click="$router.push('/products/loans')"
          >
            <v-icon size="48" color="primary">mdi-cash-multiple</v-icon>
            <h3 class="mt-2">Préstamos</h3>
            <p>Préstamos personales y empresariales</p>
          </v-card>
        </v-col>
        
        <v-col cols="12" md="3" class="pa-2">
          <v-card 
            class="pa-4 text-center" 
            hover 
            @click="$router.push('/products/deposits')"
          >
            <v-icon size="48" color="primary">mdi-piggy-bank</v-icon>
            <h3 class="mt-2">Depósitos</h3>
            <p>Depósitos a plazo y certificados</p>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.v-card {
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
  }
}
</style>
