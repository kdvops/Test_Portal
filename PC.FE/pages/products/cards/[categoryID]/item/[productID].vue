<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/productos/tarjetas/:categoryID/item/:productID",
  seoManual: true,
});

import { Vue } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { ProductsInterface } from "~/interfaces/sections.interface";
import type { OptionsMenuInterface } from "~/interfaces/menu.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { ProductInterface } from "~/interfaces/products.interface";

// IMPORT COMPONENTS
import AppMenuComponent from "~/components/menu/index.vue";
import AppSectionsComponent from "~/components/sections/index.vue";
import HeroImage from '~/components/optimized-image/HeroImage.vue';

// IMPORT GRAPHQL QUERY
import {
  GET_PRODUCT_BY_ID,
  GET_PRODUCT_BY_SLUG,
  GET_PRODUCTS_BY_CATEGORY_ID,
} from "~/graphql/products.query";
import {
  GET_CATEGORY_BY_SLUG,
  GET_CATEGORY_BY_ID,
} from "~/graphql/categories.query";

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
  name: "products-cards-item-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-menu-component": AppMenuComponent,
    // COMPONENTS CUSTOM APP
    "app-sections-component": AppSectionsComponent,
    HeroImage,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as ProductsCardsItemScreen;
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
        ? data.findProductById
        : data.findProductBySlug) as ProductsInterface;

    const queries = {
      byIdQuery: GET_PRODUCT_BY_ID,
      bySlugQuery: GET_PRODUCT_BY_SLUG,
      varNames: { id: "_id", slug: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<ProductsInterface>("name");
    const pickDesc = makeStringFieldPicker<ProductsInterface>("description");
    const pickId = makeIdFieldPicker<ProductsInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.productPageParam === "string"
          ? vm.productPageParam
          : normalizeParam(vm.productPageParam as any);

      await applyEntitySeoForKey<ProductsInterface>({
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

      vm.productPageParam = key;
    };

    await loadForKey(normalizeParam(route.params.productID as any));
    watch(
      () => route.params.productID,
      async (next: any) => {
        await loadForKey(normalizeParam(next as any));
      }
    );
  },
})
export default class ProductsCardsItemScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET PARAM CATEGORY ID
  public productPageParam = useRoute().params.productID;
  public productID = "";

  // SECTIONS CARDS DEFAULT VALUES
  public product: ProductsInterface = {
    name: "",
    description: "",
    category: "",
    banner: "",
    sections: [],
  };

  // GET PARAM CATEGORY ID
  public pageParam = useRoute().params.categoryID;
  public categoryID = "";

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

  // MENU OPTIONS
  public menuOptions: OptionsMenuInterface = {
    route: "",
    current: "",
    default: {
      name: "",
      icon: "mdi-card",
      to: "",
    },
    items: [],
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    this.setCategoryById().then(
      async (data) => {
        this.category = data;
        this.categoryID = this.category._id!;
        // SET PRODUCTS BY CATEGORY ID
        this.setProductByCategoryId();

        // GET
        this.productID = await this.getProductIdBySlug().catch((err) => {
          throw err;
        });
        this.setProductCardById();
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
  public async getProductIdBySlug(): Promise<string> {
    try {
      var param =
        typeof this.productPageParam == "string"
          ? this.productPageParam
          : this.productPageParam.join("");
      var isAnObjectId = isObjectId(param);

      if (isAnObjectId) {
        return Promise.resolve(param);
      } else {
        const slug = { slug: this.productPageParam };

        // GET ALL CATEGORIES
        const { data } = await this.$apollo.query({
          query: GET_PRODUCT_BY_SLUG,
          variables: slug,
          fetchPolicy: "no-cache",
        });

        const product = data.findProductBySlug;
        return Promise.resolve(product._id);
      }
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
      return Promise.reject(err);
    }
  }

  // SET PRODUCT CARD BY ID
  public async setProductCardById() {
    try {
      // PAYLOAD BY ID
      const productID = {
        productId: this.productID,
      };

      // GET PRODUCT BY ID
      const { data } = await this.$apollo.query({
        query: GET_PRODUCT_BY_ID,
        variables: productID,
        fetchPolicy: "no-cache",
      });

      // SET PRODUCT
      const product = data.findProductById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = product.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : "",
        };
      });

      // SET PRODUCT TO VARIABLE
      this.product = { ...product, sections };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

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

      // SET MENU OPTIONS
      this.setMenuOptions();
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET MENU OPTIONS
  public setMenuOptions() {
    this.menuOptions = {
      route: "/productos/tarjetas/" + this.pageParam + "/item/",
      current: this.pageParam,
      default: {
        name: this.category.name,
        icon: "mdi-card",
        to: "/productos/tarjetas/" + this.pageParam,
      },
      items: this.products,
    };
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12" style="position: relative; z-index: 0;">
      <HeroImage
        :src="
          $vuetify.display.mdAndDown &&
          (product.responsive || product.responsiveImageDetail)
            ? product.responsive ?? product.responsiveImageDetail?.image
            : product.banner ?? product.bannerImageDetail?.image
        "
        :alt="
          $vuetify.display.mdAndDown && product.responsiveImageDetail
            ? product.responsiveImageDetail?.altText ?? ''
            : product.bannerImageDetail?.altText ?? ''
        "
        :width="1920"
        :height="500"
        loading="eager"
      />
    </v-col>

    <!-- MENU COMPONENT -->
    <v-col class="menu-categories py-0" cols="10">
      <app-menu-component :options="menuOptions" />
    </v-col>

    <!-- SECTION COMPONENT -->
    <v-col cols="12">
      <app-sections-component :sections="product.sections" />
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.menu-categories {
  margin-top: -25px;
  position: relative;
  z-index: 10;
}
</style>
