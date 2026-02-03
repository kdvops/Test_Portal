<script lang="ts">
import { Vue } from 'vue-facing-decorator';

// DEFINE THE COMPONENT WITH NUXT COMPONENT DECORATOR
@NuxtComponent({
  name: 'vehicle-loans'
})
export default class VehicleLoans extends Vue {
  // DEFINE THE VEHICLE TYPE, VALUE, YEAR, LOAN AMOUNT, AND TERM
  public vehicleType: string = '';
  public vehicleValue: string = '';
  public vehicleYear: number = new Date().getFullYear();
  public loanAmount: string = '';
  public loanTerm: number = 24; // DEFAULT TO 24 MONTHS

  // SET A FIXED ANNUAL INTEREST RATE
  private interestRate: number = 0.15; // 15% ANNUAL INTEREST RATE

  // CALCULATE THE INSTALLMENTS BASED ON LOAN AMOUNT, TERM, AND INTEREST RATE
  calculateInstallments(): number {
    const loanAmountNumber = this.parseCurrency(this.loanAmount);
    if (loanAmountNumber === 0 || this.loanTerm === 0) {
      return 0;
    }
    const monthlyRate = this.interestRate / 12;
    const payment = (loanAmountNumber * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -this.loanTerm));
    return payment;
  }

  // PARSE CURRENCY STRING TO NUMBER
  parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  }

  // FORMAT THE INSTALLMENTS VALUE WITH COMMAS
  get formattedInstallments(): string {
    return 'RD$ ' + this.calculateInstallments().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // HANDLE INPUT AND FORMAT VEHICLE VALUE
  get formattedVehicleValue(): string {
    return this.vehicleValue ? 'RD$ ' + this.vehicleValue : '';
  }

  set formattedVehicleValue(value: string) {
    this.vehicleValue = value.replace(/[^0-9.,]/g, '');
  }

  // HANDLE INPUT AND FORMAT LOAN AMOUNT
  get formattedLoanAmount(): string {
    return this.loanAmount ? 'RD$ ' + this.loanAmount : '';
  }

  set formattedLoanAmount(value: string) {
    this.loanAmount = value.replace(/[^0-9.,]/g, '');
  }

  // FORMAT CURRENCY
  formatCurrency(value: string): string {
    const number = this.parseCurrency(value);
    if (number === 0) {
      return '';
    }
    return number.toLocaleString('es-DO', { style: 'currency', currency: 'DOP', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
</script>

<template>
  <!-- MAIN CONTAINER -->
  <v-container fluid class="pa-0 pa-md-5 page-background">
    <!-- FORM ROW -->
    <v-row justify="center" align="center">
      <v-col cols="12">
        <v-card class="pa-5">
          <v-row class="mb-5">
            <!-- VEHICLE TYPE DROPDOWN -->
            <v-col cols="12" md="6">
              <v-select
                v-model="vehicleType"
                :items="['Nuevo', 'Usado']"
                label="¿Tipo de vehículo?"
                placeholder="Seleccionar tipo de vehículo"
                outlined
                dense
                class="mt-3"
              ></v-select>
            </v-col>
            <!-- VEHICLE VALUE INPUT FIELD -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="vehicleValue"
                label="¿Valor del vehículo?"
                outlined
                dense
                class="mt-3"
                @blur="vehicleValue = formatCurrency(vehicleValue)"
                @focus="vehicleValue = vehicleValue.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <!-- VEHICLE YEAR SELECT -->
            <v-col cols="12" md="6">
              <v-select
                v-model="vehicleYear"
                :items="[...Array(new Date().getFullYear() - 2009 + 1).keys()].map(i => i + 2009)"
                label="¿Año del vehículo?"
                outlined
                dense
                class="mt-3"
              ></v-select>
            </v-col>
            <!-- LOAN AMOUNT INPUT FIELD -->
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
            <!-- LOAN TERM SLIDER -->
            <v-col cols="12">
              <div class="text-center slider-label">¿Plazo de financiamiento?</div>
              <v-slider
                v-model="loanTerm"
                :min="24"
                :max="84"
                step="12"
                ticks
                tick-size="4"
                :tick-labels="{24: '24', 36: '36', 48: '48', 60: '60', 72: '72', 84: '84'}"
                class="mt-3"
                thumb-label
                thumb-size="24"
                thumb-color="green"
                color="green lighten-2"
              ></v-slider>
            </v-col>
          </v-row>
          <!-- MONTHLY PAYMENT DISPLAY -->
          <v-row justify="center">
            <v-col cols="12" class="text-right">
              <p class="installments">Cuotas</p>
              <h2 class="amount">{{ formattedInstallments }}</h2>
            </v-col>
          </v-row>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
/* PAGE BACKGROUND STYLING */
.page-background {
  background-color: #f5f5f5;
  min-height: 100vh;
}

/* LOANS TITLE STYLING */
.loans-title {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 2rem;
}

/* CARD STYLING */
.v-card {
  border-radius: 10px;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background-color: white;
}

/* TEXT FIELD MARGIN */
.v-text-field {
  margin-top: 20px;
}

/* SLIDER MARGIN */
.v-slider {
  margin-top: 20px;
}

/* BUTTON STYLING */
.v-btn {
  background-color: #1e88e5;
  color: white;
  font-weight: bold;
}

/* INSTALLMENTS TEXT STYLING */
.installments {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 0;
  font-size: 1rem;
}

/* AMOUNT TEXT STYLING */
.amount {
  font-weight: bold;
  color: #1e88e5;
  font-size: 2rem;
  margin-top: 0;
}
</style>
