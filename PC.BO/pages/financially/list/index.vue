<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });
import AnimationLocation from "~/assets/animations/page-seo.json";
import { shouldDisplayTogglePin } from "~/utils/financiallyPins";

// IMPORT ANIMATIONS LOTTIE
import AnimationFinancially from "~/assets/animations/financially-animation.json";
import {
  CLONE_FINANCIALLY,
  REMOVE_FINANCIALLY,
  PUBLISH_FINANCIALLY,
  DRAFT_FINANCIALLY,
  TOGGLE_FINANCIALLY_PIN,
} from "~/graphql/mutations/financially.mutation";

// IMPORT QUERY'S
import { GET_FINANCIALLY_GROUP_TYPE_POST } from "~/graphql/query/financially.query";

// IMPORT INTERFACE
import type {
  FinanciallyGroupInterface,
  FinanciallyInterface,
  TypePostFinancially,
} from "~/interfaces/financially.interface";

import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "financially-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class FinanciallyListScreen extends Vue {
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
  public animationFinancially: any = AnimationFinancially;

  // FINANCIALLY DEFAULT VALUES
  public financiallyGroup: Array<FinanciallyGroupInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();
  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: CLONE_FINANCIALLY,
        REMOVE_MUTATION: REMOVE_FINANCIALLY,
        PUBLISH_MUTATION: PUBLISH_FINANCIALLY,
        DRAFT_MUTATION: DRAFT_FINANCIALLY,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }

  public created() {
    this.setFinanciallyByTypePost();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET FINANCIALLY BY TYPE POST
  public async setFinanciallyByTypePost() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_FINANCIALLY_GROUP_TYPE_POST,
        fetchPolicy: "no-cache",
      });

      // SET FINANCIALLY
      this.financiallyGroup = data.findFinanciallyGroupByType;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public async toggleFinanciallyPin(financiallyId: string) {
    try {
      // REMOVE SLIDER
      await this.$apollo.mutate({
        mutation: TOGGLE_FINANCIALLY_PIN,
        variables: { financiallyId },
      });

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Pin cambiado correctamente!",
        color: "success",
        timeout: 6000,
      });
    } catch (err) {
      console.log("Error", err);
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO CREATE SCREEN
  public goCreate() {
    this.$router.push("/financially/create");
  }

  // GO TO UPDATE SCREEN
  public goUpdate(postID: string) {
    this.$router.push(`/financially/update/${postID}`);
  }

  // GET TYPE POST NAME
  public getTypePostName(type: string) {
    let defaultName = "Desconocido";

    switch (type) {
      case "post::article":
        defaultName = "Artículo";
        break;
      case "post::release":
        defaultName = "Nota de Prensa";
        break;
      case "post::events":
        defaultName = "Evento";
        break;
      default:
        defaultName = "Desconocido";
    }
    return defaultName;
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "delete":
        this.generalStatusComposable!.removeItem(
          { financiallyId: itemID },
          this.setFinanciallyByTypePost
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { financiallyId: itemID },
          this.setFinanciallyByTypePost
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { financiallyId: itemID },
          status!,
          this.setFinanciallyByTypePost
        );
        return true;
    }
  };

  public togglePin(financiallyPost: FinanciallyInterface) {
    if (financiallyPost) {
      if (financiallyPost.pinnedAt) {
        financiallyPost.pinnedAt = null;
      } else {
        financiallyPost.pinnedAt = new Date().toISOString();
      }
      this.toggleFinanciallyPin(financiallyPost._id!);
    }
  }

  public displayTogglePin(financiallyPost: FinanciallyInterface) {
    return shouldDisplayTogglePin(this.financiallyGroup, financiallyPost, 3);
  }
}

