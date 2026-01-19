<script lang="ts">
import { Prop, Vue } from "vue-facing-decorator";

// IMPORT MASKA
import { vMaska } from "maska/vue";

// IMPORT INTERFACES
import type { DrawerCalculatorsPropsInterface } from "~/interfaces/calculators.interface";
import type { MaskInputOptions } from "maska";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "app-drawer-calculator-exchange-component",
  directives: {
    "v-maska": vMaska,
  },
})
export default class AppDrawerCalculatorExchangeComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // DRAWER CALCULATOR PROPS
  @Prop({
    default: {
      coins: [],
      type: "calculator",
    },
  })
  options!: DrawerCalculatorsPropsInterface;

  public activeTab: number = 0;
  public amount: number = 1000;

  public calculateExchangeRate(price: string): string {
    const result = this.amount * Number(price);
    return result.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
    });
  }
}
</script>

<template>
  <v-sheet class="drawer-items-container" width="100%" height="90%" color="#ffffff">
    <v-row justify="center" align-content="center" class="mb-5">
      <v-col cols="12" xs="12" md="4" class="mt-5 mt-md-16 ml-0 ml-md-2">
        <v-tabs v-model="activeTab" :direction="$vuetify.display.mdAndDown ? 'horizontal' : 'vertical'"
          :show-arrows="$vuetify.display.mdAndDown">
          <v-tab v-for="(coin, index) in options.coins"
            class="tab-container py-0 pl-0 pl-md-2 my-1 pr-0 elevation-2 text-caption" :key="index">
            {{ coin.name }}
          </v-tab>
        </v-tabs>
      </v-col>
      <v-col cols="12" xs="12" md="7">
        <v-tabs-items v-model="activeTab">
          <v-tab-item v-for="(coin, index) in options.coins" :key="index">
            <v-container v-if="activeTab === index">
              <v-row justify="center" align="center">
                <v-col cols="12">
                  <v-card class="pa-5 text-left" elevation="0">
                    <v-row justify="center">
                      <v-col cols="12">
                        <p class="text-left label-static-input">
                          Monto a calcular
                        </p>
                        <v-text-field v-model="amount" :placeholder="`${coin.prefix} 1,000.00`" type="number"
                          rounded="xl" variant="outlined" :prefix="coin.prefix" class="mt-1 input-app-calculator"
                          color="grey"></v-text-field>
                      </v-col>
                      <v-col cols="12">
                        <div class="exchange-rate">
                          <span>Precio de compra</span>
                          <strong>
                            {{ coin.prefix }} 1.00 = RD$
                            {{ coin.price.buy }}</strong>
                          <p> {{ calculateExchangeRate(coin.price.buy) }}</p>
                        </div>
                      </v-col>
                      <v-col cols="12">
                        <div class="exchange-rate">
                          <span>Precio de venta</span>
                          <strong>
                            {{ coin.prefix }} 1.00 = RD$
                            {{ coin.price.sell }}</strong>
                          <p>
                            {{ calculateExchangeRate(coin.price.sell) }}
                          </p>
                        </div>
                      </v-col>
                    </v-row>
                  </v-card>
                </v-col>
              </v-row>
            </v-container>
          </v-tab-item>
        </v-tabs-items>
      </v-col>
    </v-row>
    <div>
      <NuxtImg 
        width="100%" 
        height="300" 
        src="/assets/backgrounds/Telenlace.jpg" 
        style="object-fit: cover" 
        alt="Telenlace"
      />
    </div>
  </v-sheet>
</template>

<style lang="scss" scoped>
.input-app-calculator {
  margin-left: -15px;

  .v-text-field.v-field--no-label {
    input {
      padding-top: 0 !important;
    }
  }
}

.v-slide-group__content {
  button.v-tab.v-tab.v-btn {
    background: #faf9ff;
    font-size: 13px;
    text-transform: capitalize;
    border-radius: 5px;
    color: #1e88e5;

    &.v-tab-item--selected {
      background: #4caf50;
      font-size: 13px;
      text-transform: capitalize;
      border-radius: 5px;
      color: #ffffff;
    }
  }
}

.page-background {
  background-color: white;
}

.divisas-icon {
  font-size: 4rem;
  color: #1e88e5;
}

.divisas-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.v-tab {
  font-weight: bold;
  text-transform: uppercase;
  color: #1e88e5;
  margin: 0 10px;
  font-size: 1.2rem;
}

.v-tab--active {
  color: #1e88e5;
  border-bottom: 3px solid #4caf50;
}

.label-static-input {
  font-size: 14px;
  font-weight: bold;
  color: #1e88e5;
}

.v-card {
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.3s ease;
  background-color: white;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}

.v-card-title {
  display: flex;
  justify-content: center;
  font-weight: bold;
  font-size: 1.5rem;
  color: #1e88e5;
}

.v-card-text {
  color: #535353;
  text-align: center;
}

.exchange-rate {
  text-align: left;
  font-size: 20px;
  color: #1e88e5;

  span {
    display: block;
    font-size: 14px;
    font-weight: bold;
    color: #4caf50;
  }

  p {
    margin-top: 10px;
    font-size: 30px;
    font-weight: bold;
    color: #737373;
  }
}

.calculated-amount {
  font-size: 1.25rem;
  color: #1e88e5;

  span {
    display: block;
    font-size: 1rem;
    color: #535353;
  }
}
</style>
