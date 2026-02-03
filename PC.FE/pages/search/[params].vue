<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue, Watch } from 'vue-facing-decorator'

// IMPORT COMPONENTS
import AppCarouselComponent from '~/components/carousel/index.vue';
import appPromotionCardComponent from '~/components/promotion/index.vue';
import AppFinanciallyCardComponent from '~/components/financially/index.vue';

// IMPORT GRAPHQL QUERY
import { GET_SLIDERS_BY_TARGET } from '~/graphql/slider.query';
import { GET_SEARCH_BY_PARAMS } from '~/graphql/search.query';

// IMPORT INTERFACE
import type { SliderInterface, SliderOptions } from '~/interfaces/slider.interface';
import type { AdjudicatedPictureInterface, ProductAdjudicatedInterface } from '~/interfaces/adjudicated.interface';
import type { ImageDetailInterface } from '~/interfaces/detailed-image.interface';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'search-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-carousel-component': AppCarouselComponent,
    'app-promotion-card-component': appPromotionCardComponent,
    'app-financially-card-component': AppFinanciallyCardComponent
  }
})
export default class SearchScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // ANIMATIONS LOTTIE
  // public animationEmpty: any = AnimationEmpty;

  // GET PARAMS
  public params = useRoute().params.params;

  // DEFAULT ITEMS FIND 
  public items: Array<any> = []

  // SLIDERS
  public sliders: Array<SliderInterface> = [];

  // SET SLIDERS
  public optionSliders: SliderOptions = {
    show: true,
    position: 0,
    sliders: []
  }
  ///////////////
  /// METHODS ///
  ///////////////

  public created() {
    // GET SLIDERS
    this.getSliders()

    // SET ITEMS BY PARAMS
    this.setItemsSearch()
  }

  // GET SEARCH ITEMS
  public async setItemsSearch() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_SEARCH_BY_PARAMS,
        variables: { search: this.params },
        fetchPolicy: 'no-cache'
      })

      // SET ITEMS
      this.items = data.search

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
          target: 'banner::home'
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

  public getImageCover(product: ProductAdjudicatedInterface) {
    const pictures = product.pictures.length > 0? product.pictures:product.picturesImageDetail    
    const findPictureCover = pictures.find((picture: AdjudicatedPictureInterface|ImageDetailInterface) => {
      picture.isCover
    })

    return findPictureCover?.image || pictures[0].image
  }

  // GET PRICE PRODUCT 
  public calculateExchangeRate(price: number): string {
    return price.toLocaleString("es-DO", {
      style: "currency",
      currency: "DOP",
    })
  }

  public generateLink(item: any): string {
    let defaultLink = ''

    if (item.data.category && item.collection === 'products') {
      // SPLIT TARGET CATEGORY ITEM
      const link = `/${item.data.category.target.split('::')[1]}/${item.data.category.parentTarget.split('::')[1]}/${item.data.category.slug ?? item.data.category._id}/item/${item.data.slug ?? item.data._id}`
      defaultLink = link
    } else if (item.data.category && item.collection === 'insurances') {
      const link = `/seguros/${item.data.category.slug ?? item.data.category._id}/${item.data.slug ?? item.data._id}`
      defaultLink = link
    } else if (item.data.category && item.collection === 'enterprises') {
      const link = `/empresa/${item.data.category.slug ?? item.data.category._id}/${item.data.slug ?? item.data._id}`
      defaultLink = link
    } else if (item.collection === 'podcasts') {
      const link = `/podcast/season/${item.data.season.slug ?? item.data.season._id}`
      defaultLink = link
    } else if (item.collection === 'profits') {
      const link = `/beneficios/categoria/${item.data.category.slug ?? item.data.category._id}`
      defaultLink = link
    } else if (item.data.category && item.collection === 'regulatories') {
      const link = `/sobre-nosotros/categoria/${item.data.category.slug ?? item.data.category._id}/${item.data.slug ?? item.data._id}`
      defaultLink = link
    } else if (item.data.category && item.collection === 'businesses') {
      const link = `/negocio/${item.data.category.slug ?? item.data.category._id}/${item.data.slug ?? item.data._id}`
      defaultLink = link
    }

    return defaultLink
  }

  public get itemsOrderArray() {
    let grouped: any = {};
    const items: Array<any> = this.items;

    items.map((item: any) => {
      const collectionName = item.collection;
      if (!grouped[collectionName]) {
        grouped[collectionName] = [];
      }
      grouped[collectionName].push({ ...item });
    })

    return grouped;
  }

  @Watch('this.params', { deep: true })
  public watchParamsSearch() {
    this.setItemsSearch();
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" align-content="center" no-gutters>
    <!-- <v-col cols="12">
      <!-- BANNER CAROUSEL -->
    <!-- <app-carousel-component :options="optionSliders" /> -->
    <!-- </v-col> -->
    <v-col cols="11" md="11" lg="11" class="mt-10">
      <h1 class="font-weight-regular text-center">
        <span class="font-weight-bold">Búsqueda - </span> {{ params }}
      </h1>
    </v-col>
    <v-col cols="10" md="10" lg="10" class="my-10">
      <v-row>

        <!-- COLLECTIONS PRODUCTS -->
        <template v-if="itemsOrderArray.products">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Productos
              </h1>
            </div>
          </v-col>
          <template v-for="(product) in itemsOrderArray.products" :key="product._id">
            <v-col cols="3">
              <v-card class="mx-2 my-2 pa-0" rounded="xl">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-img width="100%" :height="$vuetify.display.mdAndDown ? 80 : 100"
                      :src="$vuetify.display.mdAndDown && (product.data.responsive || product.data.responsiveImageDetail) ? product.data.responsive?? product.data.responsiveImageDetail?.image : product.data.banner?? product.data.bannerImageDetail?.image"
                      :alt="$vuetify.display.mdAndDown && product.data.responsiveImageDetail? product.data.responsiveImageDetail?.altText?? '' : product.data.bannerImageDetail?.altText?? ''"
                      position="center"
                      cover />
                  </v-col>
                  <v-col class="align-content-center" cols="12">
                    <div class="info-category-card-large-container">
                      <p class="px-3 py-2 text-h5 font-weight-bold text-primary">
                        {{ product.data.name }}
                      </p>
                      <!-- <p class="px-3 pb-2 text-caption category-card-description">
                        {{ product.data.excerpt }}
                      </p> -->
                      <v-btn width="140" :to="generateLink(product)" color="primary"
                        class="mx-3 mb-3 text-caption text-uppercase" rounded="xl" style="">
                        Mas Información
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS INSURANCES -->
        <template v-if="itemsOrderArray.insurances">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Seguros
              </h1>
            </div>
          </v-col>
          <template v-for="(insurance) in itemsOrderArray.insurances" :key="insurance._id">
            <v-col cols="3">
              <v-card class="mx-2 my-2 pa-0" rounded="xl">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-img width="100%" :height="$vuetify.display.mdAndDown ? 80 : 100"
                      :src="$vuetify.display.mdAndDown && (insurance.data.responsive || insurance.data.responsiveImageDetail) ? insurance.data.responsive?? insurance.data.responsiveImageDetail?.image : insurance.data.banner?? insurance.data.bannerImageDetail?.image"
                      :alt="$vuetify.display.mdAndDown && insurance.data.responsiveImageDetail? insurance.data.responsiveImageDetail?.altText?? '' : insurance.data.bannerImageDetail?.altText?? ''"
                      position="center" cover />
                  </v-col>
                  <v-col class="align-content-center" cols="12">
                    <div class="info-category-card-large-container">
                      <p class="px-3 py-2 text-h5 font-weight-bold text-primary">
                        {{ insurance.data.title }}
                      </p>
                      <!-- <p class="px-3 pb-2 text-caption category-card-description">
                        {{ insurance.data.excerpt }}
                      </p> -->
                      <v-btn width="140" :to="generateLink(insurance)" color="primary"
                        class="mx-3 mb-3 text-caption text-uppercase" rounded="xl" style="">
                        Mas Información
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS BUSINESS -->
        <template v-if="itemsOrderArray.businesses">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Mi Negocio
              </h1>
            </div>
          </v-col>
          <template v-for="(business) in itemsOrderArray.businesses" :key="business._id">
            <v-col cols="3">
              <v-card class="mx-2 my-2 pa-0" rounded="xl">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-img width="100%" :height="$vuetify.display.mdAndDown ? 80 : 100"
                      :src="$vuetify.display.mdAndDown && (business.data.responsive || business.data.responsiveImageDetail) ? business.data.responsive?? business.data.responsiveImageDetail?.image : business.data.banner?? business.data.bannerImageDetail?.image"
                      :alt="$vuetify.display.mdAndDown && business.data.responsiveImageDetail? business.data.responsiveImageDetail?.altText?? '' : business.data.bannerImageDetail?.altText?? ''"
                      position="center"
                      cover />
                  </v-col>
                  <v-col class="align-content-center" cols="12">
                    <div class="info-category-card-large-container">
                      <p class="px-3 py-2 text-h5 font-weight-bold text-primary">
                        {{ business.data.title }}
                      </p>
                      <!-- <p class="px-3 pb-2 text-caption category-card-description">
                        {{ business.data.excerpt }}
                      </p> -->
                      <v-btn width="140" :to="generateLink(business)" color="primary"
                        class="mx-3 mb-3 text-caption text-uppercase" rounded="xl" style="">
                        Mas Información
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS ENTERPRISES -->
        <template v-if="itemsOrderArray.enterprises">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Empresa
              </h1>
            </div>
          </v-col>
          <template v-for="(enterprise) in itemsOrderArray.enterprises" :key="enterprise._id">
            <v-col cols="3">
              <v-card class="mx-2 my-2 pa-0" rounded="xl">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-img width="100%" :height="$vuetify.display.mdAndDown ? 80 : 100"
                      :src="$vuetify.display.mdAndDown && (enterprise.data.responsive || enterprise.data.responsiveImageDetail) ? enterprise.data.responsive?? enterprise.data.responsiveImageDetail?.image : enterprise.data.banner?? enterprise.data.bannerImageDetail?.image"
                      :alt="$vuetify.display.mdAndDown && enterprise.data.responsiveImageDetail? enterprise.data.responsiveImageDetail?.altText?? '' : enterprise.data.bannerImageDetail?.altText?? ''"
                      position="center" cover />
                  </v-col>
                  <v-col class="align-content-center" cols="12">
                    <div class="info-category-card-large-container">
                      <p class="px-3 py-2 text-h5 font-weight-bold text-primary">
                        {{ enterprise.data.title }}
                      </p>
                      <!-- <p class="px-3 pb-2 text-caption category-card-description">
                        {{ insurance.data.excerpt }}
                      </p> -->
                      <v-btn width="140" :to="generateLink(enterprise)" color="primary"
                        class="mx-3 mb-3 text-caption text-uppercase" rounded="xl" style="">
                        Mas Información
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS REGULATORY -->
        <template v-if="itemsOrderArray.regulatories">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Sobre Nosotros
              </h1>
            </div>
          </v-col>
          <template v-for="(regulatory) in itemsOrderArray.regulatories" :key="regulatory._id">
            <v-col cols="3">
              <v-card class="mx-2 my-2 pa-0" rounded="xl">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-img width="100%" :height="$vuetify.display.mdAndDown ? 80 : 100"
                      :src="$vuetify.display.mdAndDown && (regulatory.data.responsive || regulatory.data.responsiveImageDetail) ? regulatory.data.responsive?? regulatory.data.responsiveImageDetail?.image : regulatory.data.banner?? regulatory.data.bannerImageDetail?.image"
                      :alt="$vuetify.display.mdAndDown && regulatory.data.responsiveImageDetail? regulatory.data.responsiveImageDetail?.altText?? '' : regulatory.data.bannerImageDetail?.altText?? ''"
                      position="center" cover />
                  </v-col>
                  <v-col class="align-content-center" cols="12">
                    <div class="info-category-card-large-container">
                      <p class="px-3 py-2 text-h6 font-weight-bold text-primary">
                        {{ regulatory.data.title }}
                      </p>
                      <!-- <p class="px-3 pb-2 text-caption category-card-description">
                        {{ insurance.data.excerpt }}
                      </p> -->
                      <v-btn width="140" :to="generateLink(regulatory)" color="primary"
                        class="mx-3 mb-3 text-caption text-uppercase" rounded="xl" style="">
                        Mas Información
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS PROMOTIONS -->
        <template v-if="itemsOrderArray.promotions">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Promociones
              </h1>
            </div>
          </v-col>
          <template v-for="(promotion) in itemsOrderArray.promotions" :key="promotion._id">
            <v-col cols="3">
              <app-promotion-card-component :promotion="promotion.data" />
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS PODCAST -->
        <template v-if="itemsOrderArray.podcasts">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Podcast
              </h1>
            </div>
          </v-col>
          <template v-for="(episode) in itemsOrderArray.podcasts" :key="episode._id">
            <v-col cols="3">
              <v-card width="320" min-height="430" height="auto" max-height="auto" rounded="xl"
                class="pa-0 mx-auto my-5">
                <v-card-text class="pa-0 ma-0">
                  <v-row class="my-0" align-content="center" justify="center" no-gutters>
                    <v-col cols="12">
                      <div class="podcast-card-image">
                        <v-img width="100%" height="150" class="rounded-xl" :src="episode.data.cover?? episode.data.coverImageDetail?.image" :alt="episode.data.coverImageDetail?.altText?? ''" cover />
                      </div>
                    </v-col>
                    <v-col cols="12" class="podcast-card-info px-3 pt-3 text-left">
                      <div class="my-2 d-flex align-center">
                        <div class="ml-2 d-flex">
                          <p class="my-0 text-h6 text-body-1 ml-2 text-primary">
                            {{ episode.data.title }}
                          </p>
                        </div>
                      </div>
                      <v-divider thickness="2" />
                      <div class="my-2 d-flex align-start description-card">
                        <v-icon class="podcast-card-icon" color="primary" size="20">
                          mdi-text
                        </v-icon>
                        <div class="ml-2">
                          <p class="my-0 text-caption font-weight-bold">{{ episode.data.description }}</p>
                        </div>
                      </div>
                    </v-col>
                  </v-row>
                </v-card-text>
                <v-card-actions class="py-0 my-0">
                  <v-btn width="95%" :to="generateLink(episode)" position="absolute" variant="tonal"
                    class="text-caption my-0" rounded="xl" color="green" style="bottom: 10px; left: 8px">
                    Ver Episodio
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS FINANCIALLY -->
        <template v-if="itemsOrderArray.financiallies">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Financieramente
              </h1>
            </div>
          </v-col>
          <template v-for="(financially) in itemsOrderArray.financiallies" :key="financially._id">
            <v-col cols="3">
              <app-financially-card-component :financially="financially" />
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS PROFITS -->
        <template v-if="itemsOrderArray.profits">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Beneficios
              </h1>
            </div>
          </v-col>
          <template v-for="(profit) in itemsOrderArray.profits" :key="profit._id">
            <v-col cols="3">
              <v-card class="mx-2 my-2 pa-0" rounded="xl">
                <v-row no-gutters>
                  <v-col cols="12">
                    <v-img width="100%" :height="$vuetify.display.mdAndDown ? 80 : 100"
                      :src="$vuetify.display.mdAndDown && (profit.data.category.pictures.responsive || profit.data.category.pictures.responsiveImageDetail) ? profit.data.category.pictures.responsive?? profit.data.category.pictures.responsiveImageDetail?.image : profit.data.category.pictures.banner?? profit.data.category.pictures.bannerImageDetail?.image"
                      :alt="$vuetify.display.mdAndDown && profit.data.category.pictures.responsiveImageDetail? profit.data.category.pictures.responsiveImageDetail?.altText?? '' : profit.data.category.pictures.bannerImageDetail?.altText?? ''"
                      position="center" cover />
                  </v-col>
                  <v-col class="align-content-center" cols="12">
                    <div class="info-category-card-large-container">
                      <p class="px-3 py-2 text-h5 font-weight-bold text-primary">
                        {{ profit.data.name }}
                      </p>
                      <!-- <p class="px-3 pb-2 text-caption category-card-description">
                        {{ insurance.data.excerpt }}
                      </p> -->
                      <v-btn width="140" :to="generateLink(profit)" color="primary"
                        class="mx-3 mb-3 text-caption text-uppercase" rounded="xl" style="">
                        Mas Información
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
            </v-col>
          </template>
        </template>

        <!-- COLLECTIONS ADJUDICATED -->
        <template v-if="itemsOrderArray.adjudicateds">
          <v-col cols="12">
            <div class="text-center py-5 rounded-xl" style="background-color: #12539b; position: relative">
              <h1 class="text-h5 text-white">
                Bienes Adjudicados
              </h1>
            </div>
          </v-col>
          <template v-for="(adjudicated) in itemsOrderArray.adjudicateds" :key="adjudicated._id">
            <v-col cols="12" md="5" lg="4" v-if="adjudicated.data.status !== 'unavailable'">
              <v-card min-width="auto" width="auto" max-width="350" height="450" color="#faf9ff" elevation="5"
                style="border-bottom: #00a44f solid 5px">
                <v-img width="100%" height="180" color="#ffffff" 
                  :src="getImageCover(adjudicated.data)"
                  :alt="adjudicated.data.picturesImageDetail?.find((pid:ImageDetailInterface) => pid.isCover)?.altText?? ''"
                  cover></v-img>
                <v-row class="px-5 pt-2 pb-5" no-gutters>
                  <v-col cols="12">
                    <p class="text-grey text-caption">{{ adjudicated.data.province }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p class="text-h5 text-capitalize text-primary font-weight-bold">{{ adjudicated.data.name }}</p>
                  </v-col>
                  <v-col cols="12">
                    <p class="text-h4 text-green font-weight-bold my-1">{{ calculateExchangeRate(adjudicated.data.price)
                    }}
                    </p>
                  </v-col>
                  <v-col cols="12">
                    <p class="text-grey text-caption mt-2">{{ adjudicated.excerpt }}
                    </p>
                  </v-col>
                </v-row>
                <div class="position-absolute d-flex w-100" style="bottom: 5px">
                  <v-col cols="6" class="pl-5 mt-4">
                    <v-btn width="100%" height="40" to="/adjudicados" color="green" rounded="xl"
                      class="px-2 text-caption text-uppercase">
                      Ver más
                    </v-btn>
                  </v-col>
                </div>
              </v-card>
            </v-col>
          </template>
        </template>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
/* Estilos para página de búsqueda */
</style>