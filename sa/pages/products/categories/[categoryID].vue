<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: '/productos/categorias/:categoryID'
})

import { Vue } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { ProductInterface } from '~/interfaces/products.interface';
import type { CategoriesInterface } from '~/interfaces/categories.interface';

// IMPORT GRAPHQL QUERY
import { GET_CATEGORY_BY_SLUG, GET_CATEGORY_BY_ID } from '~/graphql/categories.query';
import { GET_PRODUCTS_BY_CATEGORY_ID } from '~/graphql/products.query';

// IMPORT OPTIMIZED IMAGE COMPONENTS
import HeroImage from '~/components/optimized-image/HeroImage.vue';
import CardImage from '~/components/optimized-image/CardImage.vue';

import { isObjectId } from '~/utils/objectIdUtils'
import { GET_POST_BY_SLUG, GET_POSTS_BY_CATEGORY } from '~/graphql/post.query';
import type { PostInterface } from '~/interfaces/post.interface';
import type { SectionTypeInterface } from '~/interfaces/sections.interface';
// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'products-categories-screen',
  components: {
    // COMPONENTS CUSTOM APP
    HeroImage,
    CardImage,
  }
})
export default class ProductsCategoriesScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  public bannerPromotion = '/assets/backgrounds/Banner-promociones.jpg';
  public bannerPoints = '/assets/backgrounds/Banner-Puntos.jpg';

  // GET PARAM CATEGORY ID
  public pageParam = useRoute().params.categoryID;
  public categoryID = '';

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SELECTED POST
  public selectedPost: PostInterface | null = null;

  // PRODUCTS BY PARENT CATEGORY
  public category: CategoriesInterface = {
    _id: '',
    name: '',
    slug: '',
    excerpt: '',
    description: '',
    tags: [],
    parentTarget: '',
    pictures: {
      thumbnail: '',
      banner: '',
      responsive: '',
    },
    disabled: false,
    target: '',
  };

  // PRODUCTS BY PARENT CATEGORY
  public products: Array<ProductInterface> = [];

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    this.setCategoryById().then((data) => {
      this.category = data
      this.categoryID = this.category._id!
      // SET PRODUCTS BY CATEGORY ID
      this.setProductByCategoryId();

      // GET POSTS BY CATEGORY ID
      if (this.category.target === 'category::globals') {
        this.getPostsByCategory();
      }
      this.getPostsByCategory();
    }, (error) => {
      this.$router.push('/')
    })
  }

  ///////////////
  /// METHODS ///
  ///////////////

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
      this.selectedPost = postsFinal.length > 0 ? postsFinal[0] : null;

      // SET POST SELECTED
      this.selectedFirstPost();
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET PRODUCTS BY PARENT CATEGORY
  public async setCategoryById() : Promise<CategoriesInterface> {
    var param = typeof this.pageParam == 'string'? this.pageParam: this.pageParam.join("")
    var isAnObjectId = isObjectId(param)
    
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: isAnObjectId? GET_CATEGORY_BY_ID:GET_CATEGORY_BY_SLUG,
        variables: isAnObjectId? { categoryId: this.pageParam }:{ slug: this.pageParam } ,
        fetchPolicy: 'no-cache'
      })
      
      return Promise.resolve(isAnObjectId? data.findCategoryById:data.findCategoryBySlug)
    } catch (err) {
      // SHOW ERROR      
      this.$bus.$emit('handleError', err)
      return Promise.reject(err)
    }
  }

  // SET PRODUCTS BY PARENT CATEGORY
  public async setProductByCategoryId() {
    try {
      // PARENT KEY PAYLOAD
      const categoryID = { categoryId: this.categoryID }

      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_PRODUCTS_BY_CATEGORY_ID,
        variables: categoryID,
        fetchPolicy: 'no-cache'
      })

      // SET PRODUCTS
      this.products = data.findProductsByCategory

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // SELECTED FIRST POST
  public selectedFirstPost() {
    if (!this.selectedPost) return;

    // SET MENU OPTIONS
    this.$router.push(
      `/seccion/global/${this.category.slug}/${this.selectedPost.slug}`
    );
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

  public imparIndex(_id: string) {
    const getCard = this.products.filter((n, i) => i % 2 !== 0);
    const findCard = getCard.find(card => card._id === _id);
    return findCard ? true : false;
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12" style="position: relative; z-index: 0;">
      <HeroImage
        :src="$vuetify.display.mdAndDown ? category.pictures?.responsive : category.pictures?.banner"
        :alt="category.name || 'Banner de categoría'"
        :width="1920"
        :height="500"
        loading="eager"
      />
    </v-col>

    <v-col cols="12" class="my-10 text-center">
      <h1 class="text-h5 text-primary font-weight-bold">
        {{ category.excerpt }}
      </h1>
      <p class="text-caption text-primary">
        {{ category.description }}
      </p>
    </v-col>

    <v-col v-for="product in products" class="mt-5" cols="11" md="9" lg="7">
      <v-card v-if="imparIndex(product._id!)" class="mx-2 my-2 pa-0" :height="$vuetify.display.mdAndDown ? 'auto' : 280" rounded="lg">
        <v-row no-gutters>
          <v-col order="2" order-md="2" class="align-content-center" cols="12" md="12" lg="6">
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2 text-primary">
                {{ product.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ product.description }}
              </p>
              <v-btn width="140" :to="`/productos/cuentas/${pageParam}/item/${product.slug}`" color="primary"
                class="mx-3 mt-3 text-caption text-uppercase" rounded="xl" style="">
                Mas Información
              </v-btn>
            </div>
          </v-col>
          <v-col order="1" order-md="1" cols="12" md="12" lg="6">
            <CardImage
              :src="product.thumbnail || product.banner"
              :alt="product.name || 'Imagen de producto'"
              :width="600"
              :height="$vuetify.display.mdAndDown ? 150 : 280"
              container-class="category-image-container"
              image-class="category-image"
            />
          </v-col>
        </v-row>
      </v-card>

      <v-card v-else class="mx-2 my-2" :height="$vuetify.display.mdAndDown ? 'auto' : 280" rounded="lg">
        <v-row no-gutters>
          <v-col order="1" order-md="2" cols="12" md="12" lg="6">
            <CardImage
              :src="product.thumbnail || product.banner"
              :alt="product.name || 'Imagen de producto'"
              :width="600"
              :height="$vuetify.display.mdAndDown ? 150 : 280"
              container-class="category-image-container"
              image-class="category-image"
            />
          </v-col>
          <v-col order="2" order-md="1" class="align-content-center" cols="12" md="12" lg="6">
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2 text-primary">
                {{ product.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ product.description }}
              </p>
              <v-btn width="140" :to="`/productos/cuentas/${pageParam}/item/${product.slug}`" color="green"
                class="mx-3 mt-3 text-caption text-uppercase" rounded="xl" style="">
                Mas Información
              </v-btn>
            </div>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-account-container {
  overflow: inherit !important;

  .icon-large-card {
    top: -80px;
    right: -40px;
    position: absolute;

    &.circle {
      top: -60px;
      right: -50px;
    }
  }
}

.info-category-card-large-container {
  width: 100%;
  bottom: 0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-content: center;

  .category-card-description {
    color: #000000;
    max-height: 120px;
    overflow: hidden;
  }

  .category-image-container {
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }

  .category-image {
    border-radius: inherit;
  }
}

.card-promotions-container {
  overflow: inherit !important;

  .icon-large-card {
    top: -80px;
    right: -40px;
    position: absolute;

    &.circle {
      top: -60px;
      right: -50px;
    }
  }
}
</style>