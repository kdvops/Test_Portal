<script lang="ts">
import { Vue } from "vue-facing-decorator";

// IMPORT CALCULATORS
import DebtCapacity from "./debt-capacity.vue";
import MortgageLoans from "./mortgage-loans.vue";
import PersonalLoans from "./personal-loans.vue";
import SavingsGoals from "./savings-goals.vue";
import TermDeposits from "./term-deposits.vue";
import VehicleLoans from "./vehicle-loans.vue";

@NuxtComponent({
  name: "calculators-component",
  components: {
    "calculator-debt-capacity": DebtCapacity,
    "calculator-mortgage-loans": MortgageLoans,
    "calculator-personal-loans": PersonalLoans,
    "calculator-savings-goals": SavingsGoals,
    "calculator-term-deposits": TermDeposits,
    "calculator-vehicle-loans": VehicleLoans,
  },
})
export default class CalculatorsComponent extends Vue {
  public panel: string = "";
}
</script>

<template>
  <!-- FORM ROW -->
  <v-row justify="center" align-content="center">
    <v-expansion-panels v-model="panel" :class="panel ? 'pa-0' : 'pa-5'" variant="accordion" collapse-icon="none">
      <v-col cols="12">
        <v-expansion-panel class="expansion-panel-calculator"
          :color="panel === 'calculator-debt-capacity' ? '#4caf50' : '#faf9ff'" value="calculator-debt-capacity">
          <template #title>
            <div v-if="panel === 'calculator-debt-capacity'">
              <p class="text-white font-weight-bold">
                Capacidad de Endeudamiento
              </p>
              <v-btn rounded="xl" variant="outlined" position="absolute" to="/forms/66e0605d915bc966f2b15709"
                style="top: 15px; right: 15px; z-index: 10">Solicitar</v-btn>
            </div>
            <div v-else>
              <p class="text-primary font-weight-bold">
                Capacidad de Endeudamiento
              </p>
            </div>
          </template>
          <template #text>
            <calculator-debt-capacity />
          </template>
        </v-expansion-panel>
      </v-col>
      <v-col cols="12">
        <v-expansion-panel class="expansion-panel-calculator"
          :color="panel === 'calculator-mortgage-loans' ? '#4caf50' : '#faf9ff'" value="calculator-mortgage-loans">
          <template #title>
            <div v-if="panel === 'calculator-mortgage-loans'">
              <p class="text-white font-weight-bold">Préstamos Hipotecarios</p>
              <v-btn rounded="xl" variant="outlined" position="absolute" to="/forms/66e0605d915bc966f2b15709"
                style="top: 15px; right: 15px; z-index: 10">Solicitar</v-btn>
            </div>
            <div v-else>
              <p class="text-primary font-weight-bold">
                Préstamos Hipotecarios
              </p>
            </div>
          </template>
          <template #text>
            <calculator-mortgage-loans />
          </template>
        </v-expansion-panel>
      </v-col>
      <v-col cols="12">
        <v-expansion-panel class="expansion-panel-calculator"
          :color="panel === 'calculator-personal-loans' ? '#4caf50' : '#faf9ff'" value="calculator-personal-loans">
          <template #title>
            <div v-if="panel === 'calculator-personal-loans'">
              <p class="text-white font-weight-bold">Préstamos Personales</p>
              <v-btn rounded="xl" variant="outlined" position="absolute" to="/forms/66e0605d915bc966f2b15709"
                style="top: 15px; right: 15px; z-index: 10">Solicitar</v-btn>
            </div>
            <div v-else>
              <p class="text-primary font-weight-bold">Préstamos Personales</p>
            </div>
          </template>
          <template #text>
            <calculator-personal-loans />
          </template>
        </v-expansion-panel>
      </v-col>
      <v-col cols="12">
        <v-expansion-panel class="expansion-panel-calculator"
          :color="panel === 'calculator-savings-goals' ? '#4caf50' : '#faf9ff'" value="calculator-savings-goals">
          <template #title>
            <div v-if="panel === 'calculator-savings-goals'">
              <p class="text-white font-weight-bold">Meta de Ahorros</p>
              <v-btn rounded="xl" variant="outlined" position="absolute" to="/forms/66e0a3b9915bc966f2b15d7a"
                style="top: 15px; right: 15px; z-index: 10">Solicitar</v-btn>
            </div>
            <div v-else>
              <p class="text-primary font-weight-bold">Meta de Ahorros</p>
            </div>
          </template>
          <template #text>
            <calculator-savings-goals />
          </template>
        </v-expansion-panel>
      </v-col>
      <v-col cols="12">
        <v-expansion-panel class="expansion-panel-calculator"
          :color="panel === 'calculator-term-deposits' ? '#4caf50' : '#faf9ff'" value="calculator-term-deposits">
          <template #title>
            <div v-if="panel === 'calculator-term-deposits'">
              <p class="text-white font-weight-bold">Depósito a Plazos</p>
              <v-btn rounded="xl" variant="outlined" position="absolute" to="/forms/66e0a77b915bc966f2b15da7"
                style="top: 15px; right: 15px; z-index: 10">Solicitar</v-btn>
            </div>
            <div v-else>
              <p class="text-primary font-weight-bold">Depósito a Plazos</p>
            </div>
          </template>
          <template #text>
            <calculator-term-deposits />
          </template>
        </v-expansion-panel>
      </v-col>
      <v-col cols="12">
        <v-expansion-panel class="expansion-panel-calculator"
          :color="panel === 'calculator-vehicle-loans' ? '#4caf50' : '#faf9ff'" value="calculator-vehicle-loans">
          <template #title>
            <div v-if="panel === 'calculator-vehicle-loans'">
              <p class="text-white font-weight-bold">Préstamos de Vehículos</p>
              <v-btn rounded="xl" variant="outlined" position="absolute" to="/forms/66e0605d915bc966f2b15709"
                style="top: 15px; right: 15px; z-index: 10">Solicitar</v-btn>
            </div>
            <div v-else>
              <p class="text-primary font-weight-bold">
                Préstamos de Vehículos
              </p>
            </div>
          </template>
          <template #text>
            <calculator-vehicle-loans />
          </template>
        </v-expansion-panel>
      </v-col>
    </v-expansion-panels>
  </v-row>
</template>

<style lang="scss">
.expansion-panel-calculator .v-expansion-panel-text__wrapper {
  padding: 0px 0px 0px !important
}
</style>
