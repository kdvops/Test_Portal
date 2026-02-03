<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue, Watch } from 'vue-facing-decorator'
// IMPORT COMPONENTS
import PreviewAppCarouselComponent from '~/components/previews/carousel/index.vue';

// IMPORT INTERFACES
import type { CategoriesInterface } from '~/interfaces/categories.interface';
import type { PodcastEpisodesInterface } from '~/interfaces/podcast.interface';

// IMPORT GRAPHQL QUERY
import { GET_CATEGORY_BY_ID } from '~/graphql/query/categories.query';
import { GET_EPISODES_BY_SEASON_ID } from '~/graphql/query/podcast.query';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'preview-podcast-season-screen',
  components: {
    // COMPONENTS CUSTOM APP
    'preview-app-carousel-component': PreviewAppCarouselComponent,
  }
})
class PreviewPodcastSeasonScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // GET PARAM SEASON ID
  public seasonID = useRoute().params.seasonID;

  // GET PARAM SEASON ID
  public episodes: Array<PodcastEpisodesInterface> = [];

  // DIALOG EPISODE OPTIONS
  public dialog: { show: boolean; episode: PodcastEpisodesInterface } = {
    show: false,
    episode: {
      title: '',
      slug: '',
      description: '',
      link: '',
      cover: '',
      season: '',
      disabled: false,
    },
  }

  // SEASONS CATEGORIES
  public season: CategoriesInterface = {
    _id: '',
    name: '',
    slug: '',
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

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // SET CATEGORY BY ID
    this.setSeasonByID()

    // GET EPISODES BY SEASON ID
    this.setEpisodesBySeasonID()
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET SEASON BY ID
  public async setSeasonByID() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_CATEGORY_BY_ID,
        variables: { categoryId: this.seasonID },
        fetchPolicy: 'no-cache'
      })

      this.season = data.findCategoryById
    } catch (err) {
      // SHOW ERROR      
      this.$bus.$emit('handleError', err)
      return Promise.reject(err)
    }
  }

  // GET EPISODES BY SEASON ID
  public async setEpisodesBySeasonID() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_EPISODES_BY_SEASON_ID,
        variables: {
          seasonId: this.seasonID
        },
        fetchPolicy: 'no-cache'
      })

      // SET EPISODES
      this.episodes = data.findEpisodePodcastBySeason

    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit('handleError', err)
    }
  }

  // OPEN DIALOG EPISODE
  public openEpisodeToDialog(episode: PodcastEpisodesInterface) {
    // SET DIALOG VIDEO OPTIONS
    this.dialog.show = true
    this.dialog.episode = episode
  }

  // CLOSE DIALOG EPISODE
  public closeEpisodeToDialog() {
    // SET DIALOG VIDEO OPTIONS
    this.dialog.show = false
    this.dialog.episode = {
      title: '',
      slug: '',
      description: '',
      link: '',
      cover: '',
      season: '',
      disabled: false,
    }
  }

}

export default PreviewPodcastSeasonScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-container class="ma-0 pa-0" fluid>
    <v-row justify="center" align-content="center" no-gutters>
      <!-- BANNER CAROUSEL -->
      <v-col cols="12">
        <v-img width="100%" height="500" :src="season.pictures.banner?? season.pictures.bannerImageDetail?.image" cover />
      </v-col>

      <v-col cols="12" class="my-10 text-center">
        <h1 class="text-h5 text-primary font-weight-bold">
          {{ season.excerpt }}
        </h1>
        <p class="text-caption text-primary">
          {{ season.description }}
        </p>
      </v-col>
    </v-row>

    <!-- EPISODES -->
    <v-row class="mb-10" justify="center" no-gutters>
      <v-col cols="10">
        <v-row justify="center" no-gutters>
          <v-col cols="12" md="5" lg="4" v-for="(episode, i) in episodes">
            <v-card width="320" min-height="430" height="auto" max-height="auto" rounded="xl" class="pa-0 mx-auto my-5">
              <v-card-text class="pa-0 ma-0">
                <v-row class="my-0" align-content="center" justify="center" no-gutters>
                  <v-col cols="12">
                    <div class="podcast-card-image">
                      <v-img width="100%" height="150" class="rounded-xl" :src="episode.cover?? episode.coverImageDetail?.image" cover />
                    </div>
                  </v-col>
                  <v-col cols="12" class="podcast-card-info px-3 pt-3 text-left">
                    <div class="my-2 d-flex align-center">
                      <div class="ml-2 d-flex">
                        <p class="my-0 text-h4 font-weight-bold" style="color: #12539b"> {{ i +
                          1 }}.</p>
                        <p class="my-0 text-body-2 text-body-1 ml-2 text-primary">
                          {{ episode.title }}
                        </p>
                      </div>
                    </div>
                    <v-divider thickness="2" />
                    <div class="my-2 d-flex align-start description-card">
                      <v-icon class="podcast-card-icon" color="primary" size="20">
                        mdi-text
                      </v-icon>
                      <div class="ml-2">
                        <p class="my-0 text-caption font-weight-bold">{{ episode.description }}
                        </p>
                      </div>
                    </div>
                  </v-col>
                </v-row>
              </v-card-text>
              <v-card-actions class="py-0 my-0">
                <v-btn width="95%" @click="openEpisodeToDialog(episode)" position="absolute" variant="tonal"
                  class="text-caption my-0" rounded="xl" color="green" style="bottom: 10px; left: 8px">
                  Ver Episodio
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- DIALOG VIDEO -->
    <v-dialog v-model="dialog.show" max-width="800" height="80%" class="dialog-episode-video" persistent>
      <v-card width="100%" height="100%" rounded="xl">
        <v-card-title class="text-h6 font-weight-bold text-white py-5"
          style="background-color: var(--bsc-primary-color);">
          {{ dialog.episode.title }}
          <v-btn class="mt-5 mr-5" color="red" density="compact" position="absolute" location="end top"
            @click="closeEpisodeToDialog()" icon>
            <v-icon size="16" color="white">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-card-text class="pa-0">
          <iframe width="100%" height="600" :src="`https://www.youtube.com/embed/${dialog.episode.link}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>

          <div class="pt-5 pb-10 px-10">
            <h3>{{ dialog.episode.title }}</h3>
            <br>
            <h5>{{ dialog.episode.description }}</h5>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
    <!-- DIALOG VIDEO -->

  </v-container>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.menu-categories {
  margin-top: -25px;
}

.dialog-episode-video {
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