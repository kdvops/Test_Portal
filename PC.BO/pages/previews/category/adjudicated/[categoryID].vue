<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from 'vue-facing-decorator'
// IMPORT COMPONENTS
import PreviewAppCarouselComponent from '~/components/previews/carousel/index.vue';

// IMPORT INTERFACES
import type { SliderOptions } from '~/interfaces/slider.interface';
import type { CategoriesInterface } from '~/interfaces/categories.interface';
import type { AdjudicatedPictureInterface, ProductAdjudicatedInterface } from '~/interfaces/adjudicated.interface';

// IMPORT GRAPHQL QUERY
import { GET_PRODUCTS_ADJUDICATED } from '~/graphql/query/adjudicated.query';
import { GET_SLIDERS_BY_TARGET } from '~/graphql/query/slider.query';
import { GET_CATEGORIES_BY_TARGET } from '~/graphql/query/categories.query';
import type { ImageDetailInterface } from '~/interfaces/detailed-image.interface';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-adjudicated-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'preview-app-carousel-component': PreviewAppCarouselComponent
  }
})
class PreviewAdjudicatedScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SHORTCUTS
  public products: Array<ProductAdjudicatedInterface> = [];

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: false,
    sliders: [],
    position: 0
  }

  // GET PARAM CATEGORY ID
  public categoryID = useRoute().params.categoryID;

  // PARAMS SEARCH ADJUDICATED
  public params: any = {
    search: '',
    category: '',
    province: '',
    priceMin: null,
    priceMax: null,
  }

  public dialog: { show: boolean, product: ProductAdjudicatedInterface | null } = {
    show: false,
    product: null
  }

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // GET SLIDERS
    this.getSliders()

    // GET PRODUCTS ADJUDICATED
    this.getAdjudicatedProducts()
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET SLIDERS
  public async getAdjudicatedProducts() {
    try {

      const argsAdjudicated = {
        argsAdjudicated: {
          ...this.params,
          category: this.categoryID,
          priceMax: Number(this.params.priceMax) || null,
          priceMin: Number(this.params.priceMin) || null
        }
      }

      const { data } = await this.$apollo.query({
        query: GET_PRODUCTS_ADJUDICATED,
        variables: argsAdjudicated,
        fetchPolicy: 'no-cache'
      })

      // SET HTML ADJUDICATED
      const productsFind = data.findAdjudicated.map((product: ProductAdjudicatedInterface) => ({
        ...product,
        description: product.description
          ? decrypt(product.description)
          : ''
      }))

      // SET PRODUCTS ADJUDICATED
      this.products = productsFind

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // GET SLIDERS
  public async getSliders() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SLIDERS_BY_TARGET,
        variables: {
          target: 'banner::adjudicated'
        },
        fetchPolicy: 'no-cache'
      })

      // FILTER SLIDERS FOR HOME
      this.optionSliders = {
        show: true,
        sliders: data.findSliderByTarget,
        position: 0
      }

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // GET COVER IMAGE PRODUCT 
  public getImageCover(product: ProductAdjudicatedInterface) {
    const pictures = product.pictures?? product.picturesImageDetail
    const findPictureCover = pictures.find((picture: AdjudicatedPictureInterface|ImageDetailInterface) => picture.isCover)

    return findPictureCover?.image?? pictures?.[0]?.image?? ''
  }

  public openProductDialog(product: ProductAdjudicatedInterface) {
    this.dialog = {
      show: true,
      product: product
    }
  }

  public closeProductDialog() {
    this.dialog = {
      show: false,
      product: null
    }
  }

  public calculateExchangeRate(price: number): string {
    return price.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
    })
  }

}

