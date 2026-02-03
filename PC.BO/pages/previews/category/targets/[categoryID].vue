<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { CategoriesInterface } from "~/interfaces/categories.interface";

// IMPORT GRAPHQL QUERY
import { GET_CATEGORY_BY_ID } from "~/graphql/query/categories.query";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "preview-category-targets-screen",
  components: {
    // COMPONENTS CUSTOM APP
  },
})
class PreviewCategoryTargetsScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM CATEGORY ID
  public categoryID = useRoute().params.categoryID;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // PRODUCTS BY PARENT CATEGORY
  public category: CategoriesInterface = {
    _id: "",
    name: "",
    slug: "",
    excerpt: "",
    description: "",
    tags: [],
    parentTarget: "",
    pictures: {
      thumbnail: "",
      banner: "",
      responsive: "",
    },
    disabled: false,
    target: "",
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // SET CATEGORY
    this.setCategoryById();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PRODUCTS BY PARENT CATEGORY
  public async setCategoryById() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORY_BY_ID,
        variables: { categoryId: this.categoryID },
        fetchPolicy: "no-cache",
      });

      this.category = data.findCategoryById;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
      return Promise.reject(err);
    }
  }
}
export default PreviewCategoryTargetsScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <v-img
        width="100%"
        height="500"
        :src="
          $vuetify.display.mdAndDown
            ? category.pictures.responsive
            : category.pictures.banner
        "
        cover
      />
    </v-col>

    <v-col cols="12" class="my-10 text-center">
      <h1 class="text-h5 text-primary font-weight-bold">
        {{ category.excerpt }}
      </h1>
      <p class="text-caption text-primary">
        {{ category.description }}
      </p>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-account-container {
  overflow: inherit !important;

  .icon-large-card {
    top: -80px;
    right: -40px;
    position: absolute;

    &.circle {
      top: -60px;
      right: -50px;
    }
  }
}

.info-category-card-large-container {
  width: 100%;
  bottom: 0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-content: center;

  .category-card-description {
    color: #000000;
    max-height: 120px;
    overflow: hidden;
  }
}

.card-promotions-container {
  overflow: inherit !important;

  .icon-large-card {
    top: -80px;
    right: -40px;
    position: absolute;

    &.circle {
      top: -60px;
      right: -50px;
    }
  }
}
</style>
