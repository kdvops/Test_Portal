<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/beneficios/categoria/:_id",
  seoManual: true,
});

import { Vue, Watch } from "vue-facing-decorator";
// IMPORT COMPONENTS
import AppCarouselComponent from "~/components/carousel/index.vue";
import AppProfitCardComponent from "~/components/profits/index.vue";
import AppMenuComponent from "~/components/menu/index.vue";

// IMPORT INTERFACES
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { ProfitInterface } from "~/interfaces/profits.interface";
import type { OptionsMenuInterface } from "~/interfaces/menu.interface";

// IMPORT GRAPHQL QUERY
import {
  GET_CATEGORIES_BY_TARGET,
  GET_CATEGORY_BY_ID,
  GET_CATEGORY_BY_SLUG,
} from "~/graphql/categories.query";
import { GET_PROFITS_BY_CATEGORY } from "~/graphql/profits.query";

import { isObjectId } from "~/utils/objectIdUtils";

import HeroImage from "~/components/optimized-image/HeroImage.vue";
import IconImage from "~/components/optimized-image/IconImage.vue";

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
  name: "profits-category-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-carousel-component": AppCarouselComponent,
    "app-profit-card-component": AppProfitCardComponent,
    "app-menu-component": AppMenuComponent,
    HeroImage,
    IconImage,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as ProfitsCategoryScreen;
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

    await loadForKey(normalizeParam(route.params._id as any));
    watch(
      () => route.params._id,
      async (next: any) => {
        await loadForKey(normalizeParam(next as any));
      }
    );
  },
})
export default class ProfitsCategoryScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  public bannerPromotion = "/assets/backgrounds/Banner-promociones.jpg";
  public bannerPoints = "/assets/backgrounds/Banner-Puntos.jpg";

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // CATEGORIES
  public categories: Array<CategoriesInterface> = [];

  // CATEGORY
  public category: CategoriesInterface = {
    _id: "",
    slug: "",
    name: "",
    description: "",
    excerpt: "",
    disabled: false,
    target: "",
    pictures: {
      thumbnail: "",
      banner: "",
      responsive: "",
    },
  };

  // GET PARAM CATEGORY ID
  public pageParam = useRoute().params._id;
  public categoryID = "";

  // PROFITS BY CATEGORY
  public profits: Array<ProfitInterface> = [];

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
    this.getCategoryIdBySlug().then(
      (categoryId) => {
        this.categoryID = categoryId;

        // GET CATEGORIES BY TARGET
        this.getCategoriesByTarget();
        // GET CATEGORY BY ID
        this.getCategoryById();
        // GET PROFITS BY CATEGORY
        this.setProfitsByCategory();
      },
      (error) => {
        this.$router.push("/");
      }
    );
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET CATEGORIES BY TARGET
  public async getCategoriesByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: "category::profits",
        },
        fetchPolicy: "no-cache",
      });

      // SET PROFITS
      this.categories = data.findCategoryByTarget.filter(
        (category: CategoriesInterface) => category.disabled === false
      );
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  private async getCategoryIdBySlug(): Promise<string> {
    var param =
      typeof this.pageParam == "string"
        ? this.pageParam
        : this.pageParam.join("");
    var isAnObjectId = isObjectId(param);

    try {
      // PAYLOAD BY ID
      const slug = { slug: this.pageParam };

      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: isAnObjectId ? GET_CATEGORY_BY_ID : GET_CATEGORY_BY_SLUG,
        variables: isAnObjectId
          ? { categoryId: this.pageParam }
          : { slug: this.pageParam },
        fetchPolicy: "no-cache",
      });

      const dta = isAnObjectId
        ? data.findCategoryById
        : data.findCategoryBySlug;
      return Promise.resolve(dta._id);
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError freom cid", err);
      return Promise.reject(err);
    }
  }

  // GET CATEGORY BY ID
  public async getCategoryById() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORY_BY_ID,
        variables: {
          categoryId: this.categoryID,
        },
        fetchPolicy: "no-cache",
      });

      // SET PROFITS
      this.category = data.findCategoryById;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET PROFITS GROUP BY CATEGORY
  public async setProfitsByCategory() {
    try {
      // GET ALL PROFITS
      const { data } = await this.$apollo.query({
        query: GET_PROFITS_BY_CATEGORY,
        variables: {
          categoryId: this.categoryID,
        },
        fetchPolicy: "no-cache",
      });

      this.profits = data.findProfitsByCategory;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET MENU OPTIONS
  public setMenuOptions() {
    this.menuOptions = {
      route: "/beneficios/categoria/",
      current: this.pageParam,
      default: {
        name: "Beneficios Santa Cruz",
        icon: "mdi-home",
        to: "/beneficios",
      },
      items: this.categories,
    };
  }

  @Watch("categories", { deep: true })
  public onSetCategories() {
    this.setMenuOptions();
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row
    class="hero-banners-container"
    justify="center"
    align-content="center"
    no-gutters
  >
    <!-- BANNER CAROUSEL -->
    <v-col cols="12" style="position: relative; z-index: 0">
      <HeroImage
        :src="
          category.pictures.banner ?? category.pictures.bannerImageDetail?.image
        "
        :alt="category.pictures.bannerImageDetail?.altText ?? ''"
        :width="1920"
        :height="500"
        loading="eager"
      />
    </v-col>

    <!-- MENU COMPONENT -->
    <v-col
      class="py-0 menu-wrapper"
      cols="12"
      style="position: relative; z-index: 10"
    >
      <app-menu-component :options="menuOptions" />
    </v-col>

    <v-col cols="5">
      <h3 class="text-center px-5 mt-15 text-primary">
        {{ category.description }}
      </h3>
    </v-col>

    <v-col class="text-center" cols="12">
      <v-divider
        class="my-5 mx-auto border-opacity-100"
        thickness="5"
        color="green"
        length="60"
      />
    </v-col>
    <v-col class="mt-10" cols="12" md="10" lg="8">
      <v-row justify="center" align="stretch">
        <v-col
          cols="10"
          md="5"
          lg="4"
          v-for="profit in profits"
          :key="profit._id"
          class="d-flex"
        >
          <app-profit-card-component :options="{ profit }" />
        </v-col>
      </v-row>
    </v-col>
    <v-col class="mt-10" cols="12">
      <div class="banner-promotion-wrapper">
        <HeroImage
          :src="bannerPromotion"
          :alt="'Banner de promociones'"
          :width="1920"
          :height="500"
          loading="lazy"
          :container-class="'banner-promotion-bg'"
        />
        <!-- Elemento decorativo izquierda -->
        <div class="banner-decorative-left promotion-symbol">£</div>
        <!-- Elemento decorativo derecha -->
        <IconImage
          src="/assets/icons/shopping-bag.svg"
          alt="Icono de compras"
          :width="200"
          :height="200"
          class="banner-decorative-right promotion-icon"
        />
        <!-- Contenido del banner -->
        <div class="banner-content-wrapper">
          <v-card
            :width="$vuetify.display.mdAndDown ? '90%' : '60%'"
            class="card-promotions-container mx-auto pa-8"
            rounded="xl"
            color="#0961ad"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <h1 class="text-white font-weight-bold text-h4">
                  Promociones
                </h1>
                <IconImage
                  src="/assets/icons/shopping-bag.svg"
                  alt="Icono de compras"
                  :width="32"
                  :height="32"
                  container-class="ml-4"
                />
              </div>
              <p class="text-white text-body-2 font-weight-regular mb-6">
                Ahorro en tu experiencias de compras al pagar con tus <strong>Tarjetas de Crédito del Banco Santa Cruz.</strong>
              </p>
              <div class="d-flex justify-start">
                <v-btn
                  width="200"
                  height="45"
                  to="/promociones"
                  class="text-body-2"
                  variant="elevated"
                  rounded="xl"
                  color="green"
                >
                  Nuestras Promociones
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-col>
    <v-col class="mt-10" cols="12">
      <div class="banner-points-wrapper">
        <HeroImage
          :src="bannerPoints"
          :alt="'Banner de puntos'"
          :width="1920"
          :height="500"
          loading="lazy"
          :container-class="'banner-points-bg'"
        />
        <!-- Elemento decorativo izquierda -->
        <div class="banner-decorative-left points-circle"></div>
        <!-- Elemento decorativo derecha inferior -->
        <div class="banner-decorative-bottom-right accessibility-icon">
          <v-icon size="40" color="white">mdi-human-handsup</v-icon>
        </div>
        <!-- Contenido del banner -->
        <div class="banner-content-wrapper">
          <v-card
            :width="$vuetify.display.mdAndDown ? '90%' : '60%'"
            class="card-points-container mx-auto pa-8"
            rounded="xl"
            color="rgba(255, 255, 255, 0.9)"
          >
            <v-card-text class="pa-6">
              <div class="d-flex align-center mb-4">
                <h1 class="text-primary font-weight-bold text-h4">
                  Puntos Santa Cruz
                </h1>
                <IconImage
                  src="/assets/icons/puntos-bsc.svg"
                  alt="Icono Puntos BSC"
                  :width="36"
                  :height="36"
                  container-class="ml-4"
                />
              </div>
              <p class="text-primary text-body-2 font-weight-regular mb-6">
                Tu satisfacción es lo más importante para nosotros, por eso hemos creado para ti nuestro programa de recompensa Puntos Santa Cruz, a través del cual acumulas puntos por cada consumo que realices con tus <strong>Tarjetas de Crédito VISA.</strong>
              </p>
              <div class="d-flex justify-start">
                <v-btn
                  width="200"
                  height="45"
                  to="/productos/puntos"
                  class="text-body-2"
                  variant="elevated"
                  rounded="xl"
                  color="primary"
                >
                  Nuestro Programa
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.card-categories {
  margin-top: -25px;
  position: relative;
  z-index: 10;
}

// Banner de Promociones
.banner-promotion-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;

  .banner-promotion-bg {
    width: 100%;
    height: 100%;
    
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.hero-image),
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.blur-image) {
      filter: blur(2px);
      transform: scale(1.1);
    }
  }

  .banner-decorative-left {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;

    &.promotion-symbol {
      font-size: 300px;
      font-weight: 300;
      color: rgba(255, 255, 255, 0.15);
      line-height: 1;
      transform: translateX(-20%);
    }
  }

  .banner-decorative-right {
    position: absolute;
    top: 0;
    right: 0;
    z-index: 1;
    pointer-events: none;
    opacity: 0.3;

    &.promotion-icon {
      transform: translate(20%, -20%);
    }
  }

  .banner-content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .card-promotions-container {
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
}

// Banner de Puntos
.banner-points-wrapper {
  position: relative;
  width: 100%;
  height: 500px;
  overflow: hidden;

  .banner-points-bg {
    width: 100%;
    height: 100%;
    
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.hero-image),
    /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
    ::v-deep(.blur-image) {
      filter: blur(2px);
      transform: scale(1.1);
    }
  }

  .banner-decorative-left {
    position: absolute;
    top: 0;
    left: 0;
    z-index: 1;
    pointer-events: none;

    &.points-circle {
      width: 300px;
      height: 300px;
      background-color: #4caf50;
      border-radius: 50%;
      transform: translate(-30%, -30%);
    }
  }

  .banner-decorative-bottom-right {
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1;
    pointer-events: none;

    &.accessibility-icon {
      width: 60px;
      height: 60px;
      background-color: rgba(18, 73, 155, 0.9);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .banner-content-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
  }

  .card-points-container {
    position: relative;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  }
}

// Responsive
@media (max-width: 960px) {
  .banner-promotion-wrapper,
  .banner-points-wrapper {
    height: 400px;
  }

  .banner-decorative-left.promotion-symbol {
    font-size: 200px;
  }

  .banner-decorative-left.points-circle {
    width: 200px;
    height: 200px;
  }

  .banner-decorative-right.promotion-icon {
    width: 150px !important;
    height: 150px !important;
  }
}
</style>
