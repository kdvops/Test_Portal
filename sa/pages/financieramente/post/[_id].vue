<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/financieramente/post/:_id",
  seoManual: true,
});
import { Vue } from "vue-facing-decorator";
// IMPORT INTERFACES
import type {
  FinanciallyInterface,
  TypePostFinancially,
} from "~/interfaces/financially.interface";


// IMPORT COMPONENTS
import AppSectionsComponent from "~/components/sections/index.vue";

// IMPORT GRAPHQL QUERY
import {
  GET_FINANCIALLY_BY_SLUG,
  GET_FINANCIALLY_BY_ID,
  GET_FINANCIALLY_RELATED,
  GET_FINANCIALLY_RECENT,
} from "~/graphql/financially.query";
import { isObjectId } from "~/utils/objectIdUtils";

import type { ApolloClient } from "@apollo/client/core";
import {
  normalizeParam,
  registerSeoRefs,
  applyEntitySeoForKey,
  makeStringFieldPicker,
  makeIdFieldPicker,
} from "~/utils/seoUtil";
import GoToTopComponent from "~/components/go-to-top/index.vue";
import type { AuthorInterface } from "~/interfaces/author.interface";
import OptimizedImageComponent from "~/components/optimized-image/OptimizedImage.vue";
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "financially-post-details-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-sections-component": AppSectionsComponent,
    "go-to-top-component": GoToTopComponent,
    "optimized-image-component": OptimizedImageComponent,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as FinanciallyPostDetailsScreen;
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
        ? data.findFinanciallyById
        : data.findFinanciallyBySlug) as FinanciallyInterface;

    const queries = {
      byIdQuery: GET_FINANCIALLY_BY_ID,
      bySlugQuery: GET_FINANCIALLY_BY_SLUG,
      varNames: { id: "categoryId", slug: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<FinanciallyInterface>("title");
    const pickDesc = makeStringFieldPicker<FinanciallyInterface>("description");
    const pickId = makeIdFieldPicker<FinanciallyInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.pageParam === "string"
          ? vm.pageParam
          : normalizeParam(vm.pageParam as any);

      await applyEntitySeoForKey<FinanciallyInterface>({
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
class FinanciallyPostDetailsScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  public xicon = '/assets/icons/icons8-x.svg';

  // BUS INSTANCE APP
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET PARAM POST ID
  public pageParam = useRoute().params._id;
  public postID = "";

  // FILTER POSTS
  public filter: { search: string; type: TypePostFinancially } = {
    search: "",
    type: "all",
  };

  // POSTS
  public financially: FinanciallyInterface = {
    _id: "",
    title: "",
    slug: "",
    excerpt: "",
    subtitle: "",
    description: "",
    file: "",
    type: "post::article",
    sections: [],
    banner: "",
    responsive: "",
    thumbnail: "",
    disabled: false,
    createdAt: "",
  };

  public financiallyRelated: Ref<FinanciallyInterface[]> = ref([]);
  public financiallyRecent: Ref<FinanciallyInterface[]> = ref([]);
  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    this.getFinanciallyIdBySlug().then(
      (financiallyId) => {
        this.postID = financiallyId;
        // GET POSTS
        this.getFinanciallyById();
        this.getFinanciallyRelated();
      },
      (error) => {
        this.$router.push("/");
      }
    );
  }

  ///////////////
  /// METHODS ///
  ///////////////
  private async getFinanciallyIdBySlug(): Promise<string> {
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
        query: isAnObjectId ? GET_FINANCIALLY_BY_ID : GET_FINANCIALLY_BY_SLUG,
        variables: isAnObjectId
          ? { categoryId: this.pageParam }
          : { slug: this.pageParam },
        fetchPolicy: "no-cache",
      });

      const dta = data.findFinanciallyBySlug;
      return Promise.resolve(dta._id);
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError freom cid", err);
      return Promise.reject(err);
    }
  }

  // GET FINANCIALLY BY ID
  public async getFinanciallyById() {
    try {
      // GET POST ID
      const financiallyId = {
        financiallyId: this.postID,
      };

      const { data } = await this.$apollo.query({
        query: GET_FINANCIALLY_BY_ID,
        variables: financiallyId,
        fetchPolicy: "no-cache",
      });

      // SET FINANCIALLY
      const financially = data.findFinanciallyById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = financially.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : "",
        };
      });

      // SET FINANCIALLY TO VARIABLE
      this.financially = { ...financially, sections };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public async getFinanciallyRelatedType(query: any, method: string) {
    try {
      // GET POST ID
      const financiallyId = {
        financiallyId: this.postID,
      };

      const { data } = await this.$apollo.query({
        query,
        variables: financiallyId,
        fetchPolicy: "no-cache",
      });

      // SET FINANCIALLY
      return data[method];
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
    return [];
  }

  public async getFinanciallyRelated() {
    this.financiallyRecent.value =
      (await this.getFinanciallyRelatedType(
        GET_FINANCIALLY_RECENT,
        "getFinanciallyRecent"
      )) ?? [];
    this.financiallyRelated.value =
      (await this.getFinanciallyRelatedType(
        GET_FINANCIALLY_RELATED,
        "getFinanciallyRelated"
      )) ?? [];
  }

  // GET FORMAT DATE RANGE
  public getFormatDateRange(date: string|undefined): string {
    if (!date) return "";
    let dateFinal = "";
    dateFinal = `${this.$app.$moment(date).format("D")} ${this.$app
      .$moment(date)
      .format("MMMM")} ${this.$app.$moment(date).format("YYYY")}`;
    return dateFinal;
  }

  get hasAuthors() {
    return (this.financially?.authors?.length ?? 0) > 0;
  }

  get heroOverlayPadding(): string {
    return this.$vuetify.display.mdAndDown ? "16px" : "40px";
  }

  get combinedNames(): string {
    const names = (this.financially.authors ?? [])
      .map((a) => a.name?.trim())
      .filter(Boolean) as string[];
    if (!names.length) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  }

  get combinedPositions(): string {
    const uniq = Array.from(
      new Set(
        (this.financially.authors ?? [])
          .map((a) => a.position?.trim())
          .filter(Boolean)
      )
    ) as string[];
    if (!uniq.length) return "";
    if (uniq.length === 1) return uniq[0];
    return uniq.join(" • ");
  }

  get financiallyRecentList(): FinanciallyInterface[] {
    return this.financiallyRecent?.value ?? [];
  }

  get financiallyRelatedList(): FinanciallyInterface[] {
    return this.financiallyRelated?.value ?? [];
  }

  public hrefWithPageType(type: string): string {
    return `/financieramente/${type}`;
  }

  public hasAnySocial(row: AuthorInterface): boolean {
    const s = row.socials ?? {};
    return !!(s.x || s.facebook || s.linkedin);
  }
}

export default FinanciallyPostDetailsScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="hero-banners-container" justify="space-between" no-gutters>
    <!-- BANNER -->
    <v-col cols="12">
      <optimized-image-component
        width="100%"
        height="500"
        :src="
          $vuetify.display.mdAndDown &&
          (financially.responsive || financially.responsiveImageDetail)
            ? financially.responsive ?? financially.responsiveImageDetail?.image
            : financially.banner ?? financially.bannerImageDetail?.image
        "
        :alt="
          $vuetify.display.mdAndDown && financially.responsiveImageDetail
            ? financially.responsiveImageDetail?.altText ?? ''
            : financially.bannerImageDetail?.altText ?? ''
        "
        cover
        loading="lazy"
        :overlay-padding="heroOverlayPadding"
      >
        <div class="hero-image-container" style="position: relative; z-index: 0;">
          <div
            class="position-absolute top-0 left-0 right-0 bottom-0 d-flex justify-start align-end"
            style="
              background: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0.15) 0%,
                rgba(0, 0, 0, 0.75) 100%
              );
            "
          >
            <div
              class="d-flex flex-column text-left"
              :class="$vuetify.display.mdAndDown ? 'w-100 px-4 pb-4' : 'px-10 pb-10'"
              style="max-width: 520px"
            >
              <p class="text-caption text-white mb-2">
                {{ combinedNames ? "Por " + combinedNames : "" }}
              </p>

              <p class="text-h4 text-white font-weight-bold mb-2">
                {{ financially.title }}
              </p>

              <p class="text-body-2 text-white">
                {{ financially.excerpt ?? "" }}
              </p>
            </div>
          </div>
        </div>
      </optimized-image-component>
    </v-col>

    <v-row justify="center" class="mt-2 mt-md-10 mt-lg-10">
      <v-col cols="12">
        <v-row align="start" justify="space-between">
          <v-col
            cols="12"
            md="2"
            lg="2"
            class="d-none d-md-flex flex-column align-center"
          >
            <div class="d-flex flex-column align-center w-100 ms-7">
              <!-- Avatars (centered) -->
              <div class="d-flex align-center justify-center mb-2">
                <div
                  v-for="(a, i) in financially.authors || []"
                  :key="i"
                  class="position-relative"
                  :class="i > 0 ? 'ms-0' : ''"
                  :style="{ zIndex: (financially.authors?.length || 1) - i }"
                >
                  <v-avatar :size="56" class="elevation-2 rounded-circle">
                    <optimized-image-component
                      :src="a?.image?.image ?? ''"
                      :alt="a?.name || `Autor ${i + 1}`"
                      loading="eager"
                    />
                  </v-avatar>
                </div>
              </div>

              <!-- Names / Positions -->
              <div class="text-center">
                <div class="text-subtitle-2 text-primary font-weight-bold">
                  {{ combinedNames || "" }}
                </div>
                <div
                  class="text-body-2 text-green-darken-2 font-weight-semibold"
                >
                  {{ combinedPositions }}
                </div>
              </div>

              <v-divider class="mt-8 mb-4" length="56" />

              <v-col
                v-for="(author, i) in financially.authors || []"
                :key="i"
                cols="12"
                class="d-flex flex-column align-center"
              >
                <div class="d-flex flex-column align-center ga-2 mt-4">
                  <a
                    v-if="author?.socials?.x"
                    :href="author?.socials?.x"
                    target="_blank"
                    rel="noopener"
                    class="text-decoration-none"
                  >
                    <v-sheet
                      width="42"
                      height="42"
                      class="d-flex align-center justify-center elevation-2"
                    >
                      <v-icon size="32">
                        <img :src="xicon" alt="X icon" class="v-icon__img" />
                      </v-icon>
                    </v-sheet>
                  </a>

                  <a
                    v-if="author?.socials?.facebook"
                    :href="author?.socials?.facebook"
                    target="_blank"
                    rel="noopener"
                    class="text-decoration-none"
                  >
                    <v-sheet
                      width="42"
                      height="42"
                      class="d-flex align-center justify-center elevation-2"
                      color="white"
                    >
                      <v-icon>mdi-facebook</v-icon>
                    </v-sheet>
                  </a>

                  <a
                    v-if="author?.socials?.linkedin"
                    :href="author?.socials?.linkedin"
                    target="_blank"
                    rel="noopener"
                    class="text-decoration-none"
                  >
                    <v-sheet
                      width="42"
                      height="42"
                      class="d-flex align-center justify-center elevation-2"
                      color="white"
                    >
                      <v-icon>mdi-linkedin</v-icon>
                    </v-sheet>
                  </a>
                  <a
                    v-if="author?.socials?.instagram"
                    :href="author?.socials?.instagram"
                    target="_blank"
                    rel="noopener"
                    class="text-decoration-none"
                  >
                    <v-sheet
                      width="42"
                      height="42"
                      class="d-flex align-center justify-center elevation-2"
                      color="white"
                    >
                      <v-icon>mdi-instagram</v-icon>
                    </v-sheet>
                  </a>
                  <v-divider
                    v-if="i < (financially?.authors?.length ?? 0) - 1"
                    class="mt-6"
                    length="56"
                  />
                </div>
              </v-col>
            </div>
          </v-col>

          <v-col cols="12" md="7" lg="7">
            <v-row align="start" class="ga-4 ma-5">
              <v-col cols="12" md="true">
                <h1 class="text-h5 text-md-h3 text-primary font-weight-bold">
                  {{ financially.subtitle }}
                </h1>

                <p
                  class="text-caption text-md-h5 text-green font-weight-regular mt-5 pr-0 pr-md-15"
                >
                  {{ financially.description }}
                </p>

                <div class="d-flex align-center mt-8">
                  <p class="text-caption text-grey mr-4">
                    {{ getFormatDateRange(financially.createdAt) }}
                  </p>
                  <v-divider class="flex-grow-1" thickness="2" />
                </div>

                <div class="mt-8">
                  <app-sections-component :sections="financially.sections" />
                </div>
              </v-col>
              <v-col
                cols="12"
                v-if="financially.authors"
                class="d-flex align-start ga-4 w-100"
              >
                <!-- Avatars -->
                <div class="d-flex align-center mx-5">
                  <div
                    v-for="(a, i) in financially.authors || []"
                    :key="i"
                    class="position-relative"
                    :class="i > 0 ? 'ms-0' : ''"
                    :style="{ zIndex: (financially.authors?.length || 1) - i }"
                  >
                    <v-avatar :size="56" class="elevation-2 rounded-circle">
                      <optimized-image-component
                        :src="a?.image?.image ?? ''"
                        :alt="a?.name || `Autor ${i + 1}`"
                        loading="eager"
                      />
                    </v-avatar>
                  </div>
                </div>

                <!-- Text + socials -->
                <div class="d-flex flex-column">
                  <div class="d-flex flex-column">
                    <div class="d-flex align-center">
                      <span
                        class="me-2 text-blue-darken-3 font-weight-bold"
                        v-if="combinedNames"
                      >
                        Por:
                      </span>
                      <span class="text-blue-darken-3 font-weight-bold">
                        {{ combinedNames || "" }}
                      </span>
                    </div>
                    <div
                      v-for="(author, idx) in financially?.authors || []"
                      class="text-green-darken-2 text-subtitle-1 text-grey-darken-1"
                      v-bind:key="idx"
                    >
                      {{ author.biography }}
                    </div>
                  </div>
                  <div
                    class="d-flex align-center ga-2 mt-2"
                    v-if="(financially?.authors?.length ?? 0) > 0"
                  >
                    <template
                      v-for="(author, aIndex) in financially?.authors || []"
                      :key="aIndex"
                    >
                      <!-- SOCIALS OF THIS AUTHOR -->
                      <div class="d-flex align-center">
                        <!-- X -->
                        <a
                          v-if="author?.socials?.x"
                          :href="author.socials.x"
                          target="_blank"
                          rel="noopener"
                          class="text-decoration-none"
                        >
                          <v-icon size="18">
                            <img
                              :src="xicon"
                              alt="X icon"
                              style="
                                width: 19px;
                                height: 19px;
                                display: block;
                                object-fit: contain;
                              "
                            />
                          </v-icon>
                        </a>

                        <!-- Facebook -->
                        <a
                          v-if="author?.socials?.facebook"
                          :href="author.socials.facebook"
                          target="_blank"
                          rel="noopener"
                          class="text-decoration-none ms-2"
                        >
                          <v-icon size="18" color="indigo-darken-3"
                            >mdi-facebook</v-icon
                          >
                        </a>

                        <!-- LinkedIn -->
                        <a
                          v-if="author?.socials?.linkedin"
                          :href="author.socials.linkedin"
                          target="_blank"
                          rel="noopener"
                          class="text-decoration-none ms-2"
                        >
                          <v-icon size="18" color="blue-darken-1"
                            >mdi-linkedin</v-icon
                          >
                        </a>

                        <!-- Instagram -->
                        <a
                          v-if="author?.socials?.instagram"
                          :href="author.socials.instagram"
                          target="_blank"
                          rel="noopener"
                          class="text-decoration-none ms-2"
                        >
                          <v-icon size="18" color="red-darken-2"
                            >mdi-instagram</v-icon
                          >
                        </a>
                      </div>

                      <!-- SEPARATOR BETWEEN AUTHORS -->
                      <div
                        v-if="aIndex < (financially?.authors?.length ?? 0) - 1"
                        class="mx-3"
                        style="width: 1px; height: 24px; background-color: #ddd"
                      ></div>
                    </template>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-col>

          <v-col
            cols="10"
            offset="0"
            md="3"
            lg="3"
            xl="3"
            xxl="3"
            :offset-sm="1"
            offset-md="0"
            offset-lg="0"
            offset-xl="0"
            offset-xxl="0"
            class="mt-8 mt-md-0"
          >
            <v-card elevation="0" class="mb-8">
              <v-card-title
                class="text-subtitle-1 text-green-darken-2 font-weight-bold pb-2"
              >
                Más recientes
              </v-card-title>
              <v-card-text>
                <v-list density="comfortable" class="py-0">
                  <v-list-item
                    v-for="post in financiallyRecentList"
                    :key="post._id"
                    :to="`/financieramente/post/${post.slug}`"
                    class="px-0 text-decoration-none"
                  >
                    <template #prepend>
                      <v-avatar size="56" class="mr-3 rounded-lg">
                        <optimized-image-component
                          :src="
                            post.banner ??
                            post.bannerImageDetail?.image ??
                            post.responsive ??
                            post.responsiveImageDetail?.image
                          "
                          :alt="post.bannerImageDetail?.altText ?? post.title"
                        />
                      </v-avatar>
                    </template>

                    <v-list-item-title class="text-body-2 text-primary">
                      {{ post.title }}
                    </v-list-item-title>

                    <v-list-item-subtitle
                      class="text-caption text-grey-darken-1"
                    >
                      {{ getFormatDateRange(post.createdAt) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-divider />
            </v-card>
            <v-card elevation="0" class="mb-8">
              <v-card-title
                class="text-subtitle-1 text-green-darken-2 font-weight-bold pb-2"
              >
                Relacionados
              </v-card-title>
              <v-card-text>
                <v-list density="comfortable" class="py-0">
                  <v-list-item
                    v-for="post in financiallyRelatedList"
                    :key="post._id"
                    :to="`/financieramente/post/${post.slug}`"
                    class="px-0 text-decoration-none"
                  >
                    <template #prepend>
                      <v-avatar size="56" class="mr-3 rounded-lg">
                        <optimized-image-component
                          :src="
                            post.banner ??
                            post.bannerImageDetail?.image ??
                            post.responsive ??
                            post.responsiveImageDetail?.image
                          "
                          :alt="post.bannerImageDetail?.altText ?? post.title"
                        />
                      </v-avatar>
                    </template>

                    <v-list-item-title class="text-body-2 text-primary">
                      {{ post.title }}
                    </v-list-item-title>

                    <v-list-item-subtitle
                      class="text-caption text-grey-darken-1"
                    >
                      {{ getFormatDateRange(post.createdAt) }}
                    </v-list-item-subtitle>
                  </v-list-item>
                </v-list>
              </v-card-text>
              <v-divider />
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <go-to-top-component
      :threshold="300"
      anchor="fixed"
      horizontal="end"
      cornerSpacingClasses="w-100 pe-6 pb-6"
    />
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>
