<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/seccion/:targetSlug/:categorySlug",
});

import { Vue, Watch } from "vue-facing-decorator";
import { useRobustSEO } from "~/composables/useRobustSEO";
// IMPORT INTERFACES
import type {
  TargetInterface,
  TargetPostInterface,
} from "~/interfaces/targets.interface";
import type { SectionTypeInterface } from "~/interfaces/sections.interface";
import type { ShortcutInterface } from "~/interfaces/shortcuts.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";

// IMPORT COMPONENTS
import AppMenuComponent from "~/components/menu/index.vue";
import AppSectionsComponent from "~/components/sections/index.vue";
import AppShortcutsComponent from "~/components/shortcuts/index.vue";
import HeroImage from "~/components/optimized-image/HeroImage.vue";

// IMPORT QUERY
import { GET_POST_BY_SLUG } from "~/graphql/post.query";
import { GET_CATEGORY_BY_SLUG } from "~/graphql/categories.query";
import { GET_SHORTCUTS_BY_TARGET } from "~/graphql/shortcuts.query";
import { GET_POSTS_BY_CATEGORY } from "~/graphql/post.query";
import type { PostInterface } from "~/interfaces/post.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "target-category-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-menu-component": AppMenuComponent,
    "app-sections-component": AppSectionsComponent,
    "app-shortcuts-component": AppShortcutsComponent,
    HeroImage,
  },
})
export default class TargetCategoryScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM CATEGORY ID
  public categorySlug = useRoute().params.categorySlug;

  // GET PARAM TARGET SLUG
  public targetSlug = useRoute().params.targetSlug;

  // GET TARGET
  public target: TargetInterface = {
    _id: "",
    name: "",
    slug: "",
    icon: "",
    color: "primary",
    description: "",
    sections: [],
    status: "publish",
    featured: "hidden",
    showCategories: false,
    showPosts: false,
  };

  // GET PARAM POST SLUG
  public postSlug = useRoute().params.postSlug;

  // CATEGORY
  public category: CategoriesInterface = {
    _id: "",
    name: "",
    description: "",
    slug: "",
    pictures: {
      responsive: "",
      banner: "",
      thumbnail: "",
    },
    disabled: false,
    excerpt: "",
    target: "",
  };

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // POST SELECTED
  public selectedPost: PostInterface = {
    _id: "",
    title: "",
    slug: "",
    subtitle: "",
    link: "",
    excerpt: "",
    banner: "",
    responsive: "",
    thumbnail: "",
    category: null,
    targetID: null,
    sections: [],
  };

  // POSTS
  public posts: Array<PostInterface> = [];

  // MENU OPTIONS
  public menuOptions: any = {
    route: "",
    current: "",
    color: "primary",
    default: {
      name: "",
      icon: "",
      to: "",
    },
    items: [],
  };

  // SHORTCUTS ARRAY
  public shortcuts: Array<ShortcutInterface> = [];

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public async created() {
    await this.getCategoryBySlug();
    await this.getPostsByCategory();
    
    // APPLY SEO METADATA AFTER INITIAL LOAD
    // this.applySEOMetadata();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  public async getCategoryBySlug() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORY_BY_SLUG,
        variables: { slug: this.categorySlug },
        fetchPolicy: "no-cache",
      });

      // SET CATEGORY ID
      this.category = data.findCategoryBySlug;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit(
        "handleError",
        "Error al obtener el Slug de la categoría"
      );
    }
  }

  // GET POSTS BY CATEGORY
  public async getPostsByCategory() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_POSTS_BY_CATEGORY,
        variables: { categoryId: this.category._id },
        fetchPolicy: "no-cache",
      });

      // GET POSTS
      const posts = data.findPostsByCategory;

      // DECRYPT BASE64 TEXT TO HTML
      const postsFinal = posts.map((post: PostInterface) => ({
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

  // GET POST BY SLUG
  public async getTargetPostBySlug() {
    try {
      // GET POST BY SLUG
      const { data } = await this.$apollo.query({
        query: GET_POST_BY_SLUG,
        variables: { slug: this.postSlug },
        fetchPolicy: "no-cache",
      });

      // GET POSTS
      const post = data.findPostsBySlug;

      // DECRYPT BASE64 TEXT TO HTML
      const postsFinal = {
        ...post,
        sections: this.decryptBaseToHtml(post.sections),
      };

      // SET POST DATA
      this.selectedPost = postsFinal;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SELECTED FIRST POST
  public selectedFirstPost() {
    // SET POST SELECTED
    this.posts.length > 0 && (this.selectedPost = this.posts[0]);

    // SET MENU OPTIONS
    this.$router.push(
      `/seccion/${this.targetSlug}/${this.categorySlug}/${this.selectedPost.slug}`
    );
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
      route: `/seccion/${this.targetSlug}/${this.categorySlug}/`,
      current: this.postSlug,
      color: this.target?.color || "primary",
      default: {
        name: this.category.name,
        icon: this.target?.icon || "mdi-target",
        to: `/seccion/${this.targetSlug}/${this.categorySlug}/${this.selectedPost.slug}`,
      },
      items: this.posts.map((post) => ({
        _id: post._id,
        name: post.title,
        slug: post.slug,
      })),
    };
  }

  // APPLY SEO METADATA
  public applySEOMetadata() {
    if (this.category && this.target) {
      this.robustSEO.applyRobustSEO({
        section: 'targets',
        category: this.category.name,
        item: this.target.name,
        target: this.target,
        categoryData: this.category
      });
    }
  }

  public redirectTab(shortcut: { _id: string; name: string }) {
    this.$router.push({
      path: "/target",
      query: {
        item: shortcut._id,
        name: shortcut.name,
      },
    });
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
          (selectedPost.responsiveImageDetail?.image || selectedPost.responsive)
            ? selectedPost.responsiveImageDetail?.image ?? selectedPost.responsive
            : selectedPost.bannerImageDetail?.image ?? selectedPost.banner
        "
        :alt="
          $vuetify.display.mdAndDown && selectedPost.responsiveImageDetail
            ? selectedPost.responsiveImageDetail?.altText ?? selectedPost.title ?? ''
            : selectedPost.bannerImageDetail?.altText ?? selectedPost.title ?? ''
        "
        :width="1920"
        :height="500"
        loading="eager"
      />
    </v-col>

    <!-- MENU SHORTCUTS -->
    <template v-if="shortcuts.length > 0">
      <v-col cols="12" md="10" lg="9" style="position: relative; z-index: 10;">
        <app-shortcuts-component
          :shortcuts="shortcuts"
          type="tabs-redirect"
          @redirectTab="redirectTab"
        />
      </v-col>
    </template>
    <!-- MENU COMPONENT -->
    <template v-else>
      <v-col class="menu-categories py-0" cols="12" md="10" lg="10" style="position: relative; z-index: 10;">
        <app-menu-component :options="menuOptions" @changeRoute="changeRoute" />
      </v-col>
    </template>

      <v-col
        cols="10"
        :md="selectedPost && selectedPost.link ? '5' : '8'"
        :lg="selectedPost && selectedPost.link ? '5' : '8'"
        class="my-10 text-center text-md-left"
      >
        <p class="title-target-post text-center text-md-left font-weight-bold">
          <span>{{ selectedPost.excerpt }}</span>
        </p>
      </v-col>

      <v-col
        class="text-center"
        v-if="selectedPost && selectedPost.link"
        cols="10"
        md="4"
        lg="4"
      >
        <v-btn
          width="200"
          height="45"
          :to="selectedPost && selectedPost.link"
          class="mt-0 mt-md-10 mb-10"
          rounded="xl"
          color="primary"
        >
          Aplica Ahora
        </v-btn>
      </v-col>

    <v-col class="target-sections-container" cols="12">
      <!-- SECTION COMPONENT -->
      <app-sections-component :sections="selectedPost.sections" />
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

.title-target-post {
  color: #42595f;

  span {
    font-weight: 200;
    font-size: 13px;
  }
}
</style>
