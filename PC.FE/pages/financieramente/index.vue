<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  path: "/financieramente/:type?/:page?",
});

import { Vue, Watch } from "vue-facing-decorator";
// IMPORT INTERFACES
import type {
  SliderInterface,
  SliderOptions,
} from "~/interfaces/slider.interface";
import type {
  FinanciallyInterface,
  TypePostFinancially,
} from "~/interfaces/financially.interface";

// IMPORT COMPONENTS
import AppCarouselComponent from "~/components/carousel/index.vue";
import AppFinanciallyCardComponent from "~/components/financially/index.vue";
import CarouselCard from "~/components/carousel-card/index.vue";

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from "~/graphql/slider.query";
import {
  GET_FINANCIALLY,
  GET_FINANCIALLY_PAGINATED,
} from "~/graphql/financially.query";
import type { PaginationInterface } from "~/interfaces/pagination.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "financially-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-carousel-component": AppCarouselComponent,
    "app-financially-card-component": AppFinanciallyCardComponent,
    "carousel-card": CarouselCard,
  },
})
export default class FinanciallyScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////
  public isSearching: boolean = false;
  public showSearchField: boolean = false;
  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;
  public override $route: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SLIDERS
  public sliders: Array<SliderInterface> = [];

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: true,
    position: 0,
    sliders: [],
  };

  // FILTER POSTS
  public filter: { search: string; type: TypePostFinancially } = {
    search: "",
    type: "all",
  };

  // POSTS

  public get typeParam(): string | undefined {
    return this.$route?.params?.type as string | undefined;
  }

  public get pageParam(): string | undefined {
    return this.$route?.params?.page as string | undefined;
  }

  //public posts: Array<FinanciallyInterface> = [];
  public paginatedPosts: PaginationInterface<FinanciallyInterface> = ref({
    currentPage: 1,
    items: [],
    totalItems: 0,
    itemsPerPage: 12,
  });

  get totalPages(): number {
    const total = Math.ceil(
      this.paginatedPosts.totalItems / this.paginatedPosts.itemsPerPage
    );

    if (this.paginatedPosts.totalItems === 0) return 1;
    return total;
  }

  public getCombinedNames(financially: FinanciallyInterface) {
    const names = (financially.authors ?? [])
      .map((a) => a.name?.trim())
      .filter(Boolean) as string[];
    if (!names.length) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  }

  get getPinnedByType() {
    const filtered = this.paginatedPosts.items.filter((post) => {
      const filterByType = this.getFilterTypeByPageType()
        ? post.type === this.getFilterTypeByPageType()
        : true;
      return filterByType && post.pinnedAt;
    });

    const paginatedPosts = filtered.map((post) => {
      const authors = this.getCombinedNames(post);
      return {
        image:
          post.bannerImageDetail?.image ??
          post.responsiveImageDetail?.image ??
          post.thumbnailImageDetail?.image,
        author: authors ? `Por: ${authors}` : "",
        title: post.title,
        description: post.description,
        url:
          post.type !== "post::release"
            ? `/financieramente/post/${post.slug}`
            : post.file,
        ctaText: post.type !== "post::release" ? "Ver más" : "Descargar",
        type: post.type !== "post::release" ? "link" : "file",
      };
    });

    return paginatedPosts;
  }

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // GET POSTS
    this.getFinanciallyPosts({
      page: this.pageParam ? parseInt(this.pageParam as string, 10) : 1,
      pageSize: this.paginatedPosts.itemsPerPage,
    });

    // GET SLIDERS
    this.getSliders();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET SLIDERS
  public async getSliders() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SLIDERS_BY_TARGET,
        variables: {
          target: "banner::financially",
        },
        fetchPolicy: "no-cache",
      });

      // FILTER SLIDERS FOR HOME
      this.optionSliders = {
        show: true,
        sliders: data.findSliderByTarget,
        position: 0,
      };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public getFilterTypeByPageType() {
    switch (this.typeParam) {
      case "eventos":
        return "post::events";
      case "notas-de-prensa":
        return "post::release";
      case "articulos":
        return "post::article";
    }
    return "";
  }

  // GET FINANCIALLY POSTS
  public async getFinanciallyPosts(payload?: {
    page: number;
    pageSize?: number;
  }) {
    try {
      // ARGS FILTER DTO
      const argsFinancially = {
        argsFinancially: {
          search: this.filter.search,
          type: this.getFilterTypeByPageType(),
          ...(payload && { page: payload.page }),
        },
      };

      const { data } = await this.$apollo.query({
        query: GET_FINANCIALLY_PAGINATED,
        variables: argsFinancially,
        fetchPolicy: "no-cache",
      });

      // GET POSTS
      const financiallyPosts = data.getFinanciallyPaginated;

      // SET POSTS
      this.paginatedPosts = financiallyPosts;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public onPaginate(page: number) {
    const typePage = this.typeParam || "pagina";
    this.$router.push({ path: `/financieramente/${typePage}/${page}` });
  }

  public hrefWithPageType(type: string): string {
    return `/financieramente/${type}`;
  }

  public toggleSearch() {
    this.isSearching = true;
    this.showSearchField = true;
  }

  public clearSearch() {
    this.filter.search = "";
    this.showSearchField = false;
  }

  public onSearchFieldLeave() {
    this.isSearching = false;
    this.getFinanciallyPosts();
  }
  ///////////////
  /// WATCHER ///
  ///////////////

  // WATCH FILTER SEARCH
  @Watch("filter.type")
  public watchFilterSearch() {
    this.getFinanciallyPosts();
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="hero-banners-container" justify="space-between" no-gutters>
    <v-col cols="12">
      <!-- BANNER CAROUSEL -->
      <app-carousel-component :options="optionSliders" />
    </v-col>
    <v-row justify="center" class="mt-4 mb-8">
      <v-col cols="auto">
        <v-card
          color="grey-lighten-4"
          elevation="3"
          height="52"
          class="mx-auto d-flex align-stretch overflow-hidden px-0"
          :rounded="$vuetify.display.mdAndDown ? 'pill' : 'pill'"
          min-width="300"
        >
          <div
            :class="[
              'mx-auto overflow-hidden px-0',
              isSearching
                ? 'd-none d-sm-flex flex-shrink-0 align-stretch'
                : 'd-flex align-stretch flex-grow-1',
            ]"
          >
            <!-- Artículos -->
            <NuxtLink
              :to="hrefWithPageType('articulos')"
              class="d-flex align-center justify-center rounded-0 rounded-s-pill text-decoration-none"
              :class="[
                $vuetify.display.smAndDown
                  ? 'text-body-2 px-4'
                  : 'text-subtitle-1 px-6',
                typeParam === 'articulos'
                  ? 'bg-primary text-white'
                  : 'text-grey-darken-1',
              ]"
            >
              Artículos
            </NuxtLink>

            <div class="d-flex align-center">
              <div
                class="border-e border-grey-lighten-3"
                style="height: 60%"
              ></div>
            </div>

            <!-- Eventos -->
            <NuxtLink
              :to="hrefWithPageType('eventos')"
              class="d-flex align-center justify-center rounded-0 text-decoration-none"
              :class="[
                $vuetify.display.smAndDown
                  ? 'text-body-2 px-4'
                  : 'text-subtitle-1 px-6',
                typeParam === 'eventos'
                  ? 'bg-primary text-white'
                  : 'text-grey-darken-1',
              ]"
            >
              Eventos
            </NuxtLink>

            <div class="d-flex align-center">
              <div
                class="border-e border-grey-lighten-3"
                style="height: 60%"
              ></div>
            </div>

            <!-- Notas De Prensa -->
            <NuxtLink
              :to="hrefWithPageType('notas-de-prensa')"
              class="d-flex align-center justify-center rounded-0 text-decoration-none"
              :class="[
                $vuetify.display.smAndDown
                  ? 'text-body-2 px-4'
                  : 'text-subtitle-1 px-6',
                typeParam === 'notas-de-prensa'
                  ? 'bg-primary text-white'
                  : 'text-grey-darken-1',
              ]"
            >
              Notas De Prensa
            </NuxtLink>

            <div v-if="!isSearching" class="d-flex align-center">
              <div
                class="border-e border-grey-lighten-3"
                style="height: 60%"
              ></div>
            </div>

            <NuxtLink
              v-if="!isSearching"
              @click.prevent="toggleSearch()"
              class="d-flex align-center justify-center rounded-0 rounded-e-pill text-decoration-none mr-2"
              :class="[
                $vuetify.display.smAndDown
                  ? 'text-body-2 px-4'
                  : 'text-subtitle-1 px-6',
                'text-grey-darken-1',
              ]"
            >
              Buscar
            </NuxtLink>
          </div>

          <Transition name="search-expand" @after-leave="onSearchFieldLeave">
            <div
              v-if="showSearchField"
              class="d-flex align-center justify-center rounded-0 rounded-e-pill w-100"
            >
              <v-text-field
                v-model="filter.search"
                placeholder="Buscar..."
                variant="solo"
                density="comfortable"
                hide-details
                clearable
                class="w-100 text-grey-darken-1 text-body-2"
                min-width="150"
                @keyup.enter="getFinanciallyPosts({ page: 1 })"
                @click:clear="clearSearch()"
              />
            </div>
          </Transition>
        </v-card>
      </v-col>
    </v-row>

    <v-col
      cols="12"
      offset="0"
      sm="12"
      md="12"
      lg="10"
      offset-lg="1"
      xl="10"
      offset-xl="1"
      xxl="10"
      offset-xxl="1"
      class="pa-15"
    >
      <v-row align="stretch" class="ma-n6 justify-center">
        <template v-for="(post, index) in paginatedPosts.items" :key="post._id">
          <v-col
            v-if="
              index === 0 &&
              (pageParam == 1 || !pageParam) &&
              getPinnedByType.length > 0
            "
            cols="12"
            sm="12"
            md="8"
            lg="8"
            xl="4"
            class="pa-6 d-flex"
          >
            <carousel-card
              :slides="getPinnedByType"
              :interval="7000"
              :height="380"
            ></carousel-card>
          </v-col>
          <v-col
            v-if="!post.pinnedAt"
            cols="12"
            sm="6"
            md="4"
            lg="4"
            xl="4"
            class="pa-6 d-flex"
          >
            <app-financially-card-component :financially="post" class="w-100" />
          </v-col>
        </template>
        <v-col cols="12">
          <v-pagination
            :model-value="paginatedPosts.currentPage"
            :length="totalPages"
            @update:model-value="onPaginate"
            color="primary"
            show-first-last-page
          ></v-pagination>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>
