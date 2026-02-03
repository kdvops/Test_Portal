<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/sobre-nosotros/proteccion-al-usuario/:categoryID/:itemID?",
  seoManual: true,
});

import { Vue, Watch } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { ProuserInterface } from "~/interfaces/prouser.interface";

// IMPORT COMPONENTS
import AppMenuComponent from "~/components/menu/index.vue";
import AppSectionsComponent from "~/components/sections/index.vue";
import HeroImage from '~/components/optimized-image/HeroImage.vue';
import CardImage from '~/components/optimized-image/CardImage.vue';

// IMPORT QUERY
import {
  GET_PROUSER_POST_BY_CATEGORY,
  GET_PROUSER_POST_BY_SLUG,
} from "~/graphql/prouser.query";
import {
  GET_CATEGORY_BY_SLUG,
  GET_CATEGORY_BY_ID,
} from "~/graphql/categories.query";
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

// IMPORT IMAGES
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
  name: "prouser-post-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-menu-component": AppMenuComponent,
    "app-sections-component": AppSectionsComponent,
    HeroImage,
    CardImage,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as ProuserPostScreen;
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
      data.findProuserBySlug as ProuserInterface;

    const queries = {
      singleQuery: GET_PROUSER_POST_BY_SLUG,
      varNames: { single: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<ProuserInterface>("title");
    const pickDesc = makeStringFieldPicker<ProuserInterface>("description");
    const pickId = makeIdFieldPicker<ProuserInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.itemPageParam === "string"
          ? vm.itemPageParam
          : normalizeParam(vm.itemPageParam as any);

      await applyEntitySeoForKey<ProuserInterface>({
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
export default class ProuserPostScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  public bannerReport = '/assets/backgrounds/Banner-reclamaciones.jpg';
  public bannerChannel = '/assets/backgrounds/Banner-canales.jpg';
  public bannerDocument = '/assets/backgrounds/Banner-document.png';

  // GET PARAM CATEGORY ID
  public pageParam = useRoute().params.categoryID;
  public itemPageParam = useRoute().params.itemID;
  public categoryID = '';
  public itemID = '';

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // POST SELECTED
  public prouserSelectedPost: ProuserInterface = {
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
  public posts: Array<ProuserInterface> = [];

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
      this.getProuserPostsByCategory()
    }, (error) => {
      this.$router.push('/')
    })

  }

  ///////////////
  /// METHODS ///
  ///////////////
  private async getCategoryIdBySlug(): Promise<string> {
    var param = typeof this.pageParam == 'string' ? this.pageParam : this.pageParam.join("")
    var isAnObjectId = isObjectId(param)

    try {
      // PAYLOAD BY ID
      const slug = { slug: this.pageParam }

      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: isAnObjectId ? GET_CATEGORY_BY_ID : GET_CATEGORY_BY_SLUG,
        variables: isAnObjectId ? { categoryId: this.pageParam } : { slug: this.pageParam },
        fetchPolicy: 'no-cache'
      })

      const dta = isAnObjectId ? data.findCategoryById : data.findCategoryBySlug
      return Promise.resolve(dta._id)
    }
    catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError freom cid', err)
      return Promise.reject(err)
    }
  }

  // GET POSTS BY CATEGORY
  public async getProuserPostsByCategory() {
    try {

      // ARGS FILTER DTO
      const findProuserByCategoryDto = {
        category: this.categoryID
      }

      const { data } = await this.$apollo.query({
        query: GET_PROUSER_POST_BY_CATEGORY,
        variables: findProuserByCategoryDto,
        fetchPolicy: 'no-cache'
      })

      // GET POSTS
      const posts = data.findProuserByCategory;

      // DECRYPT BASE64 TEXT TO HTML
      const postsFinal = posts.map((post: ProuserInterface) => ({ ...post, sections: this.decryptBaseToHtml(post.sections) }));

      // SET POSTS
      this.posts = postsFinal;

      // SET POST SELECTED 
      this.selectedFirstPost()

      // SET MENU OPTIONS
      this.setMenuOptions();

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // SELECTED FIRST POST
  public selectedFirstPost() {
    // SET POST SELECTED
    this.posts.length > 0 && (this.prouserSelectedPost = this.posts[0]);

    // SET MENU OPTIONS
    if (!this.itemPageParam) {
      this.$router.push(`/sobre-nosotros/proteccion-al-usuario/${this.pageParam}/${this.prouserSelectedPost.slug ? this.prouserSelectedPost.slug : this.prouserSelectedPost._id}`);
    }
    else {
      // SET POST SELECTED
      this.prouserSelectedPost = this.posts.find(post => post.slug === this.itemPageParam) || this.posts[0];
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
        text: section.text ? decrypt(section.text) : ''
      };
    });
  }

  // SET MENU OPTIONS
  public setMenuOptions() {
    this.menuOptions = {
      route: `/sobre-nosotros/proteccion-al-usuario/${this.pageParam}/`,
      current: this.pageParam,
      color: 'green',
      default: {
        name: 'Protección al usuario',
        icon: 'mdi-shield-account',
        to: `/sobre-nosotros/proteccion-al-usuario/${this.pageParam}`,
      },
      items: this.posts.map(post => ({ _id: post._id, name: post.title, slug: post.slug })),
    }
  }

  ///////////////
  /// WATCHER ///
  ///////////////
  // WATCH FILTER SEARCH
  @Watch('postID')
  public watchFilterSearch() {
    this.getProuserPostsByCategory()
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
          (prouserSelectedPost.responsive ||
            prouserSelectedPost.responsiveImageDetail)
            ? prouserSelectedPost.responsive ??
              prouserSelectedPost.responsiveImageDetail?.image
            : prouserSelectedPost.banner ??
              prouserSelectedPost.bannerImageDetail?.image
        "
        :alt="
          $vuetify.display.mdAndDown && prouserSelectedPost.responsiveImageDetail
            ? prouserSelectedPost.responsiveImageDetail?.altText ?? ''
            : prouserSelectedPost.bannerImageDetail?.altText ?? ''
        "
        :width="1920"
        :height="500"
        loading="eager"
      />
    </v-col>

    <!-- MENU COMPONENT -->
    <v-col v-if="menuOptions.items.length > 1" class="menu-categories py-0" cols="12" md="10" lg="10" style="position: relative; z-index: 10;">
      <app-menu-component :options="menuOptions" @changeRoute="changeRoute" />
    </v-col>

    <v-col cols="10" :md="prouserSelectedPost.link ? '5' : '8'" :lg="prouserSelectedPost.link ? '5' : '8'"
      class="my-10 text-center text-md-left">
      <p class="title-prouser-post text-center text-md-left font-weight-bold">
        <span>{{ prouserSelectedPost.excerpt }}</span>
      </p>
    </v-col>

    <v-col class="text-center" v-if="prouserSelectedPost.link" cols="10" md="4" lg="4">
      <v-btn width="200" height="45" :to="prouserSelectedPost.link" class="mt-0 mt-md-10 mb-10" rounded="xl" color="green">
        Aplica Ahora
      </v-btn>
    </v-col>

    <v-col class="prouser-sections-container" cols="12">
      <!-- SECTION COMPONENT -->
      <app-sections-component :sections="prouserSelectedPost.sections" />
    </v-col>

    <v-col cols="12" md="9" lg="7">
      <div class="my-10 banner-document-wrapper" :style="{ borderRadius: $vuetify.display.mdAndDown ? '0' : '12px', overflow: 'hidden', position: 'relative' }">
        <HeroImage
          :src="bannerDocument"
          :alt="'Validación de documentos'"
          :width="1920"
          :height="200"
          loading="lazy"
          container-class="banner-document-container"
        />
        <!-- LAYER TEXT -->
        <div class="banner-overlay">
          <v-row class="h-100 pa-10 ma-0" align="center" justify="start" no-gutters>
            <v-col cols="12" md="6" lg="6" class="d-flex flex-column justify-center">
              <p class="text-title text-md-h6 font-weight-bold text-white mb-4">Validación de documentos emitidos <br> por el Banco Santa Cruz</p>
              <v-btn width="150" height="50" to="/document-validator" class="text-body-2" variant="elevated"
                rounded="xl" color="green">
                Valida Aquí
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
    </v-col>

    <v-col class="mt-10" cols="12" style="position: relative; z-index: 0;">
      <div style="position: relative; width: 100%; height: 500px; z-index: 0;">
        <HeroImage
          :src="bannerReport"
          :alt="'Banner de reclamaciones'"
          :width="1920"
          :height="500"
          loading="lazy"
          container-class="banner-report-container"
        />
        <div class="banner-overlay">
        <v-card :width="$vuetify.display.mdAndDown ? '90%' : '60%'" class="card-prouser-container mx-auto pa-8"
          rounded="xl" color="#01569ec7">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8" lg="7">
                <h1 class="text-title text-md-h6 text-white font-weight-bold">
                  ¿Necesitas hacer una reclamacion?
                </h1>
                <p class="text-white text-caption text-md-body-1 font-weight-thin mt-5">
                  De lunes a viernes de 8:00 AM a 10:00 PM <br>
                  Sábados de 8:00 AM a 8:00 PM <br>
                  Domingos y días feriados de 8:00 AM a 6:00 PM <br>
                  <span class="font-weight-bold"> Centros de Negocios BSC.</span>
                </p>
              </v-col>
              <v-col cols="12" md="5" lg="5" class="text-center mt-0 mt-md-5">
                <v-btn width="150" height="50"
                  href="https://stgpwebsc.blob.core.windows.net/bsc-pweb-prod/sections/674787a43896f64580f5f1d4/6052907-1732741028399.pdf?sv=2022-11-02&ss=bfqt&srt=sco&sp=rwdlacupiytfx&se=2026-01-12T02:04:48Z&st=2025-01-31T18:04:48Z&spr=https&sig=qCkGdfW9toWR6zKeR2RbqW67PigOvBjSWcz%2BcdGgPIY%3D"
                  class="mt-15 text-body-2" variant="elevated" rounded="xl" color="green">
                  Ver más
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
        </div>
      </div>
    </v-col>

    <v-col cols="12" md="9" lg="7">
      <div class="my-10 banner-channel-wrapper" :style="{ borderRadius: $vuetify.display.mdAndDown ? '0' : '12px', overflow: 'hidden', position: 'relative' }">
        <HeroImage
          :src="bannerChannel"
          :alt="'Canales de consulta'"
          :width="1920"
          :height="200"
          loading="lazy"
          container-class="banner-channel-container"
        />
        <!-- LAYER TEXT -->
        <div class="banner-overlay">
          <v-row class="h-100 pa-10 ma-0" align="center" justify="start" no-gutters>
            <v-col cols="12" md="6" lg="6" class="d-flex flex-column justify-center">
              <p class="text-h5 font-weight-bold text-white mb-4">Canales de consulta y asesoramiento</p>
              <v-btn width="150" height="50" href="https://prousuario.gob.do/" class="text-body-2" variant="elevated"
                rounded="xl" color="green">
                Ver Aquí
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </div>
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

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.banner-document-container,
.banner-report-container,
.banner-channel-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  object-fit: cover;
}

.banner-channel-wrapper,
.banner-document-wrapper {
  height: 200px;

  @media (max-width: 960px) {
    height: 200px;
  }

  @media (max-width: 600px) {
    height: 180px;
  }
}

.title-prouser-post {
  color: #42595f;

  span {
    font-weight: 200;
    font-size: 13px;
  }
}
</style>
