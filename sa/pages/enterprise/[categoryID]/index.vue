<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/empresa/:categoryID/:itemID?",
  seoManual: true,
});

import { Vue, Watch } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { EnterpriseInterface } from "~/interfaces/enterprise.interface";
import type { SectionTypeInterface } from "~/interfaces/sections.interface";
import type { ShortcutInterface } from "~/interfaces/shortcuts.interface";
import { isObjectId } from "~/utils/objectIdUtils";

// IMPORT COMPONENTS
import AppMenuComponent from "~/components/menu/index.vue";
import AppSectionsComponent from "~/components/sections/index.vue";
import AppShortcutsComponent from "~/components/shortcuts/index.vue";
import HeroImage from "~/components/optimized-image/HeroImage.vue";

// IMPORT QUERY
import {
  GET_ENTERPRISE_POST_BY_CATEGORY,
  GET_ENTERPRISE_BY_SLUG,
} from "~/graphql/enterprise.query";
import {
  GET_CATEGORY_BY_SLUG,
  GET_CATEGORY_BY_ID,
} from "~/graphql/categories.query";
import { GET_SHORTCUTS_BY_TARGET } from "~/graphql/shortcuts.query";

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
  name: "enterprise-post-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-menu-component": AppMenuComponent,
    "app-sections-component": AppSectionsComponent,
    "app-shortcuts-component": AppShortcutsComponent,
    HeroImage,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as EnterprisePostScreen;
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
      data.findEnterpriseBySlug as EnterpriseInterface;

    const queries = {
      singleQuery: GET_ENTERPRISE_BY_SLUG,
      varNames: { single: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<EnterpriseInterface>("title");
    const pickDesc = makeStringFieldPicker<EnterpriseInterface>("description");
    const pickId = makeIdFieldPicker<EnterpriseInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.itemPageParam === "string"
          ? vm.itemPageParam
          : normalizeParam(vm.itemPageParam as any);

      await applyEntitySeoForKey<EnterpriseInterface>({
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

      vm.itemPageParam = key;
    };

    await loadForKey(normalizeParam(route.params.itemID as any));
    watch(
      () => route.params.itemID,
      async (next: any) => {
        await loadForKey(normalizeParam(next as any));
      }
    );
  },
})
export default class EnterprisePostScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM CATEGORY ID
  public pageParam = useRoute().params.categoryID;
  public itemPageParam = useRoute().params.itemID;
  public itemID = "";
  public categoryID = "";

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // POST SELECTED
  public enterpriseSelectedPost: EnterpriseInterface = {
    _id: "",
    title: "",
    slug: "",
    subtitle: "",
    link: "",
    excerpt: "",
    description: "",
    banner: "",
    responsive: "",
    thumbnail: "",
    category: "",
    disabled: false,
    sections: [],
  };

  // POSTS
  public posts: Array<EnterpriseInterface> = [];

  // MENU OPTIONS
  public menuOptions: any = {
    route: "",
    current: "",
    color: "#42595f",
    default: {
      name: "Para tu empresa",
      icon: "",
      to: "",
    },
    items: [],
  };

  // SHORTCUTS ARRAY
  public shortcuts: Array<ShortcutInterface> = [];

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public created() {
    // APPLY SEO METADATA
    // this.applySEOMetadata();
    this.getCategoryIdBySlug().then(
      (categoryId) => {
        this.categoryID = categoryId;
        // GET POSTS
        this.getEnterprisePostsByCategory();
      },
      (error) => {
        this.$router.push("/");
      }
    );

    // GET SHORTCUTS
    this.getShortcutsByTarget();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET SHORTCUTS BY TARGET
  public async getShortcutsByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SHORTCUTS_BY_TARGET,
        variables: {
          target: "target::enterprise",
        },
        fetchPolicy: "no-cache",
      });

      // SET SHORTCUTS
      this.shortcuts = data.findShortcutsByTarget;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  private async getCategoryIdBySlug(): Promise<string> {
    const param =
      typeof this.pageParam == "string"
        ? this.pageParam
        : this.pageParam.join("");
    const isAnObjectId = isObjectId(param);

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

  // GET POSTS BY CATEGORY
  public async getEnterprisePostsByCategory() {
    try {
      // ARGS FILTER DTO
      const findEnterpriseByCategoryDto = {
        category: this.categoryID,
      };

      const { data } = await this.$apollo.query({
        query: GET_ENTERPRISE_POST_BY_CATEGORY,
        variables: findEnterpriseByCategoryDto,
        fetchPolicy: "no-cache",
      });

      // GET POSTS
      const posts = data.findEnterpriseByCategory;

      // DECRYPT BASE64 TEXT TO HTML
      const postsFinal = posts.map((post: EnterpriseInterface) => ({
        ...post,
        sections: this.decryptBaseToHtml(post.sections),
      }));

      // SET POSTS
      this.posts = postsFinal;

      // SET POST SELECTED
      this.selectedFirstPost();

      // SET MENU OPTIONS
      this.setMenuOptions();
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SELECTED FIRST POST
  public selectedFirstPost() {
    // SET POST SELECTED
    this.posts.length > 0 && (this.enterpriseSelectedPost = this.posts[0]);

    // SET MENU OPTIONS
    if (!this.itemPageParam) {
      this.$router.push(
        `/empresa/${this.pageParam}/${this.enterpriseSelectedPost.slug}`
      );
    } else {
      // SET POST SELECTED
      this.enterpriseSelectedPost =
        this.posts.find((post) => post.slug === this.itemPageParam) ||
        this.posts[0];
    }
  }

  // CHANGE ROUTE
  public changeRoute(url: string) {
    // SET MENU OPTIONS
    this.setMenuOptions();
  }

  // DECRYPT BASE64 TEXT TO HTML
  public decryptBaseToHtml(sections: Array<SectionTypeInterface>) {
    return sections.map((section: any) => {
      return {
        ...section,
        text: section.text ? decrypt(section.text) : "",
      };
    });
  }

  // SET MENU OPTIONS
  public setMenuOptions() {
    this.menuOptions = {
      route: `/empresa/${this.pageParam}/`,
      current: this.itemPageParam,
      color: "#42595f",
      default: {
        name: "Para tu empresa",
        icon: "mdi-handshake",
        to: "/empresa",
      },
      items: this.posts.map((post) => ({
        _id: post._id,
        name: post.title,
        slug: post.slug,
      })),
    };
  }

  public redirectTab(shortcut: { _id: string; name: string }) {
    this.$router.push({
      path: "/empresa",
      query: {
        item: shortcut._id,
        name: shortcut.name,
      },
    });
  }

  ///////////////
  /// WATCHER ///
  ///////////////

  // WATCH FILTER SEARCH
  @Watch("postID")
  public watchFilterSearch() {
    this.getEnterprisePostsByCategory();
  }

  // APPLY SEO METADATA
  // public applySEOMetadata() {
  //   const seoData = this.robustSEO.applyRobustSEO();
  //   this.pageSEO.applySEO();
  // }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12" style="position: relative; z-index: 0">
      <HeroImage
        :src="
          $vuetify.display.mdAndDown
            ? enterpriseSelectedPost.responsive ??
              enterpriseSelectedPost.responsiveImageDetail?.image
            : enterpriseSelectedPost.banner ??
              enterpriseSelectedPost.bannerImageDetail?.image
        "
        :alt="
          $vuetify.display.mdAndDown
            ? enterpriseSelectedPost.responsiveImageDetail?.altText ??
              enterpriseSelectedPost.title
            : enterpriseSelectedPost.bannerImageDetail?.altText ??
              enterpriseSelectedPost.title
        "
        :width="1920"
        :height="500"
        loading="eager"
      />
    </v-col>

    <!-- MENU SHORTCUTS -->
    <v-col class="menu-categories py-0" cols="12" md="10" lg="10">
      <app-menu-component :options="menuOptions" @changeRoute="changeRoute" />
    </v-col>
    <v-row justify="center">
      <v-col cols="12" md="7" lg="6">
        <v-row justify="center">
          <v-col
            cols="10"
            :md="enterpriseSelectedPost.link ? '5' : '8'"
            :lg="enterpriseSelectedPost.link ? '5' : '8'"
            class="my-10 text-center text-md-left"
          >
            <p
              class="title-enterprise-post text-center text-md-left font-weight-bold"
            >
              <span>{{ enterpriseSelectedPost.excerpt }}</span>
            </p>
          </v-col>

          <template v-if="enterpriseSelectedPost.link">
            <v-col class="text-center" cols="10">
              <v-btn
                width="200"
                height="45"
                :to="enterpriseSelectedPost.link"
                class="mt-0 mt-md-10 mb-10"
                rounded="xl"
                color="#42595f"
              >
                Aplica Ahora
              </v-btn>
            </v-col>
          </template>
        </v-row>
      </v-col>
    </v-row>

    <v-col class="enterprise-sections-container" cols="12">
      <!-- SECTION COMPONENT -->
      <app-sections-component :sections="enterpriseSelectedPost.sections" />
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.menu-categories {
  margin-top: -25px;
}

.title-enterprise-post {
  color: #42595f;

  span {
    font-weight: 200;
    font-size: 13px;
  }
}
</style>
