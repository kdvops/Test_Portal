<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/productos/prestamos/:categoryID",
  seoManual: true,
});

import { Vue } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { ProductInterface } from "~/interfaces/products.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";

// IMPORT GRAPHQL QUERY
import {
  GET_CATEGORY_BY_SLUG,
  GET_CATEGORY_BY_ID,
} from "~/graphql/categories.query";
import { GET_PRODUCTS_BY_CATEGORY_ID } from "~/graphql/products.query";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import HeroImage from '~/components/optimized-image/HeroImage.vue';
import CardImage from '~/components/optimized-image/CardImage.vue';


import { isObjectId } from "~/utils/objectIdUtils";

import type { ApolloClient } from "@apollo/client/core";
import {
  normalizeParam,
  registerSeoRefs,
  applyEntitySeoForKey,
  makeStringFieldPicker,
  makeIdFieldPicker,
} from "~/utils/seoUtil";
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "products-loans-screen",
  components: {
    // COMPONENTS CUSTOM APP
    HeroImage,
    CardImage,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as ProductsLoansScreen;
    const route = useRoute();
    const nuxtApp = useNuxtApp();
    const { client } = useApolloClient();

    const titleRef = ref<string>("");
    const descRef = ref<string>("");
    registerSeoRefs(nuxtApp, {
      titleRef,
      descRef,
      type: "website",
      priority: 10,
    });

    const selectEntity = (data: any, ctx: { isId: boolean }) =>
      (ctx.isId
        ? data.findCategoryById
        : data.findCategoryBySlug) as CategoriesInterface;

    const queries = {
      byIdQuery: GET_CATEGORY_BY_ID,
      bySlugQuery: GET_CATEGORY_BY_SLUG,
      varNames: { id: "categoryId", slug: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<CategoriesInterface>("name");
    const pickDesc = makeStringFieldPicker<CategoriesInterface>("description");
    const pickId = makeIdFieldPicker<CategoriesInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.pageParam === "string"
          ? vm.pageParam
          : normalizeParam(vm.pageParam as any);

      await applyEntitySeoForKey<CategoriesInterface>({
        client: client as ApolloClient<any>,
        currentRoute: route.path,
        key,
        currentKey,
        queries,
        pickTitle,
        pickDescription: pickDesc,
        titleRef,
        descRef,
      });

      vm.pageParam = key;
    };

    await loadForKey(normalizeParam(route.params.categoryID as any));
    watch(
      () => route.params.categoryID,
      async (next: any) => {
        await loadForKey(normalizeParam(next as any));
      }
    );
  },
})
export default class ProductsLoansScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  public bannerPromotion = '/assets/backgrounds/Banner-promociones.jpg';
  public bannerPoints = '/assets/backgrounds/Banner-Puntos.jpg';

  // GET PARAM CATEGORY ID
  public pageParam = useRoute().params.categoryID;
  public categoryID = "";

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

  // PRODUCTS BY PARENT CATEGORY
  public products: Array<ProductInterface> = [];

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // SET CATEGORY BY ID
    this.setCategoryById().then(
      (data) => {
        this.category = data;
        this.categoryID = this.category._id!;
        // SET PRODUCTS BY CATEGORY ID
        this.setProductByCategoryId();
      },
      (error) => {
        this.$router.push("/");
      }
    );
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PRODUCTS BY PARENT CATEGORY
  public async setCategoryById(): Promise<CategoriesInterface> {
    var param =
      typeof this.pageParam == "string"
        ? this.pageParam
        : this.pageParam.join("");
    var isAnObjectId = isObjectId(param);

    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: isAnObjectId ? GET_CATEGORY_BY_ID : GET_CATEGORY_BY_SLUG,
        variables: isAnObjectId
          ? { categoryId: this.pageParam }
          : { slug: this.pageParam },
        fetchPolicy: "no-cache",
      });

      return Promise.resolve(
        isAnObjectId ? data.findCategoryById : data.findCategoryBySlug
      );
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
      return Promise.reject(err);
    }
  }

  // SET PRODUCTS BY PARENT CATEGORY
  public async setProductByCategoryId() {
    try {
      // PARENT KEY PAYLOAD
      const categoryID = { categoryId: this.categoryID };

      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_PRODUCTS_BY_CATEGORY_ID,
        variables: categoryID,
        fetchPolicy: "no-cache",
      });

      // SET PRODUCTS
      this.products = data.findProductsByCategory;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public imparIndex(_id: string) {
    const getCard = this.products.filter((n, i) => i % 2 !== 0);
    const findCard = getCard.find((card) => card._id === _id);
    return findCard ? true : false;
  }
}
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
          $vuetify.display.mdAndDown &&
          (category.pictures.responsive ||
            category.pictures.responsiveImageDetail)
            ? category.pictures.responsive ??
              category.pictures.responsiveImageDetail?.image
            : category.pictures.banner ??
              category.pictures.bannerImageDetail?.image
        "
        :alt="
          $vuetify.display.mdAndDown && category.pictures.responsiveImageDetail
            ? category.pictures.responsiveImageDetail?.altText ?? ''
            : category.pictures.bannerImageDetail?.altText ?? ''
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

    <v-col v-for="product in products" class="mt-5" cols="11" md="9" lg="7">
      <v-card
        v-if="imparIndex(product._id!)"
        class="mx-2 my-2 pa-0"
        :height="$vuetify.display.mdAndDown ? 'auto' : 280"
        rounded="lg"
      >
        <v-row no-gutters>
          <v-col
            order="2"
            order-md="2"
            class="align-content-center"
            cols="12"
            md="12"
            lg="6"
          >
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2 text-primary">
                {{ product.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ product.description }}
              </p>
              <v-btn
                width="140"
                :to="`/productos/prestamos/${pageParam}/item/${product.slug}`"
                color="primary"
                class="mx-3 mt-3 text-caption text-uppercase"
                rounded="xl"
                style=""
              >
                Mas Información
              </v-btn>
            </div>
          </v-col>
          <v-col order="1" order-md="1" cols="12" md="12" lg="6">
            <CardImage
              :src="
                product.thumbnail ??
                product.thumbnailImageDetail?.image ??
                product.banner ??
                product.bannerImageDetail?.image
              "
              :alt="
                product.thumbnailImageDetail?.altText ??
                product.bannerImageDetail?.altText ??
                ''
              "
              :width="600"
              :height="$vuetify.display.mdAndDown ? 150 : 280"
              container-class="category-image-container"
              image-class="category-image"
            />
          </v-col>
        </v-row>
      </v-card>

      <v-card v-else class="mx-2 my-2" :height="$vuetify.display.mdAndDown ? 'auto' : 280" rounded="lg">
        <v-row no-gutters>
          <v-col order="1" order-md="2" cols="12" md="12" lg="6">
            <CardImage
            :src="
                product.thumbnail ??
                product.thumbnailImageDetail?.image ??
                product.banner ??
                product.bannerImageDetail?.image
              "
              :alt="
                product.thumbnailImageDetail?.altText ??
                product.bannerImageDetail?.altText ??
                ''
              "
              :width="600"
              :height="$vuetify.display.mdAndDown ? 150 : 280"
              container-class="category-image-container"
              image-class="category-image"
            />
          </v-col>
          <v-col order="2" order-md="1" class="align-content-center" cols="12" md="12" lg="6">
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2 text-primary">
                {{ product.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ product.description }}
              </p>
              <v-btn
                width="140"
                :to="`/productos/prestamos/${pageParam}/item/${product.slug}`"
                color="green"
                class="mx-3 mt-3 text-caption text-uppercase"
                rounded="xl"
                style=""
              >
                Mas Información
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
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
