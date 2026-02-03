<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { TargetPostInterface } from "~/interfaces/target-post.interface";

// IMPORT QUERIES
import { GET_POSTS_BY_CATEGORY_ID } from "~/graphql/query/target-post.query";
import { GET_CATEGORY_BY_ID } from "~/graphql/query/categories.query";

// IMPORT MUTATIONS
import {
  CLONE_TARGET_POST,
  REMOVE_TARGET_POST,
  PUBLISH_TARGET_POST,
  DRAFT_TARGET_POST,
} from "~/graphql/mutations/target-post.mutation";

// IMPORT COMPOSABLES
import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "category-posts-component",
  components: {
    "item-action-component": ItemActionComponent,
  },
})
class CategoryPostsComponent extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public override $apollo: any;

  // PROPS
  @Prop({ required: true, type: String })
  public categoryId!: string;

  // POSTS LIST
  public posts: Array<any> = [];

  // LOADING
  public loading: boolean = false;

  // CATEGORY INFO
  public categoryInfo: any = null;

  // GENERAL ACTIONS COMPOSABLE
  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public async created() {
    // INIT GENERAL ACTIONS
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

    await this.loadCategoryInfo();
    await this.loadPosts();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // LOAD POSTS BY CATEGORY
  public async loadPosts() {
    if (!this.categoryId) return;

    this.loading = true;
    try {
      const { data } = await this.$apollo.query({
        query: GET_POSTS_BY_CATEGORY_ID,
        variables: {
          categoryId: this.categoryId,
        },
        fetchPolicy: "no-cache",
      });

      this.posts = data.findPostsByCategoryId || [];
    } catch (err) {
      this.$bus.$emit("handleError", err);
    } finally {
      this.loading = false;
    }
  }

  // LOAD CATEGORY INFO
  public async loadCategoryInfo() {
    if (!this.categoryId) return;

    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORY_BY_ID,
        variables: {
          categoryId: this.categoryId,
        },
        fetchPolicy: "no-cache",
      });

      this.categoryInfo = data.findCategoryById;
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // CREATE POST FOR THIS CATEGORY
  public createPost() {
    if (!this.categoryInfo) {
      this.$bus.$emit("showSnackbar", {
        text: "No se pudo obtener la información de la categoría",
        color: "warning",
        timeout: 4000,
      });
      return;
    }

    // DETERMINE TARGET FROM CATEGORY
    let targetSlug = "";

    // IF TARGET IS STATIC (e.g., "categoryInsurance")
    if (this.categoryInfo.target) {
      targetSlug = this.categoryInfo.target;
    }
    // IF TARGET IS DYNAMIC (ObjectId)
    else if (this.categoryInfo.targetID) {
      // CHECK IF IT'S A VALID OBJECTID
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(
        String(this.categoryInfo.targetID)
      );
      if (isValidObjectId) {
        targetSlug = this.categoryInfo.targetID;
      } else {
        // IF IT'S NOT A VALID OBJECTID, USE IT AS IS (MIGHT BE A STRING)
        targetSlug = this.categoryInfo.targetID;
      }
    }

    if (!targetSlug) {
      this.$bus.$emit("showSnackbar", {
        text: "No se pudo determinar el target de la categoría",
        color: "warning",
        timeout: 4000,
      });
      return;
    }

    // NAVIGATE TO CREATE POST WITH CATEGORY PRE-SELECTED
    this.$router.push({
      path: `/targets/${targetSlug}/post/create`,
      query: { categoryId: this.categoryId },
    });
  }

  // ITEM ACTION HANDLER
  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "delete":
        this.generalStatusComposable!.removeItem(
          { postId: itemID },
          this.loadPosts
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { postId: itemID },
          this.loadPosts
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { postId: itemID },
          status!,
          this.loadPosts
        );
        return true;
    }
    return false;
  };

  // GO TO UPDATE SCREEN
  public goUpdate(postID: string) {
    const post = this.posts.find((p) => p._id === postID);
    if (!post) return;

    // GET TARGET SLUG FROM POST TARGETID
    let targetSlug = "";
    if (post.targetID) {
      if (typeof post.targetID === "object" && post.targetID._id) {
        targetSlug = post.targetID._id;
      } else {
        targetSlug = String(post.targetID);
      }
    }

    if (!targetSlug) {
      this.$bus.$emit("showSnackbar", {
        text: "No se pudo determinar el target del post",
        color: "warning",
        timeout: 4000,
      });
      return;
    }

    this.$router.push(`/targets/${targetSlug}/post/update/${postID}`);
  }
}

// EXPORT COMPONENT
export default CategoryPostsComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row v-if="posts.length > 0 || loading" class="pa-12">
    <v-col cols="12">
      <!-- HEADER WITH CATEGORY NAME -->
      <div
        class="banner-business-category pl-2 pr-15"
        :style="{ backgroundColor: '#12539b' }"
      >
        <h3 class="text-white text-uppercase">
          Publicaciones - {{ categoryInfo?.name || "Cargando..." }}
        </h3>
      </div>

      <!-- HORIZONTAL SCROLL WITH CARDS -->
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item v-for="post in posts" :key="post._id">
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
                      :src="post.banner || post.thumbnail"
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
                      :style="{ backgroundColor: '#12539b' }"
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
                      :style="{ backgroundColor: '#12539b' }"
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
                      :style="{ backgroundColor: '#12539b' }"
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
