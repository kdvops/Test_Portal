<script lang="ts">
import { Vue } from 'vue-facing-decorator';

@NuxtComponent({
  name: 'term-deposits'
})
export default class TermDeposits extends Vue {
  public depositType: string = '';
  public investmentAmount: string = '';
  public investmentTerm: number = 1;

  private termOptions: number[] = [1, 2, 3, 6, 9, 12, 18, 24, 36];
  private baseInterestRate: number = 0.07; // 7% tasa de interés anual

  calculateTotalInvestment(): number {
    const amountNumber = this.parseCurrency(this.investmentAmount);
    const years = this.investmentTerm / 12;
    return amountNumber * Math.pow((1 + this.baseInterestRate), years);
  }

  // PARSE CURRENCY STRING TO NUMBER
  parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  }

  // HANDLE INPUT AND FORMAT INVESTMENT AMOUNT
  get formattedInvestmentAmount(): string {
    return this.investmentAmount ? 'RD$ ' + this.investmentAmount : '';
  }

  set formattedInvestmentAmount(value: string) {
    this.investmentAmount = value.replace(/[^0-9.,]/g, '');
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
    this.investmentTerm = this.snapToClosestTerm(value);
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
              <v-select
                v-model="depositType"
                :items="['Capitalizable', 'No capitalizable']"
                label="¿Tipo de depósito plazos?"
                placeholder="Seleccionar depósito a plazos"
                outlined
                dense
                class="mt-3"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="investmentAmount"
                label="¿Cuánto deseas invertir?"
                outlined
                dense
                class="mt-3"
                @blur="investmentAmount = formatCurrency(investmentAmount)"
                @focus="investmentAmount = investmentAmount.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <v-col cols="12">
              <div class="text-center slider-label">{{ investmentTerm }} Meses</div>
              <v-slider
                v-model="investmentTerm"
                :min="1"
                :max="36"
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
            <v-col cols="12">
              <p class="summary-label">Inversión total</p>
              <h3 class="amount">RD$ {{ calculateTotalInvestment().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h3>
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
