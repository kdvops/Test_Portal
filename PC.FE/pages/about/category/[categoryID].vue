<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/sobre-nosotros/categoria/:categoryID/:itemID?",
  seoManual: true,
});

import { Vue, Watch } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { RegulatoryInterface } from "~/interfaces/regulatory.interface";
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// IMPORT COMPONENTS
import AppMenuComponent from "~/components/menu/index.vue";
import AppSectionsComponent from "~/components/sections/index.vue";
import HeroImage from '~/components/optimized-image/HeroImage.vue';

// IMPORT QUERY
import {
  GET_REGULATORY_POST_BY_CATEGORY,
  GET_REGULATORY_POST_BY_SLUG,
} from "~/graphql/regulatory.query";
import {
  GET_CATEGORY_BY_ID,
  GET_CATEGORY_BY_SLUG,
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
  name: "regulatory-post-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-menu-component": AppMenuComponent,
    "app-sections-component": AppSectionsComponent,
    HeroImage,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as regulatoryPostScreen;
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
      data.findRegulatoryBySlug as RegulatoryInterface;

    const queries = {
      singleQuery: GET_REGULATORY_POST_BY_SLUG,
      varNames: { single: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<RegulatoryInterface>("title");
    const pickDesc = makeStringFieldPicker<RegulatoryInterface>("description");
    const pickId = makeIdFieldPicker<RegulatoryInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.itemSlug === "string"
          ? vm.itemSlug
          : normalizeParam(vm.itemSlug as any);

      await applyEntitySeoForKey<RegulatoryInterface>({
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

      vm.itemSlug = key;
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
export default class regulatoryPostScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM CATEGORY ID
  public pageParam = useRoute().params.categoryID;
  public itemSlug = useRoute().params.itemID;
  public itemID = "";
  public categoryID = "";

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // POST SELECTED
  public regulatorySelectedPost: RegulatoryInterface = {
    _id: "",
    title: "",
    slug: "",
    subtitle: "",
    link: "",
    excerpt: "",
    description: "",
    banner: "",
    category: "",
    disabled: false,
    sections: [],
  };

  // POSTS
  public posts: Array<RegulatoryInterface> = [];

  // MENU OPTIONS
  public menuOptions: any = {
    route: "",
    current: "",
    color: "green",
    default: {
      name: "",
      icon: "",
      to: "",
    },
    items: [],
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public created() {
    this.getCategoryIdBySlug().then((categoryId) => {
      this.categoryID = categoryId;
      // GET POSTS
      this.getRegulatoryPostsByCategory();
    });
  }

  ///////////////
  /// METHODS ///
  ///////////////

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

  // GET POSTS BY CATEGORY
  public async getRegulatoryPostsByCategory() {
    try {
      // ARGS FILTER DTO
      const findRegulatoryByCategoryDto = {
        category: this.categoryID,
      };

      const { data } = await this.$apollo.query({
        query: GET_REGULATORY_POST_BY_CATEGORY,
        variables: findRegulatoryByCategoryDto,
        fetchPolicy: "no-cache",
      });

      // GET POSTS
      const posts = data.findRegulatoryByCategory;

      // DECRYPT BASE64 TEXT TO HTML
      const postsFinal = posts.map((post: RegulatoryInterface) => ({
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
    this.posts.length > 0 && (this.regulatorySelectedPost = this.posts[0]);

    // SET MENU OPTIONS
    if (!this.itemSlug) {
      this.$router.push(
        `/sobre-nosotros/categoria/${this.pageParam}/${this.regulatorySelectedPost.slug}`
      );
    } else {
      // SET POST SELECTED
      this.regulatorySelectedPost =
        this.posts.find((post) => post.slug === this.itemSlug) || this.posts[0];
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
      route: `/sobre-nosotros/categoria/${this.pageParam}/`,
      current: this.itemSlug,
      color: "green",
      default: {
        name: "",
        icon: "mdi-archive",
        to: "",
      },
      items: this.posts.map((post) => ({
        _id: post._id,
        name: post.title,
        slug: post.slug,
      })),
    };
  }

  ///////////////
  /// WATCHER ///
  ///////////////

  // WATCH FILTER SEARCH
  @Watch("postID")
  public watchFilterSearch() {
    this.getRegulatoryPostsByCategory();
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <div>
    <v-row justify="center" align-content="center" no-gutters>
      <!-- BANNER CAROUSEL -->
      <v-col cols="12" style="position: relative; z-index: 0;">
        <HeroImage
          :src="regulatorySelectedPost.banner ?? regulatorySelectedPost.bannerImageDetail?.image"
          :alt="regulatorySelectedPost.bannerImageDetail?.altText ?? ''"
          :width="1920"
          :height="500"
          loading="eager"
        />
      </v-col>

      <!-- MENU COMPONENT -->
      <v-col class="menu-categories py-0" cols="10">
        <app-menu-component :options="menuOptions" @changeRoute="changeRoute" />
      </v-col>

      <v-col cols="10" class="my-10 text-center">
        <p class="title-regulatory-post text- font-weight-bold">
          <span>{{ regulatorySelectedPost.description }}</span>
        </p>
      </v-col>

      <v-col class="regulatory-sections-container" cols="12">
        <!-- SECTION COMPONENT -->
        <app-sections-component :sections="regulatorySelectedPost.sections" />
      </v-col>
    </v-row>
  </div>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.menu-categories {
  margin-top: -25px;
  position: relative;
  z-index: 10;
}

.title-regulatory-post {
  color: #42595f;

  span {
    font-weight: 200;
    font-size: 13px;
  }
}
</style>
