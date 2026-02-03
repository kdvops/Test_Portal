<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Emit } from "vue-facing-decorator"

// IMPORT INTERFACES
import type {
  LoginFormOptions,
  LoginInterface
} from '~/interfaces/login.interface';
import type { LoginRules } from '~/interfaces/rules.interface';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-form-login-component',
})
class AppFormLoginComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // LOGIN FORM OPTIONS
  @Prop({
    default: {
      loading: false,
    }
  })
  options!: LoginFormOptions;

  ///////////////
  // VARIABLES //
  ///////////////

  // VALID FORM
  public valid: boolean = false

  // PAYLOAD LOGIN
  public payload: LoginInterface = {
    email: '',
    password: ''
  }

  // RULES VALIDATION FORM
  public rules: LoginRules = {
    email: [
      (v: string) => !!v || 'Email es requerido',
      (v: string) =>
        /[^\s]*@[a-z0-9.-]*/i.test(v) ||
        'Email invalido'
    ],
    password: [
      (v: string) => !!v || 'Contraseña es requerido',
      (v: string) =>
        (v && v.length >= 8) || 'La contraseña debe ser de 8 caracteres o mayor'
    ]
  }

  /////////////////
  // EMIT EVENTS //
  /////////////////

  // EMIT EVENT LOGIN
  @Emit('login')
  public login() {
    return this.payload
  }

}
export default AppFormLoginComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-form v-model="valid">
    <v-row justify="center" class="mt-8" no-gutters>
      <v-col cols="8">
        <v-text-field v-model="payload.email" :rules="rules.email" rounded placeholder="example@email.com" type="email"
          density="compact" variant="solo" label="Correo Electrónico" class="login-input"
          prepend-inner-icon="mdi-email" />
      </v-col>
      <v-col cols="8">
        <v-text-field v-model="payload.password" :rules="rules.password" rounded placeholder="**********"
          type="password" density="compact" variant="solo" label="Contraseña" class="login-input"
          prepend-inner-icon="mdi-lock" />
      </v-col>
      <v-col cols="9" class="my-4">
        <v-divider />
      </v-col>
      <v-col cols="8">
        <v-btn density="compact" rounded height="40" block class="my-5 text-caption" color="#1e85a7" @click="login()"
          :loading="options.loading" :disabled="!valid">
          iniciar sesión
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>