export default FinanciallyListScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <!-- HERO / HEADER -->
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="11">
      <client-only>
        <v-card
          width="100%"
          height="180px"
          rounded="xl"
          color="#12539b"
          flat
          class="financially-hero pa-0 ma-0"
        >
          <v-card-text>
            <v-row align-content="center" justify="space-between">
              <v-col
                cols="6"
                class="financially-hero__content text-left d-flex flex-column align-self-center"
              >
                <p
                  class="financially-hero__title text-h5 text-uppercase text-white font-weight-bold ml-10"
                >
                  Lista de post Financieramente,
                </p>
                <p
                  class="financially-hero__subtitle text-caption text-white font-weight-light ml-10"
                >
                  Ahora puedes gestionar tus post de una manera mas sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  rounded="xl"
                  density="compact"
                  class="financially-hero__cta mt-3 ml-9 text-caption"
                  text="Crear Post"
                />
              </v-col>

              <v-col cols="5" class="financially-hero__animation">
                <app-lottie
                  width="350px"
                  height="350px"
                  :loop="true"
                  :animationData="animationFinancially"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>

  <!-- LISTA DE GRUPOS / CARDS -->
  <v-row class="pa-12 financially-category_list">
    <v-col
      class="financially-category__item"
      cols="12"
      v-for="(group, i) in financiallyGroup"
      :key="i"
    >
      <div class="financially-category__banner pl-2 pr-15">
        <h3 class="financially-category__title text-white text-uppercase">
          Tipo de publicación - {{ getTypePostName(group.type) }}
        </h3>
      </div>

      <v-slide-group class="financially-list__group pa-4" show-arrows>
        <v-slide-group-item
          v-for="financially in group.financially"
          :key="financially._id"
        >
          <v-card
            width="250"
            height="300"
            rounded="xl"
            class="financially-card pa-0 mx-4"
          >
            <v-card-text class="pa-0">
              <v-row
                class="my-0"
                align-content="center"
                justify="center"
                no-gutters
              >
                <v-col cols="12">
                  <div class="financially-card__image-wrapper pa-0">
                    <v-img
                      width="100%"
                      height="100%"
                      class="financially-card__image rounded-xl"
                      :src="
                        financially.banner ??
                        financially.bannerImageDetail?.image
                      "
                      cover
                    >
                      <v-btn
                        v-if="displayTogglePin(financially)"
                        @click="togglePin(financially)"
                        variant="flat"
                        color="white"
                        density="comfortable"
                        location="left top"
                        position="absolute"
                        class="financially-card__pin-button mt-2 mr-2"
                        icon
                      >
                        <v-icon size="18" v-if="!financially.pinnedAt">
                          mdi-pin
                        </v-icon>
                        <v-icon size="18" v-else>mdi-pin-off</v-icon>
                      </v-btn>

                      <item-action-component
                        :item="{ ...financially, name: financially.title }"
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
                        class="financially-card__actions mt-2 mr-2"
                      />
                    </v-img>
                  </div>
                </v-col>

                <v-col cols="12" class="financially-card__info pa-3 text-left">
                  <div
                    class="financially-card__info-row my-2 d-flex align-center"
                  >
                    <v-icon
                      class="financially-card__icon"
                      style="background-color: #12539b"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Titulo</p>
                      <p class="my-0 text-caption">
                        {{ financially.title }}
                      </p>
                    </div>
                  </div>

                  <div
                    class="financially-card__info-row my-2 d-flex align-center"
                  >
                    <v-icon
                      class="financially-card__icon"
                      style="background-color: #12539b"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">
                        Subtitulo
                      </p>
                      <p class="my-0 text-caption">
                        {{ financially.subtitle }}
                      </p>
                    </div>
                  </div>

                  <div
                    class="financially-card__info-row my-2 d-flex align-center"
                  >
                    <v-icon
                      class="financially-card__icon"
                      style="background-color: #12539b"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Extracto</p>
                      <p class="my-0 text-caption">
                        {{ financially.excerpt }}
                      </p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
/* HERO / HEADER */
.financially-hero {
  overflow: inherit !important;

  &__content {
    height: 180px !important;
    margin-top: -70px;
  }

  &__title {
    // extra hero title styles could go here if needed
  }

  &__subtitle {
    // extra subtitle styles here if needed
  }

  &__cta {
    // CTA-specific tweaks here if needed
  }

  &__animation {
    margin-top: -80px;
    margin-right: -20px;
  }
}

/* CATEGORY BANNER */
.financially-category__banner {
  height: 90px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}

.financially-category__title {
  // here you can tweak typography if needed
}

/* LIST WRAPPER (per group) */
.financially-list__group {
  // optional spacing, background, etc.
}

/* CARD */
.financially-card {
  &__image-wrapper {
    width: 95%;
    height: 120px;
    margin: 5px auto 0 auto;
    border-radius: 20px;
    color: #ffffff;
    align-items: center;
    text-align: center;

    p {
      font-weight: 700;
      text-transform: uppercase;
      margin-top: 30px;
    }
  }

  &__image {
    width: 100%;
    height: 100%;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }

  &__pin-button {
    // place for pin button specific tweaks if needed
  }

  &__actions {
    // place for actions-menu specific tweaks
  }

  &__info {
    background-color: #ffffff;
    color: #535353;
  }

  &__info-row {
    // each icon + text row
  }

  &__icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }

  &__condition {
    height: 115px;
    overflow: hidden;
  }
}
</style>
