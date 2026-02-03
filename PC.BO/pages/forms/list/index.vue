<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationForm from "~/assets/animations/forms-animation.json";

// IMPORT INTERFACE
import type { FormsBscInterfaces } from "~/interfaces/forms.interfaces";

// IMPORT QUERY'S
import { GET_FORMS_BSC } from "~/graphql/query/forms.query";

// IMPORT MUTATIONS
import {
  CLONE_FORM,
  REMOVE_FORMS_BSC,
  PUBLISH_FORM,
  DRAFT_FORM,
} from "~/graphql/mutations/forms.mutation";

import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "forms-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class FormsListScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION PROMO
  @Ref("animationPromo") animationPromo: any;

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
  public animationForm: any = AnimationForm;

  // DIALOG DELETE ITEM OPTIONS
  public dialogDuplicate = {
    show: false,
    itemID: "",
    loading: false,
  };

  // PROMOTION DEFAULT VALUES
  public formsBsc: Array<FormsBscInterfaces> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();
  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: CLONE_FORM,
        REMOVE_MUTATION: REMOVE_FORMS_BSC,
        PUBLISH_MUTATION: PUBLISH_FORM,
        DRAFT_MUTATION: DRAFT_FORM,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }
  public created() {
    this.setForms();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET FORMS
  public async setForms() {
    try {
      // GET ALL FORMS
      const { data } = await this.$apollo.query({
        query: GET_FORMS_BSC,
        fetchPolicy: "no-cache",
      });

      // SET FORMS TO VARIABLE
      this.formsBsc = data.findForms;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // COPY TEXT CLIPBOARD
  public async copyClipboardFormUrl(formID: string) {
    try {
      // Intenta escribir el texto en el portapapeles
      await navigator.clipboard.writeText(`/forms/${formID}`);
      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Texto copiado en portapapeles",
        color: "success",
        timeout: 6000,
      });
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", "No se pudo copiar el texto!!");
    }
  }

  // GO TO UPDATE PROMOTION
  public goUpdate(formID: string) {
    this.$router.push(`/forms/update/${formID}`);
  }

  // GO TO CREATE PROMOTION
  public goCreate() {
    this.$router.push(`/forms/create`);
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "delete":
        this.generalStatusComposable!.removeItem(
          { formsId: itemID },
          this.setForms
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { formsId: itemID },
          this.setForms
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { formId: itemID },
          status!,
          this.setForms
        );
        return true;
    }
  };
}

export default FormsListScreen;
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
                  Lista de formularios,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus formularios de una manera mas
                  sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-5 ml-10 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Formulario"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="280px"
                  height="280px"
                  :loop="true"
                  ref="animationPromo"
                  :animationData="animationForm"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5" justify="start" align-content="center">
    <v-col cols="3">
      <v-text-field
        class="ml-5"
        prepend-inner-icon="mdi-magnify"
        rounded="xl"
        density="compact"
        variant="solo"
        label="Buscar formulario"
      />
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="start">
    <v-col cols="3" v-for="(formBsc, i) in formsBsc" :key="i">
      <v-card height="300" rounded="xl" class="pa-0 mx-4">
        <v-card-text class="pa-0">
          <v-row
            class="my-0"
            align-content="center"
            justify="center"
            no-gutters
          >
            <v-col cols="12">
              <div class="forms-card-image pa-5">
                <v-img
                  v-if="formBsc.banner || formBsc.bannerImageDetail"
                  width="100%"
                  height="100%"
                  :src="formBsc.banner ?? formBsc.bannerImageDetail?.image"
                  rounded="xl"
                  contain
                />
                <p v-else>{{ formBsc.title }}</p>
                <item-action-component
                  :item="{ ...formBsc, name: formBsc.title }"
                  :onItemAction="itemAction"
                  update
                  copy
                  status
                  delete
                  variant="flat"
                  color="white"
                  density="comfortable"
                  location="right top"
                  position="absolute"
                  class="mt-2 mr-2"
                ></item-action-component>
              </div>
            </v-col>
            <v-col cols="12" class="forms-card-info pa-3 text-left">
              <div class="my-2 d-flex align-center">
                <v-icon class="forms-card-icon" color="#ffffff" size="20">
                  mdi-text
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Titulo</p>
                  <p class="my-0 text-caption">
                    {{ formBsc.title || "Sin texto" }}
                  </p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Slug</p>
                  <p
                    @click="copyClipboardFormUrl(formBsc.slug!)"
                    class="my-0 text-wrap text-caption"
                    style="cursor: pointer"
                  >
                    /forms/{{ formBsc.slug }}
                  </p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Link</p>
                  <p
                    @click="copyClipboardFormUrl(formBsc._id!)"
                    class="my-0 text-wrap text-caption"
                    style="cursor: pointer"
                  >
                    /forms/{{ formBsc._id }}
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -70px;
  }

  .card-principal-animation {
    margin-top: -10px;
    margin-right: -20px;
  }
}

.forms-card-image {
  width: 95%;
  height: 120px;
  margin: 5px auto 0 auto;
  border-radius: 20px;
  background: #12539b;
  color: #ffffff;
  align-items: center;
  text-align: center;
  position: relative;

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

.forms-card-info {
  background-color: #ffffff;
  color: #535353;

  .forms-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .forms-card-icon {
    width: 30px !important;
    height: 30px !important;
    background-color: #12539b;
    border-radius: 100px;
  }
}

.banner-forms-month {
  height: 90px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}
</style>
