<script lang="ts">
import { Vue } from 'vue-facing-decorator';

// DEFINE THE COMPONENT WITH NUXT COMPONENT DECORATOR
@NuxtComponent({
  name: 'mortgage-loans'
})
export default class MortgageLoans extends Vue {
  public propertyValue: string = '';
  public loanAmount: string = '';
  public debtorsCount: number = 1;
  public debtorsAge: number = 18;
  public loanTerm: number = 132; // Start at 132

  private baseInterestRate: number = 0.08; // Tasa base del Banco Santa Cruz, por ejemplo 8%

  get currentInterestRate(): number {
    // Reducción de 0.1% por cada año adicional de préstamo
    return this.baseInterestRate - (this.loanTerm / 12) * 0.001;
  }

  calculateInstallments(): number {
    const loanAmountNumber = this.parseCurrency(this.loanAmount);
    if (loanAmountNumber === 0 || this.loanTerm === 0) {
      return 0;
    }

    const monthlyRate = this.currentInterestRate / 12;
    const payment = (loanAmountNumber * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -this.loanTerm));
    return payment;
  }

  calculateInsurance(): number {
    const loanAmountNumber = this.parseCurrency(this.loanAmount);
    return loanAmountNumber < 500000 ? 0 : 2900; 
  }

  calculateLegalFees(): number {
    const loanAmountNumber = this.parseCurrency(this.loanAmount);
    return (loanAmountNumber * 0.005) || 0; 
  }

  calculateTotal(): number {
    return this.calculateInstallments() + this.calculateInsurance() + this.calculateLegalFees();
  }

  // PARSE CURRENCY STRING TO NUMBER
  parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  }

  // FORMAT CURRENCY
  formatCurrency(value: string): string {
    const number = this.parseCurrency(value);
    if (number === 0) {
      return '';
    }
    return number.toLocaleString('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // HANDLE INPUT AND FORMAT PROPERTY VALUE
  get formattedPropertyValue(): string {
    return this.propertyValue ? 'RD$ ' + this.propertyValue : '';
  }

  set formattedPropertyValue(value: string) {
    this.propertyValue = value.replace(/[^0-9.,]/g, '');
  }

  // HANDLE INPUT AND FORMAT LOAN AMOUNT
  get formattedLoanAmount(): string {
    return this.loanAmount ? 'RD$ ' + this.loanAmount : '';
  }

  set formattedLoanAmount(value: string) {
    this.loanAmount = value.replace(/[^0-9.,]/g, '');
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
                v-model="propertyValue"
                label="¿Valor de la propiedad?"
                outlined
                dense
                class="mt-3"
                @blur="propertyValue = formatCurrency(propertyValue)"
                @focus="propertyValue = propertyValue.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="loanAmount"
                label="¿Ingresa Monto a tomar prestado?"
                outlined
                dense
                class="mt-3"
                @blur="loanAmount = formatCurrency(loanAmount)"
                @focus="loanAmount = loanAmount.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="debtorsCount"
                :items="[1, 2]"
                label="¿Cantidad de deudores?"
                outlined
                dense
                class="mt-3"
              ></v-select>
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="debtorsAge"
                :items="[...Array(53).keys()].map(i => i + 18)"
                label="¿Edad de Deudor/es?"
                outlined
                dense
                class="mt-3"
              ></v-select>
            </v-col>
            <v-col cols="12">
              <v-slider
                v-model="loanTerm"
                :min="132"
                :max="300"
                step="12"
                ticks
                tick-size="4"
                thumb-label="always"
                thumb-size="24"
                thumb-color="green"
                color="green lighten-2"
                class="mt-3 term-slider"
                :tick-labels="{132: '132', 144: '144', 156: '156', 168: '168', 180: '180', 192: '192', 204: '204', 216: '216', 228: '228', 240: '240', 252: '252', 264: '264', 276: '276', 288: '288', 300: '300'}"
              ></v-slider>
            </v-col>
          </v-row>
          <v-row justify="center" class="mt-5 summary">
            <v-col cols="6">
              <p class="summary-label">Cuotas</p>
              <h3 class="amount">RD$ {{ calculateInstallments().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h3>
            </v-col>
            <v-col cols="6">
              <p class="summary-label">Seguros</p>
              <h3 class="amount">RD$ {{ calculateInsurance().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h3>
            </v-col>
            <v-col cols="6">
              <p class="summary-label">Gastos legales</p>
              <h3 class="amount">RD$ {{ calculateLegalFees().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h3>
            </v-col>
            <v-col cols="6">
              <p class="summary-label">Total</p>
              <h3 class="amount">RD$ {{ calculateTotal().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}</h3>
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

.v-btn {
  background-color: #1e88e5;
  color: white;
  font-weight: bold;
}

.summary {
  text-align: center;
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
  font-size: 1.5rem;
  margin-top: 0;
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
</style>