export default PreviewAdjudicatedScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="adjudicated-home-container" justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <preview-app-carousel-component :options="optionSliders" />
    </v-col>

    <v-col cols="12" md="9" lg="8" xl="8" style="margin-top: -30px">
      <v-card width="auto" :height="$vuetify.display.mdAndDown ? 'auto' : '60'" color="#faf9ff" elevation="3" :rounded="$vuetify.display.mdAndDown ? 'none' : 'xl'" density="comfortable">
        <v-row justify="center" align-content="center" no-gutters>
          <v-col cols="12" md="2" lg="2">
            <v-menu>
              <template v-slot:activator="{ props: activatorProps }">
                <v-btn width="100%" height="60" color="primary" class="px-2 text-caption text-uppercase"
                  v-bind="activatorProps">
                  {{ params.province ? params.province : 'Provincias' }}
                  <v-icon>
                    mdi-chevron-down
                  </v-icon>
                </v-btn>
              </template>

              <v-list max-height="300">
                <v-list-item class="text-caption text-primary" v-text="'Todos'" @click="params.province = null">
                </v-list-item>
                <v-list-item v-for="province in provinces" :key="province.id" class="text-caption text-primary"
                  v-text="province.name" @click="params.province = province.name">
                </v-list-item>
              </v-list>
            </v-menu>
          </v-col>
          <v-col class="mx-auto" cols="12" md="3" lg="3">
            <v-text-field v-model="params.priceMin" class="mt-2" bg-color="white" density="compact" variant="outlined"
              placeholder="Precio desde (RD)" type="number"></v-text-field>
          </v-col>
          <v-col class="mx-auto" cols="12" md="3" lg="3">
            <v-text-field v-model="params.priceMax" class="mt-2" bg-color="white" density="compact" variant="outlined"
              placeholder="Precio hasta (RD)" type="number"></v-text-field>
          </v-col>
          <v-col cols="12" md="1" lg="1">
            <v-btn width="100%" height="60" color="green" @click="getAdjudicatedProducts()">
              Buscar
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>

    <v-col cols="10" class="my-15 mx-auto">
      <v-row justify="center">
        <template v-if="products.length > 0">
          <template v-for="product in products" :key="product._id">
            <v-col cols="12" md="5" lg="4" v-if="product.status !== 'unavailable'">
              <v-card min-width="auto" width="auto" max-width="350" height="450" color="#faf9ff" elevation="5" style="border-bottom: #00a44f solid 5px">
                <v-img width="100%" height="180" color="#ffffff" 
                  :src="getImageCover(product)?? ''"
                  cover></v-img>

                <v-row class="px-5 pt-2 pb-5" no-gutters>
                  <v-col cols="12">
                    <p class="text-grey text-caption">{{ product.province }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p class="text-h5 text-capitalize text-primary font-weight-bold">{{ product.name }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p class="text-h4 text-green font-weight-bold my-1">{{ calculateExchangeRate(product.price) }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p class="text-grey text-caption mt-2">{{ product.excerpt }}
                    </p>
                  </v-col>
                </v-row>
                <div class="position-absolute d-flex w-100" style="bottom: 5px">
                  <v-col cols="6" class="pr-5 mt-4">
                    <v-btn width="100%" height="40" :to="product.link" color="primary" rounded="xl"
                      class="px-2 text-caption text-uppercase">
                      Aplica ahora
                    </v-btn>
                  </v-col>
                  <v-col cols="6" class="pl-5 mt-4">
                    <v-btn width="100%" @click="openProductDialog(product)" height="40" color="green" rounded="xl"
                      class="px-2 text-caption text-uppercase">
                      Ver mas
                    </v-btn>
                  </v-col>
                </div>
              </v-card>
            </v-col>
          </template>
        </template>
        <template v-else>
          <v-col cols="10" md="6" lg="6">
            <client-only>
              <v-card class="text-center" rounded="xl" elevation="0">
                <p class="text-h4 my-15 text-grey font-weight-bold">¡No se han encontrado <br> bienes con tu busqueda!</p>
              </v-card>
            </client-only>
          </v-col>
        </template>
      </v-row>
    </v-col>

    <!-- DIALOG DETAILS PRODUCT -->
    <v-dialog v-model="dialog.show" v-if="dialog.product" max-width="70%" height="90%"
      class="dialog-adjudicated-product" persistent>
      <v-card width="100%" height="100%" rounded="xl">
        <v-card-title class="text-h6 font-weight-bold text-white py-5" style="background-color: var(--bsc-primary-color);">
          {{ dialog.product.name }}
          <v-btn class="mt-5 mr-5" color="red" density="compact" position="absolute" location="end top"
            @click="closeProductDialog()" icon>
            <v-icon size="16" color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <v-row class="pb-10">
            <v-col cols="12">
              <v-carousel height="650" mandatory="force" hide-delimiters>
                <template v-if="dialog.product.pictures" v-for="(picture, i) in dialog.product.pictures" :key="''+picture._id">
                  <v-carousel-item :value="i" :src="picture.image?? ''" contain eager></v-carousel-item>
                </template>
                <template v-else-if="dialog.product.picturesImageDetail" v-for="(picture, i) in dialog.product.picturesImageDetail" :key="'_pid_'+picture._id">
                  <v-carousel-item :value="i" :src="picture.image?? ''" contain eager></v-carousel-item>
                </template>
              </v-carousel>
            </v-col>
            <v-col cols="12" class="px-10">
              <p class="text-grey text-h6">{{ dialog.product.province }}</p>
            </v-col>
            <v-col cols="12" class="px-10">
              <p class="text-h4 text-capitalize text-primary font-weight-bold">{{ dialog.product.name }}</p>
            </v-col>
            <v-col cols="12" class="px-10">
              <p class="text-h3 text-green font-weight-bold my-1">{{ calculateExchangeRate(dialog.product.price) }}</p>
            </v-col>
            <v-col cols="12" class="px-10">
              <div v-html="dialog.product.description"></div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- DIALOG DETAILS PRODUCT -->

  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.dialog-adjudicated-product {
  .v-overlay__content {
    .v-card {
      position: relative;

      &::-webkit-scrollbar {
        display: none !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    }
  }
}
</style>