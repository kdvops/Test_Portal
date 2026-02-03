<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue, Watch } from 'vue-facing-decorator'
// IMPORT COMPONENTS
import PreviewAppCarouselComponent from '~/components/previews/carousel/index.vue';
import PreviewAppProfitCardComponent from '~/components/previews/profits/index.vue';

// IMPORT INTERFACES
import type { CategoriesInterface } from '~/interfaces/categories.interface';
import type { ProfitInterface } from '~/interfaces/profits.interface';

// IMPORT GRAPHQL QUERY
import { GET_CATEGORY_BY_ID } from '~/graphql/query/categories.query';
import { GET_PROFITS_BY_CATEGORY } from '~/graphql/query/profits.query';

// IMPORT IMAGES
import BannerPromotion from '~/assets/backgrounds/Banner-promociones.jpg';
import BannerPoints from '~/assets/backgrounds/Banner-Puntos.jpg';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-profits-category-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'preview-app-carousel-component': PreviewAppCarouselComponent,
    'preview-app-profit-card-component': PreviewAppProfitCardComponent,
  }
})
class PreviewProfitsCategoryScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  public bannerPromotion = BannerPromotion;
  public bannerPoints = BannerPoints;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // CATEGORY
  public category: CategoriesInterface = {
    _id: '',
    slug: '',
    name: '',
    description: '',
    excerpt: '',
    disabled: false,
    target: '',
    pictures: {
      thumbnail: '',
      banner: '',
      responsive: ''
    }
  };

  // GET PARAM CATEGORY ID
  public categoryID = useRoute().params.categoryID;

  // PROFITS BY CATEGORY
  public profits: Array<ProfitInterface> = [];

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // GET CATEGORY BY ID
    this.getCategoryById()
    // GET PROFITS BY CATEGORY
    this.setProfitsByCategory()
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET CATEGORY BY ID
  public async getCategoryById() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORY_BY_ID,
        variables: {
          categoryId: this.categoryID
        },
        fetchPolicy: 'no-cache'
      })

      // SET PROFITS
      this.category = data.findCategoryById

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // SET PROFITS GROUP BY CATEGORY
  public async setProfitsByCategory() {
    try {
      // GET ALL PROFITS
      const { data } = await this.$apollo.query({
        query: GET_PROFITS_BY_CATEGORY,
        variables: {
          categoryId: this.categoryID
        },
        fetchPolicy: 'no-cache'
      })

      this.profits = data.findProfitsByCategory

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

}
export default PreviewProfitsCategoryScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="hero-banners-container" justify="center" align-content="center" no-gutters>
    <!-- BANNER CAROUSEL -->
    <v-col cols="12">
      <v-img width="100%" height="500" :src="category.pictures.banner?? category.pictures.bannerImageDetail?.image" cover />
    </v-col>

    <v-col cols="5">
      <h3 class="text-center px-5 mt-15 text-primary">
        {{ category.description }}
      </h3>
    </v-col>

    <v-col class="text-center" cols="12">
      <v-divider class="my-5 mx-auto border-opacity-100" thickness="5" color="green" length="60" />
    </v-col>
    <v-col class="mt-10" cols="12" md="10" lg="8">
      <v-row justify="center" align="stretch">
        <v-col cols="10" md="5" lg="4" v-for="profit in profits" :key="profit._id" class="d-flex">
          <preview-app-profit-card-component :options="{ profit }" />
        </v-col>
      </v-row>
    </v-col>
    <v-col class="mt-10" cols="12">
      <v-img width="100%" height="500" class="d-flex align-center" :src="bannerPromotion" cover>
        <v-card :width="$vuetify.display.mdAndDown ? '90%' : '60%'" class="card-promotions-container mx-auto pa-8"
          rounded="xl" color="#0961adc7">
          <img width="100" class="icon-large-card" src="~/assets/icons/shopping-bag-strong.svg">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6" lg="6">
                <h1 class="text-white font-weight-bold">
                  Promociones
                  <img width="24" class="ml-5" src="~/assets/icons/shopping-bag.svg">
                </h1>
                <p class="text-white text-caption font-weight-thin mt-5">Ahorro en tu experiencias de compras al pagar
                  con
                  <br> tus
                  <span class="font-weight-bold"> Tarjetas de Crédito del Banco Santa
                    Cruz.
                  </span>
                </p>
              </v-col>
              <v-col cols="12" md="6" lg="6" class="text-center">
                <v-btn width="250" height="40" to="/promociones" class="mt-7 text-body-2" variant="elevated" rounded="xl"
                  color="green">
                  Nuestras Promociones
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-img>
    </v-col>
    <v-col class="mt-10" cols="12">
      <v-img width="100%" height="500" class="d-flex align-center" :src="bannerPoints" cover>
        <v-card :width="$vuetify.display.mdAndDown ? '90%' : '60%'" class="card-promotions-container mx-auto pa-8"
          rounded="xl" color="#ffffffc7">
          <img width="120" class="icon-large-card circle" src="~/assets/icons/circle-absolute.svg">
          <v-card-text>
            <v-row>
              <v-col cols="12" md="7" lg="7">
                <h1 class="text-primary font-weight-bold">
                  Puntos Santa Cruz
                  <img width="36" class="ml-5" src="~/assets/icons/puntos-bsc.svg">
                </h1>
                <p class="text-primary text-caption font-weight-thin mt-5">
                  Tu satisfacción es lo más importante para nosotros, por eso <br> hemos creado para ti nuestro programa
                  de
                  recompensa Puntos <br> Santa Cruz, a través del cual acumulas puntos por cada consumo <br> que
                  realices
                  con tus
                  <span class="font-weight-bold"> Tarjetas de Crédito VISA.</span>
                </p>
              </v-col>
              <v-col cols="12" md="5" lg="5" class="text-center">
                <v-btn width="250" height="40" to="/productos/puntos" class="mt-12 text-body-2" variant="elevated"
                  rounded="xl" color="primary">
                  Nuestro Programa
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-img>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.card-categories {
  margin-top: -25px;
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