<script lang="ts">
import { Vue } from 'vue-facing-decorator';

@NuxtComponent({
  name: 'savings-goals'
})
export default class SavingsGoals extends Vue {
  public totalSavingsGoal: string = ''; // Formateado como string para manejar RD$
  public currentSavings: string = ''; // Formateado como string para manejar RD$
  public savingsTerm: number = 1;

  private termOptions: number[] = [1, 2, 3, 6, 9, 12, 18, 24, 36, 48, 60];

  calculateInstallments(): number {
    const totalSavings = this.parseCurrency(this.totalSavingsGoal);
    const currentSavings = this.parseCurrency(this.currentSavings);
    const remainingAmount = totalSavings - currentSavings;
    return remainingAmount / this.savingsTerm || 0;
  }

  // PARSE CURRENCY STRING TO NUMBER
  parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  }

  // HANDLE INPUT AND FORMAT TOTAL SAVINGS GOAL
  get formattedTotalSavingsGoal(): string {
    return this.totalSavingsGoal ? 'RD$ ' + this.totalSavingsGoal : '';
  }

  set formattedTotalSavingsGoal(value: string) {
    this.totalSavingsGoal = value.replace(/[^0-9.,]/g, '');
  }

  // HANDLE INPUT AND FORMAT CURRENT SAVINGS
  get formattedCurrentSavings(): string {
    return this.currentSavings ? 'RD$ ' + this.currentSavings : '';
  }

  set formattedCurrentSavings(value: string) {
    this.currentSavings = value.replace(/[^0-9.,]/g, '');
  }

  // FORMAT CURRENCY
  formatCurrency(value: string): string {
    const number = this.parseCurrency(value);
    if (number === 0) {
      return '';
    }
    return number.toLocaleString('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // SNAP TO CLOSEST TERM OPTION
  snapToClosestTerm(value: number): number {
    return this.termOptions.reduce((prev, curr) => Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev);
  }

  // HANDLE SLIDER CHANGE
  handleSliderChange(value: number): void {
    this.savingsTerm = this.snapToClosestTerm(value);
  }
}
</script>

<template>
  <v-container fluid class="pa-0 pa-md-5 page-background">
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-card class="pa-5">
          <v-row class="mb-5">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="totalSavingsGoal"
                label="¿Cuánto deseas ahorrar en total?"
                outlined
                dense
                class="mt-3"
                @blur="totalSavingsGoal = formatCurrency(totalSavingsGoal)"
                @focus="totalSavingsGoal = totalSavingsGoal.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="currentSavings"
                label="¿Cuánto tienes ahorrado?"
                outlined
                dense
                class="mt-3"
                @blur="currentSavings = formatCurrency(currentSavings)"
                @focus="currentSavings = currentSavings.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <div class="text-center slider-label">{{ savingsTerm }} Meses</div>
              <v-slider
                v-model="savingsTerm"
                :min="1"
                :max="60"
                step="1"
                ticks
                tick-size="4"
                thumb-label="always"
                thumb-size="24"
                thumb-color="green"
                color="green lighten-2"
                class="mt-3 term-slider"
                @change="handleSliderChange($event)"
              ></v-slider>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-5">
            <v-col cols="12">
              <p class="disclaimer">
                ¡Importante! Estos cálculos son proyecciones estimadas y pueden variar periódicamente. Para más información debes visitar uno de nuestros centros de negocios o comunicarte con nosotros a través de Telenlace.
              </p>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-5">
            <v-col cols="12" md="3">
              <p class="summary-label">Cuotas</p>
              <h3 class="amount">RD$ {{ calculateInstallments().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h3>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
.page-background {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.loans-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
}

.v-card {
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.v-text-field {
  margin-top: 20px;
}

.v-slider {
  margin-top: 20px;
}

/* SLIDER CUSTOM STYLING */
.term-slider .v-slider__thumb .v-slider__thumb-label__container {
  background-color: #4caf50;
  color: white;
  font-weight: bold;
}

.term-slider .v-slider__thumb-label {
  font-weight: bold;
  color: white;
}

.v-btn {
  background-color: #1e88e5;
  color: white;
  font-weight: bold;
}

.summary-label {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0;
  font-size: 1rem;
}

.amount {
  font-weight: bold;
  color: #1e88e5;
  font-size: 1.5rem; /* Reduce font size */
  margin-top: 0;
}

.disclaimer {
  font-size: 0.875rem;
  color: #777;
  text-align: center;
  margin-top: 20px;
}
</style>
