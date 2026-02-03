<script lang="ts">
import { Vue } from 'vue-facing-decorator';

// DEFINE THE COMPONENT WITH NUXT COMPONENT DECORATOR
@NuxtComponent({
  name: 'personal-loans'
})
export default class PersonalLoans extends Vue {
  // DEFINE THE LOAN AMOUNT
  public amount: string = ''; // Use string for formatted input

  // DEFINE THE LOAN TERM IN MONTHS
  public term: number = 0; // DEFAULT TO 0 MONTHS

  // SET A FIXED ANNUAL INTEREST RATE
  private interestRate: number = 0.15; // 15% ANNUAL INTEREST RATE

  // CALCULATE THE MONTHLY PAYMENT BASED ON AMOUNT, TERM, AND INTEREST RATE
  public get monthlyPayment(): string {
    const amountNumber = this.parseCurrency(this.amount);
    if (amountNumber === 0 || this.term === 0) {
      return '0.00';
    }

    const monthlyRate = this.interestRate / 12;
    const payment = (amountNumber * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -this.term));
    return payment.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  // PARSE CURRENCY STRING TO NUMBER
  parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  }

  // HANDLE INPUT AND FORMAT LOAN AMOUNT
  get formattedAmount(): string {
    return this.amount ? 'RD$ ' + this.amount : '';
  }

  set formattedAmount(value: string) {
    this.amount = value.replace(/[^0-9.,]/g, '');
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
            <!-- AMOUNT INPUT FIELD -->
            <v-col cols="12">
              <v-text-field
                v-model="amount"
                label="Ingrese el monto a tomar prestado"
                outlined
                dense
                class="mt-3"
                @blur="amount = formatCurrency(amount)"
                @focus="amount = amount.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <!-- TERM SLIDER -->
            <v-col cols="12">
              <div class="text-center slider-label">Plazo del préstamo: {{ term }} meses</div>
              <v-slider
                v-model="term"
                :min="0"
                :max="48"
                :step="12"
                ticks
                tick-size="4"
                :tick-labels="{0: '0', 12: '12', 24: '24', 36: '36', 48: '48'}"
                class="mt-3 term-slider"
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
              <h2 class="amount">RD$ {{ monthlyPayment }}</h2>
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

/* SLIDER LABEL STYLING */
.slider-label {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 10px;
}

/* SLIDER CUSTOM STYLING */
.term-slider .v-slider__thumb .v-slider__thumb-label__container {
  background-color: #4caf50;
  color: white;
}

/* BUTTON STYLING */
.apply-button {
  background-color: #4caf50;
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
  color: #4caf50;
  font-size: 2rem;
  margin-top: 0;
}
</style>
