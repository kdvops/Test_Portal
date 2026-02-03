<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/seguros/:categoryID/:itemID?",
  seoManual: true,
});

import { Vue, Watch } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { InsuranceInterface } from "~/interfaces/insurance.interface";
import type { SectionTypeInterface } from "~/interfaces/sections.interface";
import type { ShortcutInterface } from "~/interfaces/shortcuts.interface";
import { isObjectId } from "~/utils/objectIdUtils";

// IMPORT COMPONENTS
import AppMenuComponent from "~/components/menu/index.vue";
import AppSectionsComponent from "~/components/sections/index.vue";
import AppShortcutsComponent from "~/components/shortcuts/index.vue";
import HeroImage from '~/components/optimized-image/HeroImage.vue';

// IMPORT QUERY
import {
  GET_INSURANCE_POST_BY_CATEGORY,
  GET_INSURANCE_BY_SLUG,
} from "~/graphql/insurance.query";
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
  name: "insurance-post-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-menu-component": AppMenuComponent,
    "app-sections-component": AppSectionsComponent,
    "app-shortcuts-component": AppShortcutsComponent,
    HeroImage,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as InsurancePostScreen;
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
      data.findInsuranceBySlug as InsuranceInterface;

    const queries = {
      singleQuery: GET_INSURANCE_BY_SLUG,
      varNames: { single: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<InsuranceInterface>("title");
    const pickDesc = makeStringFieldPicker<InsuranceInterface>("description");
    const pickId = makeIdFieldPicker<InsuranceInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.itemSlug === "string"
          ? vm.itemSlug
          : normalizeParam(vm.itemSlug as any);

      await applyEntitySeoForKey<InsuranceInterface>({
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
export default class InsurancePostScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM CATEGORY ID
  public pageParam = useRoute().params.categoryID;
  public itemSlug = useRoute().params.itemID;
  public itemID = '';
  public categoryID = '';

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // POST SELECTED
  public insuranceSelectedPost: InsuranceInterface = {
    _id: '',
    title: '',
    slug: '',
    subtitle: '',
    link: '',
    excerpt: '',
    description: '',
    banner: '',
    responsive: '',
    thumbnail: '',
    category: '',
    disabled: false,
    sections: [],
  };

  // POSTS
  public posts: Array<InsuranceInterface> = [];

  // MENU OPTIONS
  public menuOptions: any = {
    route: '',
    current: '',
    color: 'green',
    default: {
      name: 'Seguros',
      icon: 'mdi-shield',
      to: '',
    },
    items: [],
  }

  // SHORTCUTS ARRAY
  public shortcuts: Array<ShortcutInterface> = []

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public created() {
    // APPLY SEO METADATA
    // this.applySEOMetadata();       
    this.getCategoryIdBySlug().then((categoryId) => {
      this.categoryID = categoryId
      // GET POSTS
      this.getInsurancePostsByCategory()
    }, (error) => {
      this.$router.push('/')
    })  
    
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
          target: "target::insurance",
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
  public async getInsurancePostsByCategory() {
    try {
      // ARGS FILTER DTO
      const findInsuranceByCategoryDto = {
        category: this.categoryID,
      };

      const { data } = await this.$apollo.query({
        query: GET_INSURANCE_POST_BY_CATEGORY,
        variables: findInsuranceByCategoryDto,
        fetchPolicy: "no-cache",
      });

      // GET POSTS
      const posts = data.findInsuranceByCategory;

      // DECRYPT BASE64 TEXT TO HTML
      const postsFinal = posts.map((post: InsuranceInterface) => ({
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
    this.posts.length > 0 && (this.insuranceSelectedPost = this.posts[0]);

    // SET MENU OPTIONS
    if (!this.itemSlug) {
      this.$router.push(
        `/seguros/${this.pageParam}/${this.insuranceSelectedPost.slug}`
      );
    } else {
      // SET POST SELECTED
      this.insuranceSelectedPost =
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
      route: `/seguros/${this.pageParam}/`,
      current: this.itemSlug,
      color: "green",
      default: {
        name: "Seguros",
        icon: "mdi-shield",
        to: "/seguros",
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
      path: "/seguros",
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
    this.getInsurancePostsByCategory();
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
          (insuranceSelectedPost.responsive ||
            insuranceSelectedPost.responsiveImageDetail)
            ? insuranceSelectedPost.responsive ??
              insuranceSelectedPost.responsiveImageDetail?.image
            : insuranceSelectedPost.banner ??
              insuranceSelectedPost.bannerImageDetail?.image
        "
        :alt="
          $vuetify.display.mdAndDown &&
          insuranceSelectedPost.responsiveImageDetail
            ? insuranceSelectedPost.responsiveImageDetail?.altText ?? ''
            : insuranceSelectedPost.bannerImageDetail?.altText ?? ''
        "
        :width="1920"
        :height="500"
        loading="eager"
      />
    </v-col>

    <!-- MENU SHORTCUTS -->
    <template v-if="shortcuts.length > 0">
      <v-col cols="12" md="10" lg="9">
        <app-shortcuts-component
          :shortcuts="shortcuts"
          type="tabs-redirect"
          @redirectTab="redirectTab"
        />
      </v-col>
    </template>
    <!-- MENU COMPONENT -->
    <template v-else>
      <v-col class="menu-categories py-0" cols="12" md="10" lg="10">
        <app-menu-component :options="menuOptions" @changeRoute="changeRoute" />
      </v-col>
    </template>

    <v-col
      cols="10"
      :md="insuranceSelectedPost.link ? '5' : '8'"
      :lg="insuranceSelectedPost.link ? '5' : '8'"
      class="my-10 text-center text-md-left"
    >
      <p class="title-insurance-post text-center text-md-left font-weight-bold">
        <span>{{ insuranceSelectedPost.excerpt }}</span>
      </p>
    </v-col>

    <v-col
      class="text-center"
      v-if="insuranceSelectedPost.link"
      cols="10"
      md="4"
      lg="4"
    >
      <v-btn
        width="200"
        height="45"
        :to="insuranceSelectedPost.link"
        class="mt-0 mt-md-10 mb-10"
        rounded="xl"
        color="green"
      >
        Aplica Ahora
      </v-btn>
    </v-col>

    <v-col class="insurance-sections-container" cols="12">
      <!-- SECTION COMPONENT -->
      <app-sections-component :sections="insuranceSelectedPost.sections" />
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.menu-categories {
  margin-top: -25px;
}

.title-insurance-post {
  color: #42595f;

  span {
    font-weight: 200;
    font-size: 13px;
  }
}
</style>
