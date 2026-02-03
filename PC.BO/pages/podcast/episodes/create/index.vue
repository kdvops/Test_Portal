<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator"

// IMPORT INTERFACE
import type { PodcastEpisodesInterface, NewCoverEpisode } from "~/interfaces/podcast.interface"
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { CreatePodcastEpisodeRules } from "~/interfaces/rules.interface";

// MUTATIONS
import { CREATE_PODCAST_EPISODE } from '~/graphql/mutations/podcast.mutation'

// QUERIES
import { GET_CATEGORIES_BY_TARGET } from "~/graphql/query/categories.query";

// IMPORT SLUG UTIL
import { toSlug } from "~/utils/stringUtils";

import DetailedImageComponent from "~/components/detailed-image/index.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'podcast-episode-create-screen',
  components:{
    'detailed-image-component': DetailedImageComponent
  }
})
class PodcastEpisodeCreateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // PODCAST EPISODE IMAGE REF
  @Ref('episodeImage') episodeImage!: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

   // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // SEASON PODCAST EPISODE
  public seasons: Array<CategoriesInterface> = []

  // NEW PICTURE PODCAST EPISODE
  public newUploadCover: Array<NewCoverEpisode> = []

  // PODCAST EPISODE DEFAULT VALUES
  public episode: PodcastEpisodesInterface = {
    title: '',
    description: '',
    slug: '',
    season: '',
    link: '',
    cover: '',
    disabled: false
  }

  // RULES FORM
  public rules: CreatePodcastEpisodeRules = {
    title: [(v: string) => !!v || 'Este campo es requerido'],    
    slug: [
      (v: string) => !!v || 'El slug es requerido',
    ],
    description: [(v: string) => !!v || 'Este campo es requerido'],
    season: [(v: string) => !!v || 'Este campo es requerido'],
    link: [(v: string) => !!v || 'Este campo es requerido']
  }

  // VALID FORM
  public valid: boolean = false

  // LOADING
  public loading: boolean = false

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setCategories();

    // DEFINE PAGE META
