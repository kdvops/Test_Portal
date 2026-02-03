<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationProuser from "~/assets/animations/insurance-animation.json";
import {
  CLONE_PROUSER_POST,
  REMOVE_PROUSER_POST,
  PUBLISH_PROUSER_POST,
  DRAFT_PROUSER_POST,
} from "~/graphql/mutations/prouser.mutation";

// IMPORT QUERY'S
import { GET_PROUSER_GROUP_TYPE_POST } from "~/graphql/query/prouser.query";

// IMPORT INTERFACE
import type { ProuserGroupInterface } from "~/interfaces/prouser.interface";

import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "prouser-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class ProuserListScreen extends Vue {
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
  public animationProuser: any = AnimationProuser;

  // PROUSER DEFAULT VALUES
  public prouserGroup: Array<ProuserGroupInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();
  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: CLONE_PROUSER_POST,
        REMOVE_MUTATION: REMOVE_PROUSER_POST,
        PUBLISH_MUTATION: PUBLISH_PROUSER_POST,
        DRAFT_MUTATION: DRAFT_PROUSER_POST,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }

  public created() {
    this.setProuserByTypePost();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PROUSER BY TYPE POST
  public async setProuserByTypePost() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_PROUSER_GROUP_TYPE_POST,
        fetchPolicy: "no-cache",
      });

      // SET PROUSER
      this.prouserGroup = data.findProuserGroupByType;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "delete":
        this.generalStatusComposable!.removeItem(
          { prouserId: itemID },
          this.setProuserByTypePost
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { prouserId: itemID },
          this.setProuserByTypePost
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { prouserId: itemID },
          status!,
          this.setProuserByTypePost
        );
        return true;
    }
  };

  // GO TO CREATE SCREEN
  public goCreate() {
    this.$router.push("/prouser/post/create");
  }

  // GO TO UPDATE SCREEN
  public goUpdate(postID: string) {
    this.$router.push(`/prouser/post/update/${postID}`);
  }
}

export default ProuserListScreen;
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
                  Lista de Post Pro Usuario
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus post de una manera mas sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-3 ml-9 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Post"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="240px"
                  height="240px"
                  :loop="true"
                  :animationData="animationProuser"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="pa-12">
    <v-col cols="12" v-for="(group, i) in prouserGroup" :key="i">
      <div class="banner-prouser-category pl-2 pr-15">
        <h3 class="text-white text-uppercase">
          Tipo de publicación - {{ group.category.name }}
        </h3>
      </div>
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item v-for="prouser in group.prouser" :key="prouser._id">
          <v-card width="250" height="300" rounded="xl" class="pa-0 mx-4">
            <v-card-text class="pa-0">
              <v-row
                class="my-0"
                align-content="center"
                justify="center"
                no-gutters
              >
                <v-col cols="12">
                  <div class="prouser-card-image pa-0">
                    <v-img
                      width="100%"
                      height="100%"
                      class="rounded-xl"
                      :src="prouser.banner ?? prouser.bannerImageDetail?.image"
                      cover
                    >
                      <item-action-component
                        :item="{ ...prouser, name: prouser.title }"
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
                    </v-img>
                  </div>
                </v-col>
                <v-col cols="12" class="prouser-card-info pa-3 text-left">
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="prouser-card-icon"
                      style="background-color: #12539b"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-apps
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">ID</p>
                      <p class="my-0 text-caption">
                        {{ prouser._id }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="prouser-card-icon"
                      style="background-color: #12539b"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Titulo</p>
                      <p class="my-0 text-caption">
                        {{ prouser.title }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="prouser-card-icon"
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
                        {{ prouser.subtitle }}
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
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: 0px;
  }

  .card-principal-animation {
    margin-top: -50px;
    margin-right: -20px;
  }
}

.prouser-card-image {
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

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.prouser-card-info {
  background-color: #ffffff;
  color: #535353;

  .prouser-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .prouser-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }
}

.banner-prouser-category {
  height: 90px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}
</style>
