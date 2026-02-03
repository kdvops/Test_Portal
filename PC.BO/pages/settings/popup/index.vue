<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationPopup from "~/assets/animations/popup-animation.json";

// IMPORT INTERFACE
import type {
  PopupInterface,
  NewImagePopup,
} from "~/interfaces/popup.interface";

// IMPORT QUERY'S
import { GET_POPUPS } from "~/graphql/query/popup.query";

// IMPORT MUTATIONS
import {
  REMOVE_POPUP,
  UPDATE_POPUP,
  CREATE_POPUP,
  ACTIVE_POPUP,
} from "~/graphql/mutations/popup.mutation";

// IMPORT LODASH
import _ from "lodash";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "popup-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
  },
})
class PopupsScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION POPUP
  @Ref("animationPopups") animationPopups: any;

  // INPUT FILE IMAGES
  @Ref("popupItemLogo") popupItemLogo: any;

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
  public animationPopup: any = AnimationPopup;

  // DEFAULT POPUP ARRAY VALUES
  public popups: Array<PopupInterface> = [];

  // NEW LOGO POPUP
  public newImagePopup: Array<NewImagePopup> = [];

  // SELECTS ITEMS ORIENTATION POPUP
  public selectOrientationsPopup: Array<{ name: string; value: string }> = [
    {
      name: "En el centro",
      value: "popupCenter",
    },
    {
      name: "Abajo a la derecha",
      value: "popupBottomRight",
    },
    {
      name: "Abajo a la izquierda",
      value: "popupBottomLeft",
    },
    {
      name: "Abajo en el centro",
      value: "popupBottomCenter",
    },
  ];

  // LOADING
  public loading: boolean = false;

  // DIALOG DELETE POPUP OPTIONS
  public dialogRemove: { show: boolean; popupID: string; loading: boolean } = {
    show: false,
    popupID: "",
    loading: false,
  };

  // DIALOG CREATE AND UPDATE POPUP
  public dialog: {
    action: "update" | "create";
    show: boolean;
    popup: PopupInterface;
    loading: boolean;
  } = {
    show: false,
    action: "create",
    popup: {
      title: "",
      excerpt: "",
      subtitle: "",
      description: "",
      orientation: "popupCenter",
      button: {
        background: "",
        color: "",
        text: "",
      },
      background: "",
      color: "",
      link: "",
      image: "",
      active: false,
    },
    loading: false,
  };

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setPopups();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET IMAGE FILE AND SET IN ITEM POPUP
  public getImagePopupItem(file: File) {
    if (file) {
      if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png"
      ) {
        if (file.size <= 19520000) {
          const itemPicture = this.newImagePopup!;
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
    const imageRefs: any = this.popupItemLogo;

    // REF IMAGE RESET
    imageRefs.value = null;

    // REF IMAGE UPLOAD
    imageRefs.click();
  }

  // SET POPUP
  public async setPopups() {
    try {
      // GET ALL POPUP
      const { data } = await this.$apollo.query({
        query: GET_POPUPS,
        fetchPolicy: "no-cache",
      });

      // SET POPUP TO VARIABLE
      this.popups = data.findPopups;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // CREATE POPUP
  public async createPopup() {
    // SET LOADING
    this.dialog.loading = true;

    // CREATE POPUP DTO PAYLOAD
    const createPopupDto = {
      createPopupDto: { ...this.dialog.popup, image: this.newImagePopup },
    };

    try {
      // CREATE POPUP
      await this.$apollo.mutate({
        mutation: CREATE_POPUP,
        variables: createPopupDto,
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
      this.closeDialogPopup();

      // SET POPUP
      this.setPopups();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // CLOSE DIALOG
      this.closeDialogPopup();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE POPUP
  public async updatePopup() {
    // SET LOADING
    this.dialog.loading = true;

    // CLEAN POPUP
    let popupClean = _.omit({ ...this.dialog.popup }, ["_id"]);

    // UPDATE POPUP DTO PAYLOAD
    const updatePopupDto = {
      updatePopupDto: {
        popupID: this.dialog.popup._id,
        popup: popupClean,
        newImagePopup: this.newImagePopup,
      },
    };

    try {
      // UPDATE POPUP
      await this.$apollo.mutate({
        mutation: UPDATE_POPUP,
        variables: updatePopupDto,
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
      this.closeDialogPopup();

      // SET POPUP
      this.setPopups();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // CLOSE DIALOG
      this.closeDialogPopup();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // CHANGE STATUS POPUP
  public async changeStatusPopup(popupID: string) {
    // SET LOADING
    this.loading = true;

    try {
      // UPDATE POPUP
      await this.$apollo.mutate({
        mutation: ACTIVE_POPUP,
        variables: {
          popupId: popupID,
        },
      });

      // SET LOADING
      this.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        text: "Popup activado exitosamente!!",
        color: "success",
        timeout: 3000,
      });

      // SET POPUP
      this.setPopups();
    } catch (err) {
      // SET LOADING
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // REMOVE POPUP
  public async removePopups() {
    // SET LOADING
    this.dialogRemove.loading = true;

    // REMOVE POPUP DTO PAYLOAD
    const removePopupsDto = {
      popupId: this.dialogRemove.popupID,
    };

    try {
      // REMOVE POPUP
      await this.$apollo.mutate({
        mutation: REMOVE_POPUP,
        variables: removePopupsDto,
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

      // SET POPUP
      this.setPopups();
    } catch (err) {
      // SET LOADING
      this.dialogRemove.loading = false;

      // CLOSE DIALOG
      this.closeDialogAlertRemove();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO UPDATE POPUP
  public openDialogUpdate(popup: PopupInterface) {
    this.dialog.show = true;
    this.dialog.action = "update";
    this.dialog.popup = {
      _id: popup._id,
      title: popup.title,
      excerpt: popup.excerpt,
      subtitle: popup.subtitle,
      description: popup.description,
      orientation: popup.orientation,
      button: {
        background: popup.button.background,
        color: popup.button.color,
        text: popup.button.text,
      },
      background: popup.background,
      color: popup.color,
      link: popup.link,
      image: popup.image,
      active: popup.active,
    };
  }

  // GO TO CREATE POPUP
  public openDialogCreate() {
    this.dialog.show = true;
    this.dialog.action = "create";
    this.dialog.popup = {
      title: "",
      excerpt: "",
      subtitle: "",
      description: "",
      orientation: "popupCenter",
      button: {
        background: "",
        color: "",
        text: "",
      },
      background: "",
      color: "",
      link: "",
      image: "",
      active: false,
    };

    // CLEAN IMAGE LOGO
    this.newImagePopup = [];
  }

  // OPEN DIALOG ALERT REMOVE POPUP
  public openDialogAlertRemove(popupID: string) {
    this.dialogRemove.popupID = popupID;

    // OPEN DIALOG
    this.dialogRemove.show = true;
  }

  // OPEN DIALOG ALERT REMOVE POPUP
  public closeDialogPopup() {
    this.dialog.show = false;
    this.dialog.action = "create";
    this.dialog.popup = {
      title: "",
      excerpt: "",
      subtitle: "",
      description: "",
      orientation: "popupCenter",
      button: {
        background: "",
        color: "",
        text: "",
      },
      background: "",
      color: "",
      link: "",
      image: "",
      active: false,
    };

    // CLEAN IMAGE LOGO
    this.newImagePopup = [];
  }

  // OPEN DIALOG ALERT REMOVE POPUP
  public closeDialogAlertRemove() {
    this.dialogRemove.show = false;
    this.dialogRemove.popupID = "";
    this.dialogRemove.loading = false;
  }

  // VALIDATE STEPS AND ACTION DIALOG
  public validateAction() {
    if (this.dialog.action === "create") {
      this.createPopup();
      this.closeDialogPopup();
    } else {
      this.updatePopup();
      this.closeDialogPopup();
    }
  }

  // VALIDATE STEPS AND ACTION DIALOG
  public get validateForm(): boolean {
    let valid: boolean = false;
    if (this.dialog.action === "create") {
      valid =
        !this.dialog.popup.title ||
        !this.dialog.popup.subtitle ||
        !this.dialog.popup.description ||
        !this.dialog.popup.color ||
        !this.dialog.popup.background ||
        !this.dialog.popup.orientation ||
        !this.dialog.popup.link;
    } else {
      valid =
        !this.dialog.popup.title ||
        !this.dialog.popup.subtitle ||
        !this.dialog.popup.description ||
        !this.dialog.popup.color ||
        !this.dialog.popup.background ||
        !this.dialog.popup.orientation ||
        !this.dialog.popup.link;
    }

    return valid;
  }

  // VALIDATE IMAGE ITEM CARD
  public get validateImagePopup(): string {
    return this.newImagePopup && this.newImagePopup.length > 0
      ? this.newImagePopup[0].img!
      : this.dialog.popup.image;
  }
}

export default PopupsScreen;
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
                  Lista de popup,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus popups de una manera mas sencilla!
                </p>
                <v-btn
                  @click="openDialogCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-5 ml-10 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Popup"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="400px"
                  height="400px"
                  :loop="true"
                  ref="animationPromo"
                  :animationData="animationPopup"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="start">
    <v-col cols="4" v-for="(popup, i) in popups" :key="i">
      <v-card width="250" rounded="xl" class="pa-0 mx-4">
        <v-card-text class="pa-0">
          <v-row
            class="my-0"
            align-content="center"
            justify="center"
            no-gutters
          >
            <v-col cols="12">
              <div class="popup-card-image pa-5">
                <v-img width="100%" height="100%" :src="popup.image" contain />
                <v-btn
                  @click="openDialogUpdate(popup)"
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
                  @click="openDialogAlertRemove(popup._id!)"
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
            <v-col cols="12" class="popup-card-info pa-3 text-left">
              <div class="my-2 d-flex align-center">
                <v-icon class="popup-card-icon" color="#ffffff" size="20">
                  mdi-text
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Titulo</p>
                  <p class="my-0 text-caption">
                    {{ popup.title }}
                  </p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <v-icon
                  class="popup-card-icon white"
                  :color="popup.active ? 'green' : 'red'"
                  size="20"
                >
                  mdi-circle
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">
                    Estado de Popup
                  </p>
                  <p class="my-0 text-caption">
                    {{ popup.active ? "Activo" : "Inactivo" }}
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions>
          <v-btn
            @click="changeStatusPopup(popup._id!)"
            class="text-caption"
            color="primary"
            rounded="xl"
            variant="elevated"
            :disabled="popup.active"
            block
          >
            {{ popup.active ? "Ya esta activo" : "Activar Popup" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-col>
  </v-row>

  <!-- DIALOG CREATE AND UPDATE POPUP -->
  <v-dialog v-model="dialog.show" width="500" persistent>
    <v-card rounded="xl" color="primary">
      <v-card-text>
        <v-row justify="center" align-content="center">
          <v-col cols="12" class="text-center">
            <v-img
              width="100%"
              height="150px"
              @click="selectImage()"
              :icon="validateImagePopup ? 'mdi-pencil' : 'mdi-plus'"
              class="mt-3"
              color="#12539b"
              rounded="xl"
              :src="validateImagePopup"
              cover
            />
          </v-col>
          <v-col cols="12">
            <v-row no-gutters>
              <v-col cols="6">
                <v-text-field
                  class="pr-2"
                  v-model="dialog.popup.title"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Titulo del popup"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pl-2"
                  v-model="dialog.popup.subtitle"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Subtitulo del popup"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pr-2"
                  v-model="dialog.popup.link"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Link del popup"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pl-2"
                  v-model="dialog.popup.description"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Descripción del popup"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pr-2"
                  rounded="xl"
                  v-model="dialog.popup.color"
                  density="compact"
                  variant="solo"
                  label="Color de texto del popup"
                >
                  <template #prepend-inner>
                    <v-icon :color="dialog.popup.color"> mdi-record </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker
                      rounded="xl"
                      width="100%"
                      mode="hex"
                      v-model="dialog.popup.color"
                      density="compact"
                      variant="solo"
                      label="Color del fondo"
                    />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pl-2"
                  rounded="xl"
                  v-model="dialog.popup.background"
                  density="compact"
                  variant="solo"
                  label="Color de fondo de popup"
                >
                  <template #prepend-inner>
                    <v-icon :color="dialog.popup.background">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker
                      rounded="xl"
                      width="100%"
                      mode="hex"
                      v-model="dialog.popup.background"
                      density="compact"
                      variant="solo"
                      label="Color del fondo"
                    />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-select
                  class="pr-2"
                  v-model="dialog.popup.orientation"
                  rounded="xl"
                  density="compact"
                  :items="selectOrientationsPopup"
                  item-title="name"
                  item-value="value"
                  variant="solo"
                  label="Orientación del popup"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pl-2"
                  v-model="dialog.popup.button.text"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Texto del botón"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pr-2"
                  rounded="xl"
                  v-model="dialog.popup.button.color"
                  density="compact"
                  variant="solo"
                  label="Color de texto botón"
                >
                  <template #prepend-inner>
                    <v-icon :color="dialog.popup.button.color">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker
                      rounded="xl"
                      width="100%"
                      mode="hex"
                      v-model="dialog.popup.button.color"
                      density="compact"
                      variant="solo"
                      label="Color del fondo"
                    />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pl-2"
                  rounded="xl"
                  v-model="dialog.popup.button.background"
                  density="compact"
                  variant="solo"
                  label="Color de fondo botón"
                >
                  <template #prepend-inner>
                    <v-icon :color="dialog.popup.button.background">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker
                      rounded="xl"
                      width="100%"
                      mode="hex"
                      v-model="dialog.popup.button.background"
                      density="compact"
                      variant="solo"
                      label="Color del fondo"
                    />
                  </v-menu>
                </v-text-field>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn
          :disabled="dialog.loading"
          @click="closeDialogPopup()"
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

  <!-- DIALOG DELETE POPUP -->
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
          <strong>¿Estas seguro de eliminar el popup?</strong>
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
          @click="removePopups()"
          :loading="dialogRemove.loading"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- POPUP LOGO -->
  <v-file-input
    ref="popupItemLogo"
    class="d-none"
    accept=".jpg, .jpeg, .png"
    @update:model-value="getImagePopupItem"
  />
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -80px;
  }

  .card-principal-animation {
    margin-top: -120px;
    margin-right: -20px;
  }
}

.popup-card-image {
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

.popup-card-info {
  background-color: #ffffff;
  color: #535353;

  .popup-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .popup-card-icon {
    width: 30px !important;
    height: 30px !important;
    background-color: #00a44f;
    border-radius: 100px;
    &.white {
      background-color: #ffffff;
    }
  }
}

.banner-popup-month {
  height: 90px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}
</style>
