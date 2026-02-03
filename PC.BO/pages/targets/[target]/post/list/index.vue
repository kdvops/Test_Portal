<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationBusiness from "~/assets/animations/business-animation.json";
import {
  CLONE_TARGET_POST,
  REMOVE_TARGET_POST,
  PUBLISH_TARGET_POST,
  DRAFT_TARGET_POST,
} from "~/graphql/mutations/target-post.mutation";

// IMPORT QUERY'S
import { GET_TARGET_POST_GROUP_BY_CATEGORY } from "~/graphql/query/target-post.query";
import { GET_TARGET_BY_ID } from "~/graphql/query/targets.query";

// IMPORT INTERFACE
import type {
  TargetPostGroupInterface,
  TargetPostInterface,
} from "~/interfaces/target-post.interface";
import type { TargetInterface } from "~/interfaces/targets.interface";

import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "target-post-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class TargetPostListScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM TARGET
  public targetParam = useRoute().params.target;

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public override $apollo: any;

  // ANIMATIONS LOTTIE
  public animationBusiness: any = AnimationBusiness;

  // TARGET POSTS DEFAULT VALUES
  public targetPostGroup: Array<TargetPostGroupInterface> = [];

  // TARGET INFO
  public targetInfo: TargetInterface | null = null;

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();

  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: CLONE_TARGET_POST,
        REMOVE_MUTATION: REMOVE_TARGET_POST,
        PUBLISH_MUTATION: PUBLISH_TARGET_POST,
        DRAFT_MUTATION: DRAFT_TARGET_POST,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }

  public created() {
    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });

    this.setTargetInfo();
    this.setTargetPostsByCategory();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET TARGET INFO
  public async setTargetInfo() {
    try {
      // GET TARGET INFO
      const { data } = await this.$apollo.query({
        query: GET_TARGET_BY_ID,
        variables: {
          targetId: this.targetParam,
        },
        fetchPolicy: "no-cache",
      });

      // SET TARGET INFO
      this.targetInfo = data.findTargetById;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET TARGET POSTS BY CATEGORY
  public async setTargetPostsByCategory() {
    try {
      // GET ALL POSTS FOR THIS TARGET
      const { data } = await this.$apollo.query({
        query: GET_TARGET_POST_GROUP_BY_CATEGORY,
        variables: {
          targetId: this.targetParam,
          findAll: true,
        },
        fetchPolicy: "no-cache",
      });

      // SET TARGET POSTS
      this.targetPostGroup = data.findPostsGroupByCategory;
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
          { postId: itemID },
          this.setTargetPostsByCategory
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { postId: itemID },
          this.setTargetPostsByCategory
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { postId: itemID },
          status!,
          this.setTargetPostsByCategory
        );
        return true;
    }
  };

  // GO TO CREATE SCREEN
  public goCreate() {
    this.$router.push(`/targets/${this.targetParam}/post/create`);
  }

  // GO TO UPDATE SCREEN
  public goUpdate(postID: string) {
    this.$router.push(`/targets/${this.targetParam}/post/update/${postID}`);
  }

  // GO TO CATEGORIES
  public goToCategories() {
    this.$router.push(`/targets/${this.targetParam}/categories/list`);
  }
}

export default TargetPostListScreen;
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
          :color="targetInfo?.color || '#12539b'"
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
                  {{ targetInfo?.name || "Cargando..." }} - Posts
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Gestiona los posts de
                  {{ targetInfo?.name || "este target" }} de manera sencilla!
                </p>
                <div class="d-flex mt-3 ml-9">
                  <v-btn
                    @click="goCreate()"
                    width="130"
                    variant="outlined"
                    class="text-caption mr-3"
                    rounded="xl"
                    density="compact"
                    text="Crear Post"
                  />
                  <v-btn
                    @click="goToCategories()"
                    width="130"
                    variant="outlined"
                    class="text-caption"
                    rounded="xl"
                    density="compact"
                    text="Ver Categorías"
                  />
                </div>
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="350px"
                  height="350px"
                  :loop="true"
                  :animationData="animationBusiness"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="pa-12">
    <v-col cols="12" v-for="(group, i) in targetPostGroup" :key="i">
      <div
        class="banner-business-category pl-2 pr-15"
        :style="{ backgroundColor: targetInfo?.color || '#12539b' }"
      >
        <h3 class="text-white text-uppercase">
          Publicaciones - {{ group.category.name }}
        </h3>
      </div>
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item v-for="post in group.posts" :key="post._id">
          <v-card width="250" height="300" rounded="xl" class="pa-0 mx-4">
            <v-card-text class="pa-0">
              <v-row
                class="my-0"
                align-content="center"
                justify="center"
                no-gutters
              >
                <v-col cols="12">
                  <div class="business-card-image pa-0">
                    <v-img
                      width="100%"
                      height="100%"
                      class="rounded-xl"
                      :src="post.banner ?? post.bannerImageDetail?.image"
                      :alt="post.altTextBanner ?? post.bannerImageDetail?.altText"
                      cover
                    >
                      <item-action-component
                        :item="{ ...post, name: post.title }"
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
                <v-col cols="12" class="business-card-info pa-3 text-left">
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="business-card-icon"
                      :style="{
                        backgroundColor: targetInfo?.color || '#12539b',
                      }"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-apps
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">ID</p>
                      <p class="my-0 text-caption">
                        {{ post._id }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="business-card-icon"
                      :style="{
                        backgroundColor: targetInfo?.color || '#12539b',
                      }"
                      color="#ffffff"
                      size="20"
                    >
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Titulo</p>
                      <p class="my-0 text-caption">
                        {{ post.title }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon
                      class="business-card-icon"
                      :style="{
                        backgroundColor: targetInfo?.color || '#12539b',
                      }"
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
                        {{ post.subtitle }}
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
    margin-top: -70px;
  }

  .card-principal-animation {
    margin-top: -80px;
    margin-right: -20px;
  }
}

.business-card-image {
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

.business-card-info {
  background-color: #ffffff;
  color: #535353;

  .business-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .business-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
  }
}

.banner-business-category {
  height: 90px;
  border-radius: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
