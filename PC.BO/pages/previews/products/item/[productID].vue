<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { ProductsInterface } from '~/interfaces/sections.interface';

// IMPORT COMPONENTS
import AppPreviewSectionsComponent from '~/components/previews/sections/index.vue';

// IMPORT GRAPHQL QUERY
import { GET_PRODUCT_BY_ID } from '~/graphql/query/products.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-product-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-preview-sections-component': AppPreviewSectionsComponent,
  }
})
class PreviewProductScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET PARAM CATEGORY ID
  public productID = useRoute().params.productID;

  // SECTIONS CARDS DEFAULT VALUES
  public product: ProductsInterface = {
    name: '',
    description: '',
    category: '',
    banner: '',
    sections: [],
  }

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    this.setProductById();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET PRODUCT BY ID
  public async setProductById() {
    try {

      // PAYLOAD BY ID
      const productID = {
        productId: this.productID
      }

      // GET PRODUCT BY ID
      const { data } = await this.$apollo.query({
        query: GET_PRODUCT_BY_ID,
        variables: productID,
        fetchPolicy: 'no-cache'
      })

      // SET PRODUCT
      const product = data.findProductById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = product.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : ''
        };
      });

      // SET PRODUCT TO VARIABLE
      this.product = { ...product, sections };

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }
}
export default PreviewProductScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <v-img width="100%" height="500"
        :src="$vuetify.display.mdAndDown? product.responsive?? product.responsiveImageDetail?.image?? '' : product.banner?? product.bannerImageDetail?.image?? ''" 
        cover />
    </v-col>

    <!-- SECTION COMPONENT -->
    <v-col cols="12">
      <app-preview-sections-component :sections="product.sections" />
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.menu-categories {
  margin-top: -25px;
}
</style>