definePageMeta({ layout: 'admin',  })
    
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET IMAGE FILE AND SET IN EPISODE
  public getPodcastEpisodeCover(file: File) {
    
    if (file) {
      if (file.type === 'image/jpeg' || file.type === 'image/jpg' || file.type === 'image/png') {
        if (file.size <= 19520000) {
          const profitImage = this.newUploadCover
          const fr = new FileReader()
          fr.onload = (el: any) => {
            profitImage.splice(0, 1, {
              img: el.target.result,
              filetype: file.type.split('/')[1]
            })
          }
          fr.readAsDataURL(file)
        } else {
          this.$bus.$emit('handleError', 'El peso máximo es de 2 MB')
        }
      } else {
        this.$bus.$emit('handleError', 'Solo se aceptan formato .png y .jpeg')
      }
    }
  }

  // OPEN UPLOAD IMAGE
  public selectImage() {
    const imageRefs: any = this.episodeImage

    // REF IMAGE RESET
    imageRefs.value = null;

    // REF ON CLICK
    imageRefs.click()
  }

  // SET CATEGORIES
  public async setCategories() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: 'category::podcast',
        },
        fetchPolicy: 'no-cache'
      })

      // SET CATEGORIES TO VARIABLE
      this.seasons = data.findCategoryByTarget

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // CREATE EPISODE PODCAST
  public async createPodcastEpisode() {
    // SET LOADING TRUE
    this.loading = true
    try {

      // PAYLOAD LOGIN DTO
      const createEpisodePodcastDto = {
        createEpisodePodcastDto: {
          ...this.episode,
          status: 'publish'
        }
      }

      // CREATE EPISODE PODCAST MUTATION
      await this.$apollo.mutate({
        mutation: CREATE_PODCAST_EPISODE,
        variables: createEpisodePodcastDto
      })

      // SET LOADING FALSE
      this.loading = false

      // REDIRECT TO DASHBOARD
      this.$router.push('/podcast/episodes/list')

      // SHOW SNACKBAR
      this.$bus.$emit('showSnackbar', {
        text: 'Beneficios creados correctamente!',
        color: 'success',
        timeout: 6000
      })

    } catch (err) {
      // SET LOADING FALSE
      this.loading = false

      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // CREATE EPISODE PODCAST DRAFT
  public async createPodcastEpisodeDraft() {
    // SET LOADING TRUE
    this.loading = true
    try {

      // PAYLOAD LOGIN DTO
      const createEpisodePodcastDto = {
        createEpisodePodcastDto: {
          ...this.episode,
          status: 'draft'
        }
      }

      // CREATE EPISODE PODCAST MUTATION
      const { data } = await this.$apollo.mutate({
        mutation: CREATE_PODCAST_EPISODE,
        variables: createEpisodePodcastDto
      })

      // SET LOADING FALSE
      this.loading = false

      return data;
    } catch (err) {
      // SET LOADING FALSE
      this.loading = false

      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }
     
  public updateSlug(){
    this.episode.slug = toSlug(this.episode.title.toLowerCase())
  }

  public async goPreview() {
    // FIRST CREATE CATEGORY STATUS DRAFT
    const episode = await this.createPodcastEpisodeDraft();

    // GO EDIT AFTER CREATE CATEGORY
    this.$router.push(`/podcast/episodes/update/${episode.createPodcastEpisode._id}`)

    // GO PREVIEW BEFORE CREATE CATEGORY
    const route = this.$router.resolve({ path: `/previews/podcast/${episode.createPodcastEpisode.season}` });
    window.open(route.href, '_blank');
  }

  // SAVE ITEM
  public async saveEpisode() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const episode = await this.createPodcastEpisodeDraft();
  
    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/podcast/episodes/update/${episode.createPodcastEpisode._id}`)
  }
}
export default PodcastEpisodeCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="pa-5" justify="center">
    <!-- COVER EPISODE -->
    <v-col cols="6">
      <!-- HOVER IMAGE -->
      <detailed-image-component color="#00a44f" rounded="xl" height="300" v-model="episode.coverImageDetail" :legacy-image="episode.cover" text="Cargar Portada"></detailed-image-component>
    </v-col>
    <v-col cols="6">
      <v-card v-if="episode.link" color="#12539b" rounded="xl" height="300">
        <iframe width="100%" height="100%" :src="`https://www.youtube.com/embed/${episode.link}`"
          title="El Junte Financiero - Primera Temporada Episodio #04 - Invierte ¿Cómo y en qué?" frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </v-card>
      <v-card v-else="episode.link" color="#12539b" rounded="xl" height="300">
        <v-card-text>
          <div class="card-info-container px-15 d-flex justify-center">
            <p class="text-h6 text-uppercase">Previsualización</p>
            <p class="text-caption">Debe llenar el campo con su código de YouTube <br> y podrá ver el video</p>
          </div>
        </v-card-text>
      </v-card>
    </v-col>

    <!-- FORM PROMOTION -->
    <v-col cols="12" class="pb-15 mb-15">
      <v-row align-content="center" justify="center">
        <v-col class="banner-create-card mb-5 px-5 mt-5 mx-auto text-center align-center d-flex" cols="12">
          <p class="text-weight-bold mr-10">
            Recuerda llenar el código de Youtube correctamente
          </p>
          <img class="rounded-xl" src="~/assets/backgrounds/youtube-banner.png">
        </v-col>
        <v-col cols="10">
          <v-form v-model="valid">
            <v-row no-gutters>
              <v-col cols="6">
                <v-text-field v-model="episode.title" :rules="rules.title" class="pr-2" label="Título"
                  prepend-inner-icon="mdi-text" density="compact" variant="solo" rounded="xl" required @change="updateSlug"/>
              </v-col>
              <v-col cols="6">
                <v-text-field v-model="episode.slug" :rules="rules.slug" class="pr-2" label="Slug"
                  prepend-inner-icon="mdi-text" density="compact" variant="solo" rounded="xl" required/>
              </v-col>
              <v-col cols="12">
                <v-text-field v-model="episode.link" :rules="rules.link" class="pl-2" label="Código de YouTube"
                  prepend-inner-icon="mdi-barcode" density="compact" variant="solo" rounded="xl" required />
              </v-col>
              <v-col cols="12">
                <v-select v-model="episode.season" :rules="rules.season" :items="seasons" item-title="name"
                  item-value="_id" label="Temporada" prepend-inner-icon="mdi-apps" density="compact" variant="solo"
                  rounded="xl" required />
              </v-col>
              <v-col cols="12">
                <v-textarea v-model="episode.description" :rules="rules.description" label="Descripción"
                  prepend-inner-icon="mdi-text" density="compact" variant="solo" rounded="xl" required />
              </v-col>
              <v-col class="py-0 mx-auto text-center d-flex justify-center" cols="12">
                <v-switch color="green" class="mx-5" density="compact" v-model="episode.disabled" label="Deshabilitar"
                  inset />
              </v-col>
            </v-row>
          </v-form>
        </v-col>
      </v-row>
    </v-col>

     <!-- NEW BUTTONS SAVE ITEMS -->
     <v-bottom-navigation bg-color="#12539b">
        <v-btn @click="createPodcastEpisode()" :disabled="!valid || !episode.coverImageDetail?.image" :loading="loading">
          <v-icon>
            mdi-upload
          </v-icon>
          Crear
        </v-btn>
        <v-btn @click="saveEpisode()" :disabled="!valid || !episode.coverImageDetail?.image" :loading="loading">
          <v-icon>
            mdi-content-save
          </v-icon>
          Guardar
        </v-btn>
        <v-btn @click="goPreview()" :disabled="!valid">
          <v-icon>
            mdi-eye
          </v-icon>
          Ver Vista Previa
        </v-btn>
      </v-bottom-navigation>
      <!-- NEW BUTTONS SAVE ITEMS -->

    <!-- PROMOTION IMAGE -->
    <v-file-input ref="episodeImage" class="d-none" accept=".jpg, .jpeg, .png"
      @update:model-value="getPodcastEpisodeCover" />
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}

.banner-create-card {
  height: 80px;
  background-color: #12539b;
  color: #ffffff;
  text-align: center;
  justify-content: center;
  box-shadow: 0px 0px 10px 0px #0000001a;
}

.card-info-container {
  height: 265px;
  align-content: center;
  flex-wrap: wrap;

  p {
    width: 100%;
  }
}
</style>