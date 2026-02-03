<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import LoginAnimationOne from "~/assets/animations/login-animation-1.json";
import LoginAnimationTwo from "~/assets/animations/login-animation-2.json";
import LoginAnimationThree from "~/assets/animations/login-animation-3.json";

// IMPORT COMPONENTS
import AppFormLoginComponent from "~/components/forms/login/index.vue";

// IMPORT INTERFACE
import type {
  LoginFormOptions,
  LoginInterface,
} from "~/interfaces/login.interface";

// MUTATIONS
import { LOGIN_MUTATION } from "~/graphql/mutations/auth.mutation";

// QUERY'S
import { ME } from "~/graphql/query/auth.query";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "login-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "app-form-login-component": AppFormLoginComponent,
  },
})
class LoginScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apolloHelpers: any;

  // APOLLO INSTANCE
  public $apollo: any;

  // ANIMATIONS LOTTIE
  public loginAnimationOne: any = LoginAnimationOne;
  public loginAnimationTwo: any = LoginAnimationTwo;
  public loginAnimationThree: any = LoginAnimationThree;

  // LOADING
  public loginFormOptions: LoginFormOptions = {
    loading: false,
  };

  ///////////////
  /// METHODS ///
  ///////////////

  public created() {
    // DEFINE PAGE META
    definePageMeta({
      layout: "default",
    });
  }

  // LOGIN METHOD
  public async login(payload: LoginInterface) {
    // SET LOADING TRUE
    this.loginFormOptions.loading = true;

    try {
      // PAYLOAD LOGIN DTO
      const loginDto = {
        loginDto: payload,
      };

      // LOGIN USE AUTH
      const { data } = await this.$apollo.mutate({
        mutation: LOGIN_MUTATION,
        variables: loginDto,
      });

      // SET TOKEN IN AUTH COMPOSABLE
      const { onAuth } = useAuth();
      await onAuth(data.login.token.access_token);

      // CALL ME METHOD
      await this.me();
    } catch (err) {
      // SET LOADING FALSE
      this.loginFormOptions.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public async me() {
    try {
      // CALL ME QUERY
      const { data } = await this.$apollo.query({
        query: ME,
      });

      // ME
      const me = data.me;

      // SET USER IN AUTH COMPOSABLE
      const { onSession } = useAuth();
      await onSession(me);

      // SET LOADING FALSE
      this.loginFormOptions.loading = false;

      // REDIRECT TO DASHBOARD
      me.roles.includes("divisas")
        ? this.$router.push("/settings/coins")
        : this.$router.push("/dashboard");
    } catch (err) {
      // SET LOADING FALSE
      this.loginFormOptions.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }
}
export default LoginScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row
    no-gutters
    class="login-container"
    justify-content="center"
    align-content="center"
  >
    <v-col xs="12" md="5" class="login-form-container">
      <v-row
        class="h-100"
        no-gutters
        align-content="center"
        justify-content="center"
      >
        <v-col cols="12" class="text-center text-grey">
          <img width="120" class="mx-auto mb-8" src="~/assets/icons/logo.png" />
          <p class="text-h4 font-weight-thin">Bienvenidos</p>
          <p class="subtitle font-weight-thin">A tu nuevo dashboard BSC</p>
        </v-col>
        <v-col cols="12" class="login-inputs-container">
          <app-form-login-component
            :options="loginFormOptions"
            @login="login"
          />
        </v-col>
      </v-row>
    </v-col>
    <v-col xs="12" md="7" class="login-background-container h-100">
      <img
        width="100%"
        height="100%"
        class="position-absolute"
        cover
        eager
        src="assets/backgrounds/login-bg.svg"
      />
      <v-row
        class="login-animation-container ma-0"
        justify="center"
        align-content="center"
      >
        <v-col cols="5" class="pl-4">
          <client-only>
            <v-card width="95%" class="pa-0 rounded-lg" flat color="#e8e8e6">
              <app-lottie width="80%" :animationData="loginAnimationTwo" />
            </v-card>
          </client-only>
        </v-col>
        <v-col cols="4" class="pr-2">
          <client-only>
            <v-card width="95%" class="pa-0 rounded-lg" flat color="#e8e8e6">
              <app-lottie width="57%" :animationData="loginAnimationThree" />
            </v-card>
          </client-only>
        </v-col>
        <v-col cols="10">
          <client-only>
            <v-card flat class="pa-0 login-animation-one" color="transparent">
              <app-lottie width="100%" :animationData="loginAnimationOne" />
            </v-card>
          </client-only>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.login-container {
  height: 100vh;

  .login-form-container {
    height: 100%;
    background-color: #e8e8e6;

    .login-inputs-container {
      .login-input {
        label {
          font-size: 13px;

          &.v-field-label--floating {
            font-size: 10px;
          }
        }

        input {
          font-size: 13px;
        }
      }
    }
  }

  .login-animation-container {
    height: 100%;

    .login-animation-one {
      margin-top: -20px;
    }
  }
}
</style>
