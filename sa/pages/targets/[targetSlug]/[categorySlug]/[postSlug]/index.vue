<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/seccion/:targetSlug/:categorySlug/:postSlug",
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
import type { PostInterface } from "~/interfaces/post.interface";

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

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "target-category-post-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-menu-component": AppMenuComponent,
    "app-sections-component": AppSectionsComponent,
    "app-shortcuts-component": AppShortcutsComponent,
    HeroImage,
  },
})
export default class TargetCategoryPostScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM CATEGORY ID
  public categorySlug = useRoute().params.categorySlug;

  // GET PARAM TARGET SLUG
  public targetSlug = useRoute().params.targetSlug;

  // GET PARAM POST SLUG
  public postSlug = useRoute().params.postSlug;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

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

  // TARGET
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

  // POST
  public post: PostInterface = {
    _id: "",
    slug: "",
    title: "",
    subtitle: "",
    excerpt: "",
    link: "",
    banner: "",
    responsive: "",
    thumbnail: "",
    sections: [],
    category: null,
    targetID: null,
  };

  // POST SELECTED
  public posts: Array<TargetPostInterface> = [];

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

  // TRANSITION CONTROL
  public transitionKey = 0;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public async created() {
    await this.getCategoryIdBySlug();
    await this.getTargetPostBySlug();
    await this.getPostsByCategory();
    
    // APPLY SEO METADATA AFTER INITIAL LOAD
    // this.applySEOMetadata();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET SHORTCUTS BY TARGET
  //   public async getShortcutsByTarget() {
  //     try {
  //       const { data } = await this.$apollo.query({
  //         query: GET_SHORTCUTS_BY_TARGET,
  //         variables: {
  //           target: "target::target",
  //         },
  //         fetchPolicy: "no-cache",
  //       });

  //       // SET SHORTCUTS
  //       this.shortcuts = data.findShortcutsByTarget;
  //     } catch (err) {
  //       // SHOW ERROR
  //       this.$bus.$emit("handleError", err);
  //     }
  //   }

  // GET CATEGORY ID BY SLUG
  public async getCategoryIdBySlug() {
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
      this.post = postsFinal;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GET POSTS BY CATEGORY
  public async getPostsByCategory() {
    try {
      // GET POSTS BY CATEGORY
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

      // SET POSTS DATA
      this.posts = postsFinal;

      // SET MENU OPTIONS
      this.setMenuOptions();
    } catch (err) {
      console.log(err);
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
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
      route: `/seccion/${this.targetSlug}/${this.categorySlug}/`,
      current: this.postSlug,
      color: this.target?.color || "primary",
      default: {
        name: this.category.name,
        icon: this.target?.icon || "mdi-target",
        to: `/seccion/${this.targetSlug}/${this.categorySlug}/${this.postSlug}`,
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
    if (this.post && this.category && this.target) {
      this.robustSEO.applyRobustSEO({
        section: 'targets',
        category: this.category.name,
        item: this.post.title,
        target: this.target,
        post: this.post,
        categoryData: this.category
      });
    }
  }

  public redirectTab(shortcut: { _id: string; name: string }) {
    this.$router.push({
      path: `"/seccion/${this.targetSlug}"`,
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
  @Watch("postSlug", { immediate: true, deep: true })
  public async watchPostSlug() {
    // INCREMENT KEY TO FORCE TRANSITION
    this.transitionKey++;

    //  LOAD CONTENT
    await this.getTargetPostBySlug();

    // SET MENU OPTIONS
    this.setMenuOptions();

    // APPLY SEO METADATA
    // this.applySEOMetadata();
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <Transition name="fade" mode="out-in">
    <v-row
      :key="transitionKey"
      justify="center"
      align-content="center"
      no-gutters
    >
      <!-- BANNER CAROUSEL -->
      <v-col cols="12" style="position: relative; z-index: 0;">
        <HeroImage
          :src="
            $vuetify.display.mdAndDown &&
            (post.responsiveImageDetail?.image || post.responsive)
              ? post.responsiveImageDetail?.image ?? post.responsive
              : post.bannerImageDetail?.image ?? post.banner
          "
          :alt="
            $vuetify.display.mdAndDown && post.responsiveImageDetail
              ? post.responsiveImageDetail?.altText ?? post.title ?? ''
              : post.bannerImageDetail?.altText ?? post.title ?? ''
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
        <v-col class="menu-categories py-0" cols="12" md="10" lg="10" style="position: relative; z-index: 10;">
          <app-menu-component
            :options="menuOptions"
            @changeRoute="changeRoute"
          />
        </v-col>
      </template>

      <v-col
        cols="10"
        :md="post.link ? '5' : '8'"
        :lg="post.link ? '5' : '8'"
        class="my-10 text-center text-md-left"
      >
        <p class="title-target-post text-center text-md-left font-weight-bold">
          <span>{{ post.excerpt }}</span>
        </p>
      </v-col>

      <v-col class="text-center" v-if="post.link" cols="10" md="4" lg="4">
        <v-btn
          width="200"
          height="45"
          :to="post.link"
          class="mt-0 mt-md-10 mb-10"
          rounded="xl"
          color="primary"
        >
          Aplica Ahora
        </v-btn>
      </v-col>

      <v-col class="target-sections-container" cols="12">
        <!-- SECTION COMPONENT -->
        <app-sections-component :sections="post.sections" />
      </v-col>
    </v-row>
  </Transition>
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

// Transición de fade
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
