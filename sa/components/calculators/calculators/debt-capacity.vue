<script lang="ts">
import { Vue } from 'vue-facing-decorator';

@NuxtComponent({
  name: 'debt-capacity'
})
export default class DebtCapacity extends Vue {
  // DEFINE THE NET MONTHLY INCOME, LOAN INSTALLMENTS, AND OTHER DEBTS
  public netMonthlyIncome: string = '';
  public loanInstallments: string = '';
  public otherDebts: string = '';

  // PARSE CURRENCY STRING TO NUMBER
  parseCurrency(value: string): number {
    return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
  }

  // FORMAT CURRENCY TO RD$ STRING WITH COMMAS
  formatCurrency(value: string): string {
    const number = this.parseCurrency(value);
    return number ? 'RD$ ' + number.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
  }

  // CALCULATE DEBT CAPACITY BASED ON INCOME AND DEBTS
  calculateDebtCapacity(): number {
    const netIncome = this.parseCurrency(this.netMonthlyIncome);
    const installments = this.parseCurrency(this.loanInstallments);
    const debts = this.parseCurrency(this.otherDebts);
    const maxDebtCapacity = netIncome * 0.4;
    const availableIncome = maxDebtCapacity - (installments + debts);
    return availableIncome >= 0 ? availableIncome : 0;
  }

  // FORMAT DEBT CAPACITY WITH RD$ AND COMMAS
  get formattedDebtCapacity(): string {
    return 'RD$ ' + this.calculateDebtCapacity().toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
            <!-- NET MONTHLY INCOME INPUT FIELD -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="netMonthlyIncome"
                label="¿Ingresos mensuales netos?"
                outlined
                dense
                class="mt-3"
                @blur="netMonthlyIncome = formatCurrency(netMonthlyIncome)"
                @focus="netMonthlyIncome = netMonthlyIncome.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <!-- LOAN INSTALLMENTS INPUT FIELD -->
            <v-col cols="12" md="6">
              <v-text-field
                v-model="loanInstallments"
                label="¿Cuotas préstamos y/o tarjetas?"
                outlined
                dense
                class="mt-3"
                @blur="loanInstallments = formatCurrency(loanInstallments)"
                @focus="loanInstallments = loanInstallments.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
            <!-- OTHER DEBTS INPUT FIELD -->
            <v-col cols="12">
              <v-text-field
                v-model="otherDebts"
                label="¿Monto total de otros saldos que tengas comprometidos?"
                outlined
                dense
                class="mt-3"
                @blur="otherDebts = formatCurrency(otherDebts)"
                @focus="otherDebts = otherDebts.replace(/[^0-9.,]/g, '')"
              ></v-text-field>
            </v-col>
          </v-row>
          <!-- DEBT CAPACITY DISPLAY -->
          <v-row justify="center" class="mt-5">
            <v-col cols="12" class="text-center">
              <h2 class="amount">{{ formattedDebtCapacity }}</h2>
            </v-col>
          </v-row>
          <!-- NOTE SECTION -->
          <v-row>
            <v-col cols="12" class="text-center">
              <p class="note">
                ¡Importante! Estos cálculos son proyecciones estimadas y pueden variar periódicamente.
                Para más información debes visitar uno de nuestros centros de negocios o comunicarte
                con nosotros a través de Telenlace.
              </p>
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

/* BUTTON STYLING */
.v-btn {
  background-color: #1e88e5;
  color: white;
  font-weight: bold;
}

/* AMOUNT TEXT STYLING */
.amount {
  font-weight: bold;
  color: #1e88e5;
  font-size: 1.5rem; /* Reduced font size */
  margin-top: 0;
  text-align: right;
}

/* NOTE TEXT STYLING */
.note {
  font-size: 0.875rem;
  color: #535353;
  margin-top: 1rem;
}
</style>
