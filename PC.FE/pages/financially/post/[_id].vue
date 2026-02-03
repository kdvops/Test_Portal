<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from 'vue-facing-decorator'
// IMPORT INTERFACES
import type { FinanciallyInterface, TypePostFinancially } from '~/interfaces/financially.interface';

// IMPORT COMPONENTS
import AppSectionsComponent from '~/components/sections/index.vue';
import HeroImage from '~/components/optimized-image/HeroImage.vue';

// IMPORT GRAPHQL QUERY
import { GET_FINANCIALLY_BY_SLUG, GET_FINANCIALLY_BY_ID } from '~/graphql/financially.query';
import { isObjectId } from '~/utils/objectIdUtils';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'financially-post-details-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'app-sections-component': AppSectionsComponent,
    HeroImage,
  }
})
export default class FinanciallyPostDetailsScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE APP
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET PARAM POST ID
  public pageParam = useRoute().params._id;
  public postID = "";

  // FILTER POSTS
  public filter: { search: string; type: TypePostFinancially } = {
    search: '',
    type: 'all'
  }

  // POSTS
  public financially: FinanciallyInterface = {
    _id: '',
    title: '',
    slug: '',
    excerpt: '',
    subtitle: '',
    description: '',
    file: '',
    type: 'post::article',
    sections: [],
    banner: '',
    responsive: '',
    thumbnail: '',
    disabled: false,
    createdAt: '',
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    this.getFinanciallyIdBySlug().then((financiallyId) => {
      this.postID = financiallyId
      // GET POSTS
      this.getFinanciallyById()
    }, (error) => {
      this.$router.push('/')
    })       
  }

  ///////////////
  /// METHODS ///
  ///////////////
  private async getFinanciallyIdBySlug() : Promise<string>{
    var param = typeof this.pageParam == 'string'? this.pageParam: this.pageParam.join("")
    var isAnObjectId = isObjectId(param)

    try {
      // PAYLOAD BY ID
      const slug = { slug: this.pageParam }

      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: isAnObjectId? GET_FINANCIALLY_BY_ID:GET_FINANCIALLY_BY_SLUG,
        variables: isAnObjectId? { categoryId: this.pageParam }:{ slug: this.pageParam },
        fetchPolicy: 'no-cache'
      })

      const dta = data.findFinanciallyBySlug
      return Promise.resolve(dta._id)
    }
    catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError freom cid', err)
      return Promise.reject(err)
    }
  }

  // GET FINANCIALLY BY ID
  public async getFinanciallyById() {
    try {

      // GET POST ID
      const financiallyId = {
        financiallyId: this.postID
      }

      const { data } = await this.$apollo.query({
        query: GET_FINANCIALLY_BY_ID,
        variables: financiallyId,
        fetchPolicy: 'no-cache'
      })

      // SET FINANCIALLY
      const financially = data.findFinanciallyById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = financially.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : ''
        };
      });

      // SET FINANCIALLY TO VARIABLE
      this.financially = { ...financially, sections };

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // GET FORMAT DATE RANGE
  public getFormatDateRange(date: string): string {
    let dateFinal = '';
    dateFinal = `${this.$app.$moment(date).format('D')} ${this.$app.$moment(date).format('MMMM')} ${this.$app.$moment(date).format('YYYY')}`
    return dateFinal;
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="hero-banners-container" justify="space-between" no-gutters>
    <!-- BANNER -->
    <v-col cols="12" style="position: relative; z-index: 0;">
      <HeroImage
        :src="$vuetify.display.mdAndDown && financially.responsive ? financially.responsive : financially.banner"
        :alt="financially.title || 'Banner financiero'"
        :width="1920"
        :height="500"
        loading="eager"
      />
    </v-col>

    <v-col cols="2" class="d-none d-md-block">
      <v-card height="100%" color="#fbfaff">
        <v-row justify="center">
          <v-col cols="10">
            <v-text-field v-model="filter.search" @keyup.enter="$router.push('/financieramente')" variant="solo"
              rounded="xl" label="Buscar" density="compact" class="my-5">
              <template #append-inner>
                <v-icon>mdi-magnify</v-icon>
              </template>
            </v-text-field>

            <v-list bg-color="transparent" mandatory>
              <v-list-item @click="$router.push('/financieramente')"
                :style="filter.type === 'all' ? 'background: var(--bsc-primary-color); color: #ffffff' : 'background: transparent; color: grey'"
                rounded="xl" class="text-body-2 mt-5">
                <template v-slot:prepend>
                  <v-icon icon="mdi-home"></v-icon>
                </template>
                <v-list-item-title>Home</v-list-item-title>
              </v-list-item>

              <v-list-item @click="$router.push('/financieramente')"
                :style="filter.type === 'post::article' ? 'background: var(--bsc-primary-color); color: #ffffff' : 'background: transparent; color: grey'"
                rounded="xl" class="text-body-2 mt-5">
                <template v-slot:prepend>
                  <v-icon icon="mdi-book"></v-icon>
                </template>
                <v-list-item-title>Artículos</v-list-item-title>
              </v-list-item>

              <v-list-item @click="$router.push('/financieramente')"
                :style="filter.type === 'post::events' ? 'background: var(--bsc-primary-color); color: #ffffff' : 'background: transparent; color: grey'"
                rounded="xl" class="text-body-2 mt-5">
                <template v-slot:prepend>
                  <v-icon icon="mdi-file"></v-icon>
                </template>
                <v-list-item-title>Nota de prensa</v-list-item-title>
              </v-list-item>

              <v-list-item @click="$router.push('/financieramente')"
                :style="filter.type === 'post::release' ? 'background: var(--bsc-primary-color); color: #ffffff' : 'background: transparent; color: grey'"
                rounded="xl" class="text-body-2 mt-5">
                <template v-slot:prepend>
                  <v-icon icon="mdi-camera"></v-icon>
                </template>
                <v-list-item-title>Eventos</v-list-item-title>
              </v-list-item>
            </v-list>

            <!-- <v-btn class="text-body-2 my-15" color="green" rounded="xl" block>
              <v-icon>mdi-email</v-icon>
              <span class="ml-2">Suscribete</span>
            </v-btn> -->
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-col cols="12" md="10" lg="10" class="px-2 px-md-15 py-10">
      <v-row>
        <v-col cols="12" md="9" lg="9">
          <h1 class="text-h5 text-md-h3 text-center text-md-left text-primary font-weight-bold">
            {{ financially.subtitle }}
          </h1>
          <p class="text-caption text-md-h5 text-center text-md-left text-green font-weight-regular mt-5 pr-0 pr-md-15">
            {{ financially.description }}
          </p>
        </v-col>
        <v-col class="d-flex justify-space-between" cols="12">
          <p class="text-caption text-grey" style="width: 100px;">{{ getFormatDateRange(financially.createdAt) }}</p>
          <v-divider class="mt-2" length="100%" thickness="2" />
        </v-col>
        <v-col cols="12">
          <!-- SECTION COMPONENT -->
          <app-sections-component :sections="financially.sections" />
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>