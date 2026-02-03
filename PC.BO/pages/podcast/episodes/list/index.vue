<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationPodcast from "~/assets/animations/podcast-animation.json";

// IMPORT INTERFACE
import type { PodcastGroupEpisodesBySeasonInterface } from "~/interfaces/podcast.interface";

// IMPORT QUERIES
import { GET_EPISODES_GROUP_BY_SEASON } from "~/graphql/query/podcast.query";

// IMPORT MUTATIONS
import {
  CLONE_PODCAST_EPISODE,
  REMOVE_PODCAST_EPISODE,
  PUBLISH_PODCAST_EPISODE,
  DRAFT_PODCAST_EPISODE,
} from "~/graphql/mutations/podcast.mutation";

import { useGeneralActions } from "~/composables/generalActions";
import ItemActionComponent, {
  type ItemActionType,
} from "~/components/item-action/item-action.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "podcast-episodes-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    "item-action-component": ItemActionComponent,
  },
})
class PodcastEpisodesListScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

   // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // ANIMATIONS LOTTIE
  public animationPodcast: any = AnimationPodcast;

  // EPISODES BY SEASON
  public podcast: Array<PodcastGroupEpisodesBySeasonInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public generalStatusComposable: ReturnType<typeof useGeneralActions> =
    useGeneralActions();
  public async mounted() {
    this.generalStatusComposable.init(
      {
        CLONE_MUTATION: CLONE_PODCAST_EPISODE,
        REMOVE_MUTATION: REMOVE_PODCAST_EPISODE,
        PUBLISH_MUTATION: PUBLISH_PODCAST_EPISODE,
        DRAFT_MUTATION: DRAFT_PODCAST_EPISODE,
      },
      this.$apollo,
      this.$bus,
      this.$router
    );
  }

  public created() {
    this.setEpisodesGroupBySeasons();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET EPISODES BY SEASON
  public async setEpisodesGroupBySeasons() {
    try {
      // GET ALL CATEGORIES
      const { data } = await this.$apollo.query({
        query: GET_EPISODES_GROUP_BY_SEASON,
        fetchPolicy: "no-cache",
      });

      // SET EPISODES GROUP BY SEASON TO VARIABLE
      this.podcast = data.episodePodcastGroupBySeason;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO UPDATE EPISODE
  public goUpdate(episodeID: string) {
    this.$router.push(`/podcast/episodes/update/${episodeID}`);
  }

  // GO TO CREATE SLIDER
  public goCreate() {
    this.$router.push(`/podcast/episodes/create`);
  }

  public itemAction = async (itemAction: ItemActionType) => {
    const { action, itemID, status } = itemAction;
    switch (action) {
      case "delete":
        this.generalStatusComposable!.removeItem(
          { episodeId: itemID },
          this.setEpisodesGroupBySeasons
        );
        return true;
      case "copy":
        this.generalStatusComposable!.cloneItem(
          { episodeId: itemID },
          this.setEpisodesGroupBySeasons
        );
        return true;
      case "update":
        this.goUpdate(itemID);
        return true;
      case "status":
        this.generalStatusComposable!.switchStatus(
          { episodeId: itemID },
          status!,
          this.setEpisodesGroupBySeasons
        );
        return true;
    }
  };
}

export default PodcastEpisodesListScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="11">
      <client-only>
        <v-card
          width="100%"
          height="180px"
          rounded="xl"
          class="card-principal-container pa-0 ma-0"
          color="#12539b"
          flat
        >
          <v-card-text>
            <v-row align-content="center" justify="space-between">
              <v-col
                cols="6"
                class="card-principal-info-container text-left d-flex flex-column align-self-center"
              >
                <p
                  class="text-h5 text-uppercase text-white font-weight-bold ml-10"
                >
                  Lista de episodios por temporadas
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus episodios de podcast de una manera
                  mas sencilla!
                </p>
                <v-btn
                  @click="goCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-3 ml-9 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Episodio"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="350px"
                  height="350px"
                  :loop="true"
                  :animationData="animationPodcast"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5" justify="start" align-content="center">
    <v-col cols="3">
      <v-text-field
        class="ml-5"
        prepend-inner-icon="mdi-magnify"
        rounded="xl"
        density="compact"
        variant="solo"
        label="Buscar Temporada"
      />
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="start">
    <v-col cols="12" v-for="(pod, i) in podcast" :key="i">
      <div class="banner-podcast-category pl-2 pr-15">
        <v-avatar class="mr-5" size="75">
          <v-img
            width="100%"
            height="100%"
            :src="pod.season.pictures.banner"
            cover
          />
        </v-avatar>
        <h3 class="text-white text-uppercase">
          Capítulos de {{ pod.season.name }}
        </h3>
      </div>
      <v-slide-group class="pa-4" show-arrows>
        <v-slide-group-item
          v-for="(episode, x) in pod.episodes"
          :key="episode._id"
        >
          <v-card width="250" height="300" rounded="xl" class="pa-0 mx-4">
            <v-card-text class="pa-0">
              <v-row
                class="my-0"
                align-content="center"
                justify="center"
                no-gutters
              >
                <v-col cols="12">
                  <div class="podcast-card-image">
                    <v-img
                      width="100%"
                      height="100%"
                      class="rounded-xl"
                      :src="episode.cover ?? episode.coverImageDetail?.image"
                      cover
                    >
                      <item-action-component
                        :item="{ ...episode, name: x + 1 + '. capitulo' }"
                        :onItemAction="itemAction"
                        update
                        copy
                        status
                        delete
                        variant="flat"
                        color="white"
                        density="comfortable"
                        location="right top"
                        position="absolute"
                        class="mt-2 mr-2"
                      ></item-action-component>
                    </v-img>
                  </div>
                </v-col>
                <v-col cols="12" class="podcast-card-info pa-3 text-left">
                  <div class="my-2 d-flex align-center">
                    <div class="ml-2">
                      <p
                        class="my-0 text-h4 font-weight-bold"
                        style="color: #12539b"
                      >
                        {{ x + 1 }}. <span class="text-h6"> capitulo </span>
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon class="podcast-card-icon" color="#ffffff" size="20">
                      mdi-text
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Estatus</p>
                      <p
                        class="my-0 text-caption"
                        :style="
                          episode.disabled ? 'color: red' : 'color: green'
                        "
                      >
                        {{ !episode.disabled ? "Publicado" : "No Publicado" }}
                      </p>
                    </div>
                  </div>
                  <div class="my-2 d-flex align-center">
                    <v-icon class="podcast-card-icon" color="#ffffff" size="20">
                      mdi-microphone
                    </v-icon>
                    <div class="ml-2">
                      <p class="my-0 text-caption font-weight-bold">Código</p>
                      <p class="my-0 text-caption">
                        {{ episode.link }}
                      </p>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -110px;
  }

  .card-principal-animation {
    margin-top: -80px;
    margin-right: -20px;
  }
}

.podcast-card-image {
  width: 95%;
  height: 120px;
  margin: 5px auto 0 auto;
  border-radius: 20px;
  color: #ffffff;
  align-items: center;
  text-align: center;

  p {
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 30px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.podcast-card-info {
  background-color: #ffffff;
  color: #535353;

  .podcast-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .podcast-card-icon {
    width: 30px !important;
    height: 30px !important;
    border-radius: 100px;
    background-color: #12539b;
  }
}

.banner-podcast-category {
  height: 90px;
  border-radius: 100px;
  display: flex;
  justify-content: start;
  align-items: center;
  background-color: #12539b;
}
</style>
