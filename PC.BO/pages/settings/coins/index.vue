<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationCoin from "~/assets/animations/coins-animation.json";

// IMPORT INTERFACE
import type { CoinInterface, NewLogoCoin } from "~/interfaces/coins.interface";
import type { UserInterface } from "~/interfaces/user.interface";

// IMPORT COMPOSABLES
import { useAuth } from "~/composables/useAuth";

// IMPORT QUERY'S
import { GET_COINS } from "~/graphql/query/coins.query";

// IMPORT MUTATIONS
import {
  REMOVE_COINS,
  UPDATE_COINS,
  CREATE_COINS,
} from "~/graphql/mutations/coins.mutation";

// IMPORT LODASH
import _ from "lodash";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "coins-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "detailed-image-component": DetailedImageComponent,
  },
})
class CoinsScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION COINS
  @Ref("animationCoins") animationCoins: any;

  // INPUT FILE IMAGES
  @Ref("coinItemLogo") coinItemLogo: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // ANIMATIONS LOTTIE
  public animationCoin: any = AnimationCoin;

  // DEFAULT COINS ARRAY VALUES
  public coins: Array<CoinInterface> = [];

  // NEW LOGO COIN
  public newLogoCoin: Array<NewLogoCoin> = [];

  // DIALOG DELETE COINS OPTIONS
  public dialogRemove: { show: boolean; coinID: string; loading: boolean } = {
    show: false,
    coinID: "",
    loading: false,
  };

  // DIALOG CREATE AND UPDATE COINS
  public dialog: {
    action: "update" | "create";
    show: boolean;
    coin: CoinInterface;
    loading: boolean;
  } = {
    show: false,
    action: "create",
    coin: {
      logo: "",
      name: "",
      prefix: "",
      price: {
        buy: "0",
        sell: "0",
      },
    },
    loading: false,
  };

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setCoins();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET IMAGE FILE AND SET IN ITEM COIN
  public getImageCoinItem(file: File) {
    if (file) {
      if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png"
      ) {
        if (file.size <= 19520000) {
          const itemPicture = this.newLogoCoin!;
          const fr = new FileReader();
          fr.onload = (el: any) => {
            itemPicture.splice(0, 1, {
              img: el.target.result,
              filetype: file.type.split("/")[1],
            });
          };
          fr.readAsDataURL(file);
        } else {
          this.$bus.$emit("handleError", "El peso máximo es menor de 2 MB");
        }
      } else {
        this.$bus.$emit("handleError", "Solo se aceptan formato .png y .jpeg");
      }
    }
  }

  // OPEN UPLOAD IMAGE
  public selectImage() {
    const imageRefs: any = this.coinItemLogo;

    // REF IMAGE RESET
    imageRefs.value = null;

    // REF IMAGE UPLOAD
    imageRefs.click();
  }

  // SET COINS
  public async setCoins() {
    try {
      // GET ALL COINS
      const { data } = await this.$apollo.query({
        query: GET_COINS,
        fetchPolicy: "no-cache",
      });

      // SET COINS TO VARIABLE
      this.coins = data.coins;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // CREATE COIN
  public async createCoin() {
    // SET LOADING
    this.dialog.loading = true;

    // CREATE COINS DTO PAYLOAD
    const createCoinDto = {
      createCoinDto: { ...this.dialog.coin },
    };

    try {
      // CREATE COINS
      await this.$apollo.mutate({
        mutation: CREATE_COINS,
        variables: createCoinDto,
      });

      // SET LOADING
      this.dialog.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Moneda creada correctamente!",
        color: "success",
      });

      // CLOSE DIALOG
      this.closeDialogCoin();

      // SET COINS
      this.setCoins();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // CLOSE DIALOG
      this.closeDialogCoin();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE COIN
  public async updateCoin() {
    // SET LOADING
    this.dialog.loading = true;

    // CLEAN COIN
    let coinClean = _.omit({ ...this.dialog.coin }, ["_id"]);

    // UPDATE COINS DTO PAYLOAD
    const updateCoinDto = {
      updateCoinDto: {
        coinID: this.dialog.coin._id,
        coin: coinClean,
      },
    };

    try {
      // UPDATE COINS
      await this.$apollo.mutate({
        mutation: UPDATE_COINS,
        variables: updateCoinDto,
      });

      // SET LOADING
      this.dialog.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Moneda actualizada correctamente!",
        color: "success",
      });

      // CLOSE DIALOG
      this.closeDialogCoin();

      // SET COINS
      this.setCoins();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // CLOSE DIALOG
      this.closeDialogCoin();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // REMOVE COIN
  public async removeCoins() {
    // SET LOADING
    this.dialogRemove.loading = true;

    // REMOVE COINS DTO PAYLOAD
    const removeCoinsDto = {
      coinId: this.dialogRemove.coinID,
    };

    try {
      // REMOVE COINS
      await this.$apollo.mutate({
        mutation: REMOVE_COINS,
        variables: removeCoinsDto,
      });

      // SET LOADING
      this.dialogRemove.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Moneda eliminada correctamente!",
        color: "success",
      });

      // CLOSE DIALOG
      this.closeDialogAlertRemove();

      // SET COINS
      this.setCoins();
    } catch (err) {
      // SET LOADING
      this.dialogRemove.loading = false;

      // CLOSE DIALOG
      this.closeDialogAlertRemove();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO UPDATE COIN
  public openDialogUpdate(coin: CoinInterface) {
    this.dialog.show = true;
    this.dialog.action = "update";
    this.dialog.coin = {
      _id: coin._id,
      logo: coin.logo,
      logoImageDetail: coin.logoImageDetail,
      name: coin.name,
      prefix: coin.prefix,
      price: {
        buy: coin.price.buy,
        sell: coin.price.sell,
      },
    };
  }

  // GO TO CREATE COINS
  public openDialogCreate() {
    this.dialog.show = true;
    this.dialog.action = "create";
    this.dialog.coin = {
      logo: "",
      name: "",
      prefix: "",
      price: {
        buy: "0",
        sell: "0",
      },
    };

    // CLEAN IMAGE LOGO
    this.newLogoCoin = [];
  }

  // OPEN DIALOG ALERT REMOVE COINS
  public openDialogAlertRemove(coinID: string) {
    this.dialogRemove.coinID = coinID;

    // OPEN DIALOG
    this.dialogRemove.show = true;
  }

  // OPEN DIALOG ALERT REMOVE COINS
  public closeDialogCoin() {
    this.dialog.show = false;
    this.dialog.action = "create";
    this.dialog.coin = {
      logo: "",
      name: "",
      prefix: "",
      price: {
        buy: "0",
        sell: "0",
      },
    };

    // CLEAN IMAGE LOGO
    this.newLogoCoin = [];
  }

  // OPEN DIALOG ALERT REMOVE COINS
  public closeDialogAlertRemove() {
    this.dialogRemove.show = false;
    this.dialogRemove.coinID = "";
    this.dialogRemove.loading = false;
  }

  // VALIDATE STEPS AND ACTION DIALOG
  public validateAction() {
    if (this.dialog.action === "create") {
      this.createCoin();
      this.closeDialogCoin();
    } else {
      this.updateCoin();
      this.closeDialogCoin();
    }
  }

  // VALIDATE STEPS AND ACTION DIALOG
  public get validateForm(): boolean {
    let valid: boolean = false;
    if (this.dialog.action === "create") {
      valid =
        !this.dialog.coin.prefix ||
        !this.dialog.coin.name ||
        !this.dialog.coin.price.buy ||
        !this.dialog.coin.price.sell ||
        !String(this.dialog.coin.logoImageDetail?.image).trim();
    } else {
      valid =
        !this.dialog.coin.prefix ||
        !this.dialog.coin.name ||
        !this.dialog.coin.price.buy ||
        !this.dialog.coin.price.sell;
    }

    return valid;
  }

  // GET USER AUTH
  public get getUserAuth(): UserInterface | null {
    const { user } = useAuth();

    return user && typeof user.value === "object" && user.value !== null
      ? (user.value as UserInterface)
      : null;
  }

  // VALIDATE IF USER CAN EDIT OR DELETE
  public get canEditOrDelete(): boolean {
    const user = this.getUserAuth;
    if (!user || !user.roles) return false;
    const roles = Array.isArray(user.roles) ? user.roles : [];
    return roles.includes("admin") && !roles.includes("divisas");
  }
}

export default CoinsScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="11">
      <client-only>
        <v-card
          width="100%"
          height="180px"
          rounded="xl"
          class="card-principal-container pa-0 ma-0"
          color="#12539b"
          flat
        >
          <v-card-text>
            <v-row align-content="center" justify="space-between">
              <v-col
                cols="6"
                class="card-principal-info-container text-left d-flex flex-column align-self-center"
              >
                <p
                  class="text-h5 text-uppercase text-white font-weight-bold ml-10"
                >
                  Lista de Monedas,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus divisas de una manera mas sencilla!
                </p>
                <v-btn
                  v-if="canEditOrDelete"
                  @click="openDialogCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-5 ml-10 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Moneda"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="320px"
                  height="320px"
                  :loop="true"
                  ref="animationPromo"
                  :animationData="animationCoin"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="start">
    <v-col cols="4" v-for="(coin, i) in coins" :key="i">
      <v-card width="250" height="300" rounded="xl" class="pa-0 mx-4">
        <v-card-text class="pa-0">
          <v-row
            class="my-0"
            align-content="center"
            justify="center"
            no-gutters
          >
            <v-col cols="12">
              <div class="coin-card-image pa-5">
                <v-img
                  width="100%"
                  height="100%"
                  :src="coin.logo ?? coin.logoImageDetail?.image"
                  contain
                />
                <v-btn
                  @click="openDialogUpdate(coin)"
                  density="comfortable"
                  location="right top"
                  position="absolute"
                  class="mt-2 mr-2"
                  style="z-index: 10"
                  icon
                >
                  <v-icon color="#12539b" size="20"> mdi-pencil </v-icon>
                </v-btn>
                <v-btn
                  v-if="canEditOrDelete"
                  @click="openDialogAlertRemove(coin._id!)"
                  density="comfortable"
                  location="right bottom"
                  position="absolute"
                  class="mb-2 mr-2"
                  style="z-index: 10"
                  icon
                >
                  <v-icon color="#12539b" size="20"> mdi-delete </v-icon>
                </v-btn>
              </div>
            </v-col>
            <v-col cols="12" class="coin-card-info pa-3 text-left">
              <div class="my-2 d-flex align-center">
                <v-icon class="coin-card-icon" color="#ffffff" size="20">
                  mdi-cash
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">
                    Nombre y Prefijo
                  </p>
                  <p class="my-0 text-caption">
                    {{ coin.prefix }} - {{ coin.name }}
                  </p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <v-icon class="coin-card-icon" color="#ffffff" size="20">
                  mdi-cash
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Compra</p>
                  <p class="my-0 text-caption">RD${{ coin.price.buy }}</p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <v-icon class="coin-card-icon" color="#ffffff" size="20">
                  mdi-cash
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Venta</p>
                  <p class="my-0 text-caption">RD${{ coin.price.sell }}</p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- DIALOG CREATE AND UPDATE COINS -->
  <v-dialog v-model="dialog.show" width="500" persistent>
    <v-card rounded="xl" color="primary" title="Nueva Moneda">
      <v-card-text>
        <v-row justify="center" align-content="center">
          <v-col cols="12" class="text-center">
            <detailed-image-component
              v-model="dialog.coin.logoImageDetail"
              :legacy-image="dialog.coin.logo"
              avatar
            ></detailed-image-component>
          </v-col>
          <v-col cols="10">
            <v-row no-gutters>
              <v-col cols="6">
                <v-text-field
                  class="pr-2"
                  v-model="dialog.coin.prefix"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Prefijo"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pl-2"
                  v-model="dialog.coin.name"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Nombre de moneda"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pr-2"
                  type="number"
                  v-model="dialog.coin.price.buy"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Precio de compra"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pl-2"
                  type="number"
                  v-model="dialog.coin.price.sell"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Precio de venta"
                />
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn
          :disabled="dialog.loading"
          @click="closeDialogCoin()"
          variant="text"
        >
          Cancelar
        </v-btn>
        <v-spacer />
        <v-btn
          @click="validateAction()"
          :disabled="validateForm"
          :loading="dialog.loading"
          variant="text"
        >
          {{ dialog.action === "create" ? "Crear" : "Actualizar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- DIALOG DELETE COINS -->
  <v-dialog v-model="dialogRemove.show" max-width="480">
    <v-card class="" rounded="xl" color="primary">
      <v-card-item>
        <v-card-title class="text-body-1 text-orange">Advertencia</v-card-title>
        <v-card-subtitle class="text-caption"
          >Una vez eliminado se pierde la imagen, y datos de este
          item!</v-card-subtitle
        >
      </v-card-item>
      <v-card-text>
        <p class="my-2">
          <strong>¿Estas seguro de eliminar las promociones?</strong>
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text="Cancelar"
          variant="text"
          @click="closeDialogAlertRemove()"
        />
        <v-spacer />
        <v-btn
          text="Aceptar"
          variant="text"
          @click="removeCoins()"
          :loading="dialogRemove.loading"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- COINS LOGO -->
  <v-file-input
    ref="coinItemLogo"
    class="d-none"
    accept=".jpg, .jpeg, .png"
    @update:model-value="getImageCoinItem"
  />
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -50px;
  }

  .card-principal-animation {
    margin-top: -70px;
    margin-right: -20px;
  }
}

.coin-card-image {
  width: 95%;
  height: 120px;
  margin: 5px auto 0 auto;
  border-radius: 20px;
  background: #12539b;
  color: #ffffff;
  position: relative;
  align-items: center;
  text-align: center;

  p {
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 30px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.coin-card-info {
  background-color: #ffffff;
  color: #535353;

  .coin-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .coin-card-icon {
    width: 30px !important;
    height: 30px !important;
    background-color: #00a44f;
    border-radius: 100px;
  }
}

.banner-coin-month {
  height: 90px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}
</style>
