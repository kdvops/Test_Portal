<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { ProductInterface } from '~/interfaces/products.interface';
import type { CategoriesInterface } from '~/interfaces/categories.interface';

// IMPORT GRAPHQL QUERY
import { GET_CATEGORY_BY_ID } from '~/graphql/query/categories.query';
import { GET_PRODUCTS_BY_CATEGORY_ID } from '~/graphql/query/products.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-category-products-screen',
  components: {
    // COMPONENTS CUSTOM APP
  }
})
class PreviewCategoryProductsScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM CATEGORY ID
  public categoryID = useRoute().params.categoryID;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

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
    this.setCategoryById()
    this.setProductByCategoryId()
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PRODUCTS BY PARENT CATEGORY
  public async setCategoryById() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORY_BY_ID,
        variables: { categoryId: this.categoryID },
        fetchPolicy: 'no-cache'
      })

      this.category = data.findCategoryById;
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

  public imparIndex(_id: string) {
    const getCard = this.products.filter((n, i) => i % 2 !== 0);
    const findCard = getCard.find(card => card._id === _id);
    return findCard ? true : false;
  }
}
export default PreviewCategoryProductsScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <v-img width="100%" height="500"
        :src="$vuetify.display.mdAndDown? category.pictures.responsive?? category.pictures.responsiveImageDetail?.image?? '' : category.pictures.banner?? category.pictures.bannerImageDetail?.image?? ''" 
        cover />
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
      <v-card v-if="imparIndex(product._id!)" class="mx-2 my-2 pa-0" :height="$vuetify.display.mdAndDown ? 'auto' : 280"
        rounded="lg">
        <v-row no-gutters>
          <v-col order="2" order-md="2" class="align-content-center" cols="12" md="12" lg="6">
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2 text-primary">
                {{ product.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ product.description }}
              </p>
              <v-btn width="140" :to="`/productos/cuentas/${categoryID}/item/${product._id}`" color="primary"
                class="mx-3 mt-3 text-caption text-uppercase" rounded="xl" style="">
                Mas Información
              </v-btn>
            </div>
          </v-col>
          <v-col order="1" order-md="1" cols="12" md="12" lg="6">
            <v-img width="100%" :height="$vuetify.display.mdAndDown ? 150 : 280"
              :src="product.thumbnail ? product.thumbnail : product.banner" 
              :alt="product.bannerImageDetail?.altText?? ''"
              position="center" cover />
          </v-col>
        </v-row>
      </v-card>

      <v-card v-else class="mx-2 my-2" :height="$vuetify.display.mdAndDown ? 'auto' : 280" rounded="lg">
        <v-row no-gutters>
          <v-col order="1" order-md="2" cols="12" md="12" lg="6">
            <v-img width="100%" :height="$vuetify.display.mdAndDown ? 150 : 280"
              :src="product.thumbnail ? product.thumbnail : product.banner" 
              :alt="product.bannerImageDetail?.altText?? ''"
              position="center" cover />
          </v-col>
          <v-col order="2" order-md="1" class="align-content-center" cols="12" md="12" lg="6">
            <div class="info-category-card-large-container">
              <p class="px-3 py-2 text-h5 font-weight-bold mt-2 text-primary">
                {{ product.name }}
              </p>
              <p class="px-3 pb-2 text-caption category-card-description">
                {{ product.description }}
              </p>
              <v-btn width="140" :to="`/productos/cuentas/${categoryID}/item/${product._id}`" color="green"
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