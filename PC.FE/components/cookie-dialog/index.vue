<script lang="ts">
import { Vue, Prop, Emit } from "vue-facing-decorator";

@NuxtComponent({
  name: "cookie-dialog-component",
})
export default class CookieDialogComponent extends Vue {
  @Prop({ default: false })
  declare modelValue: boolean;

  @Emit("update:modelValue")
  emitValue(value: boolean) {
    return value;
  }

  @Emit("consentChange")
  emitConsent(value: boolean) {
    return value;
  }

  public changeConsent(value: boolean) {
    this.emitConsent(value);
  }
}
</script>
<template>
  <v-client-only>
    <v-overlay
      :model-value="modelValue"
      :z-index="3100"
      location="bottom"
      persistent
      scroll-strategy="none"
      scrim="transparent"
      content-class="d-flex align-end justify-center w-100 h-100 pa-4"
      teleport="body"
    >
      <v-card elevation="12" rounded="xl" class="w-100 mx-4" max-width="980">
        <v-container fluid class="py-6">
          <v-row clas="align-center" no-gutters>
            <v-col cols="12" md="7" class="pr-md-6 pa-4">
              <div id="cookie-title" class="text-h6 font-weight-bold mb-2">
                Usamos Cookies para mejorar tu experiencia.
              </div>
              <div class="text-caption text-justify mb-2 pr-2">
                El portal web del Banco Santa Cruz, S.A. utiliza Cookies propias
                y de terceros para mejorar la experiencia del usuario,
                personalizar contenidos y analizar la navegación. El usuario
                puede gestionarlas desde su navegador, aunque desactivarlas
                podría afectar el funcionamiento del sitio.
              </div>
              <div class="text-body-2">
                <v-btn
                  href="https://bsc.com.do/empresa/banca-empresa/terminos-y-condiciones-bsc-en-linea-y-app-bsc"
                  target="_blank"
                  rel="noopener"
                  variant="text"
                  color="primary"
                  class="text-none"
                >
                  Términos y condiciones
                </v-btn>
              </div>
            </v-col>
            <v-col
              cols="12"
              md="4"
              class="d-flex justify-center align-center flex-column align-stretch ga-2 mt-4 mt-md-0"
            >
              <v-btn
                size="large"
                color="primary"
                rounded="pill"
                variant="flat"
                :aria-pressed="true"
                @click="changeConsent(true)"
              >
                Aceptar
              </v-btn>

              <v-btn
                size="large"
                rounded="pill"
                :aria-pressed="false"
                @click="changeConsent(false)"
              >
                Rechazar
              </v-btn>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-overlay>
  </v-client-only>
</template>

<style lang="scss">
.cookie-fixed {
  z-index: 3000;
}
</style>
