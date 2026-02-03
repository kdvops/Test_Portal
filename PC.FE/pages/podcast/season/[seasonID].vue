<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  seoManual: true,
});
import { Vue, Watch } from "vue-facing-decorator";
// IMPORT COMPONENTS
import AppCarouselComponent from "~/components/carousel/index.vue";
import AppMenuComponent from "~/components/menu/index.vue";
import HeroImage from "~/components/optimized-image/HeroImage.vue";
import CardImage from "~/components/optimized-image/CardImage.vue";

// IMPORT INTERFACES
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { PodcastEpisodesInterface } from "~/interfaces/podcast.interface";
import type { OptionsMenuInterface } from "~/interfaces/menu.interface";

// IMPORT GRAPHQL QUERY
import {
  GET_CATEGORIES_BY_TARGET,
  GET_CATEGORY_BY_SLUG,
  GET_CATEGORY_BY_ID,
} from "~/graphql/categories.query";
import { GET_EPISODES_BY_SEASON_ID } from "~/graphql/podcast.query";
import { isObjectId } from "~/utils/objectIdUtils";

import type { ApolloClient } from "@apollo/client/core";
import {
  normalizeParam,
  registerSeoRefs,
  applyEntitySeoForKey,
  makeStringFieldPicker,
  makeIdFieldPicker,
} from "~/utils/seoUtil";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "podcast-season-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-carousel-component": AppCarouselComponent,
    "app-menu-component": AppMenuComponent,
    "hero-image": HeroImage,
    CardImage,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as PodcastSeasonScreen;
    const route = useRoute();
    const nuxtApp = useNuxtApp();
    const { client } = useApolloClient();

    const titleRef = ref<string>("");
    const descRef = ref<string>("");
    registerSeoRefs(nuxtApp, {
      titleRef,
      descRef,
      type: "website",
      priority: 10,
    });

    const selectEntity = (data: any, ctx: { isId: boolean }) =>
      (ctx.isId
        ? data.findCategoryById
        : data.findCategoryBySlug) as CategoriesInterface;

    const queries = {
      byIdQuery: GET_CATEGORY_BY_ID,
      bySlugQuery: GET_CATEGORY_BY_SLUG,
      varNames: { id: "categoryId", slug: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<CategoriesInterface>("name");
    const pickDesc = makeStringFieldPicker<CategoriesInterface>("description");
    const pickId = makeIdFieldPicker<CategoriesInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.pageParam === "string"
          ? vm.pageParam
          : normalizeParam(vm.pageParam as any);

      await applyEntitySeoForKey<CategoriesInterface>({
        client: client as ApolloClient<any>,
        currentRoute: route.path,
        key,
        currentKey,
        queries,
        pickTitle,
        pickDescription: pickDesc,
        titleRef,
        descRef,
      });

      vm.pageParam = key;
    };

    await loadForKey(normalizeParam(route.params.seasonID as any));
    watch(
      () => route.params.seasonID,
      async (next: any) => {
        await loadForKey(normalizeParam(next as any));
      }
    );
  },
})
class PodcastSeasonScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // SEARCH
  public search = "";

  // SEARCHED EPISODES
  public searchedEpisodes: Array<PodcastEpisodesInterface> = [];

  // APOLLO INSTANCE
  public override $apollo: any;

  // ROUTE PARAMS
  public pageParam = useRoute().params.seasonID;
  public seasonID = "";

  // EPISODES
  public episodes: Array<PodcastEpisodesInterface> = [];

  // SELECTED EPISODE (Video principal)
  public selectedEpisode: PodcastEpisodesInterface | null = null;

  // SEASONS
  public seasons: Array<CategoriesInterface> = [];
  public season: CategoriesInterface = {
    _id: "",
    name: "",
    slug: "",
    description: "",
    excerpt: "",
    disabled: false,
    target: "",
    pictures: {
      thumbnail: "",
      banner: "",
      responsive: "",
    },
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    this.setSeasonByID().then(
      (data) => {
        this.season = data;
        this.seasonID = this.season._id!;

        this.setSeasonsByTarget();
        this.setEpisodesBySeasonID();
      },
      (error) => {
        this.$router.push("/");
      }
    );
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET SEASON BY ID
  public async setSeasonByID(): Promise<CategoriesInterface> {
    const param =
      typeof this.pageParam === "string"
        ? this.pageParam
        : this.pageParam.join("");
    const isAnObjectId = isObjectId(param);

    try {
      const { data } = await this.$apollo.query({
        query: isAnObjectId ? GET_CATEGORY_BY_ID : GET_CATEGORY_BY_SLUG,
        variables: isAnObjectId
          ? { categoryId: this.pageParam }
          : { slug: this.pageParam },
        fetchPolicy: "no-cache",
      });

      return Promise.resolve(
        isAnObjectId ? data.findCategoryById : data.findCategoryBySlug
      );
    } catch (err) {
      this.$bus.$emit("handleError", err);
      return Promise.reject(err);
    }
  }

  // GET SEASONS PODCAST
  public async setSeasonsByTarget() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: {
          target: "category::podcast",
        },
        fetchPolicy: "no-cache",
      });

      this.seasons = data.findCategoryByTarget.filter(
        (category: CategoriesInterface) => category.disabled === false
      );
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // GET EPISODES BY SEASON ID
  public async setEpisodesBySeasonID() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_EPISODES_BY_SEASON_ID,
        variables: {
          seasonId: this.seasonID,
        },
        fetchPolicy: "no-cache",
      });

      this.episodes = data.findEpisodePodcastBySeason;

      // SET FIRST EPISODE AS SELECTED BY DEFAULT
      if (this.episodes.length > 0) {
        this.selectedEpisode = this.orderSearchedEpisodesByCreatedAt[0];
      }
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // CHANGE SEASON
  public changeSeason(seasonSlug: string) {
    this.$router.push(`/podcast/season/${seasonSlug}`);
  }

  // SELECT EPISODE AND SCROLL TO VIDEO
  public selectEpisode(episode: PodcastEpisodesInterface) {
    this.selectedEpisode = episode;

    // SCROLL TO VIDEO IFRAME
    this.$nextTick(() => {
      const videoElement = document.getElementById("video-player");
      if (videoElement) {
        videoElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  // HERO IMAGE EVENT HANDLERS
  public onHeroImageLoad(event: Event) {
    // Hero image cargada correctamente
  }

  public onHeroImageError(event: Event) {
    // Error cargando hero image
  }

  // GET YOUTUBE EMBED URL
  public getYoutubeEmbedUrl(videoId: string): string {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // SEARCH EPISODES BY TITLE
  public searchEpisodesByTitle() {
    const episodesOrderedByCreatedAt = this.orderSearchedEpisodesByCreatedAt;
    if (!this.search) {
      this.searchedEpisodes = [...episodesOrderedByCreatedAt];
    } else {
      this.searchedEpisodes = episodesOrderedByCreatedAt.filter(
        (episode: PodcastEpisodesInterface) =>
          episode.title.toLowerCase().includes(this.search.toLowerCase())
      );
    }
  }

  public get orderSearchedEpisodesByCreatedAt() {
    if (!this.episodes) return [];

    return this.episodes.sort(
      (a: PodcastEpisodesInterface, b: PodcastEpisodesInterface) =>
        new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }
}

// EXPORT COMPONENT
export default PodcastSeasonScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-container class="ma-0 pa-0" fluid>
    <v-row justify="center" align-content="center" no-gutters>
      <!-- BANNER IMAGE -->
      <v-col cols="12">
        <hero-image
          :src="
            season.pictures.banner ?? season.pictures.bannerImageDetail?.image
          "
          :alt="season.pictures.bannerImageDetail?.altText ?? ''"
          :width="1200"
          :height="500"
          class="season-hero"
          @load="onHeroImageLoad"
          @error="onHeroImageError"
        />
      </v-col>

      <!-- SEASON SELECT BUTTON -->
      <v-col class="season-select-container py-5" cols="12" md="12" lg="12">
        <v-menu>
          <template v-slot:activator="{ props }">
            <v-btn
              v-bind="props"
              color="green"
              variant="flat"
              rounded="xl"
              size="large"
              class="season-select-button"
            >
              {{ season.name || "Selecciona una temporada" }}
              <v-icon class="ml-2">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list>
            <v-list-item
              v-for="seasonItem in seasons"
              :key="seasonItem._id"
              :value="seasonItem.slug"
              @click="changeSeason(seasonItem.slug)"
            >
              <v-list-item-title>{{ seasonItem.name }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-col>
    </v-row>

    <!-- VIDEO PLAYER SECTION -->
    <v-row
      v-if="selectedEpisode"
      id="video-player"
      justify="center"
      class="mb-10 mt-0 bg-black py-10"
      no-gutters
    >
      <v-col cols="12" md="10" lg="10">
        <div class="video-player-container">
          <div class="video-iframe-wrapper">
            <iframe
              :src="getYoutubeEmbedUrl(selectedEpisode.link)"
              title="Video en reproduccion actual, podcast"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerpolicy="strict-origin-when-cross-origin"
              allowfullscreen
              class="video-iframe"
            ></iframe>
            <div class="video-player-label">
              <span class="text-caption text-white"
                >VIDEO en reproducción actual</span
              >
            </div>
          </div>
          <div class="video-info">
            <h2 class="video-title">{{ selectedEpisode.title }}</h2>
            <p class="video-description">{{ selectedEpisode.description }}</p>
          </div>
        </div>
      </v-col>
    </v-row>

    <!-- EPISODES GRID -->
    <v-row class="my-10" justify="center">
      <v-col cols="10" md="6" lg="4">
        <v-text-field
          v-model="search"
          label="Buscar episodio"
          prepend-inner-icon="mdi-magnify"
          rounded="xl"
          clearable
          variant="outlined"
          density="compact"
          class="mb-5"
          hide-details
          @update:modelValue="searchEpisodesByTitle"
        ></v-text-field>
      </v-col>
      <v-col cols="12" md="11" lg="11">
        <v-row>
          <v-col
            v-for="(episode, index) in searchedEpisodes.length > 0
              ? searchedEpisodes
              : orderSearchedEpisodesByCreatedAt"
            :key="episode._id || index"
            cols="12"
            sm="6"
            md="4"
            lg="3"
            class="episode-card-col"
          >
            <v-card
              :class="{
                'episode-card-active': selectedEpisode?._id === episode._id,
              }"
              class="episode-card"
              rounded="lg"
              elevation="2"
            >
              <CardImage
                :src="episode.cover ?? episode.coverImageDetail?.image"
                :alt="episode.coverImageDetail?.altText ?? ''"
                :width="400"
                :height="200"
                class="episode-card-image"
              />

              <v-card-title class="episode-card-title">
                {{ episode.title }}
              </v-card-title>

              <v-card-text class="episode-card-description">
                <p class="text-caption">{{ episode.description }}</p>
              </v-card-text>

              <v-card-actions class="episode-card-actions">
                <v-btn
                  color="primary"
                  variant="flat"
                  rounded="xl"
                  size="small"
                  class="text-caption mx-auto"
                  @click="selectEpisode(episode)"
                >
                  Ver episodio
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
// HERO IMAGE STYLES
.season-hero {
  width: 100%;
  height: 500px;

  @media (max-width: 768px) {
    height: 300px;
  }

  @media (max-width: 480px) {
    height: 250px;
  }
}

.season-hero-fallback {
  width: 100%;
  height: 500px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;

  @media (max-width: 768px) {
    height: 300px;
    border-radius: 4px;
  }

  @media (max-width: 480px) {
    height: 250px;
  }
}

.fallback-content {
  text-align: center;
  color: white;
}

.debug-info {
  font-size: 12px;
  max-height: 200px;
  overflow-y: auto;
  border-radius: 4px;
}

.season-banner-fallback {
  border-radius: 8px;
}

.season-select-container {
  padding: 0 16px;
  display: flex;
  justify-content: center;
  background-color: #4caf50;

  @media (min-width: 960px) {
    padding: 0 24px;
  }
}

.season-select-button {
  background: #4caf50 !important;
  color: white !important;
  font-weight: 600;
  text-transform: none;
  padding: 12px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

// VIDEO PLAYER SECTION
.video-player-container {
  background: #f5f5f5;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
}

.video-player-label {
  position: absolute;
  bottom: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.75);
  padding: 6px 12px;
  border-radius: 4px;
  z-index: 2;
}

.video-iframe-wrapper {
  position: relative;
  width: 100%;
  padding-bottom: 56.25%; // 16:9 aspect ratio
  height: 0;
  overflow: hidden;
  background: #000000;
}

.video-iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.video-info {
  padding: 24px;

  @media (max-width: 960px) {
    padding: 16px;
  }
}

.video-title {
  font-size: 20px;
  font-weight: 700;
  color: #000000;
  margin-bottom: 12px;
  line-height: 1.4;

  @media (max-width: 960px) {
    font-size: 18px;
  }
}

.video-description {
  font-size: 14px;
  color: #666666;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// EPISODES GRID
.episode-card-col {
  padding: 12px;
  display: flex;
  flex-direction: column;

  @media (max-width: 960px) {
    padding: 8px;
  }

  @media (max-width: 600px) {
    padding: 8px 12px;
  }
}

.episode-card {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  border: 2px solid #e0e0e0;
  margin: 0 auto;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15) !important;
    border-color: #12499b;
  }

  &.episode-card-active {
    border-color: #12499b90;
    border-width: 5px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3) !important;
  }
}

.episode-card-image {
  width: 100%;
  height: auto;
  display: block;
}

.episode-card-title {
  font-size: 18px;
  font-weight: 700;
  color: #000000;
  padding: 16px 16px 8px;
  line-height: 1.4;
  min-height: 60px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;

  @media (max-width: 960px) {
    font-size: 16px;
    padding: 12px 12px 8px;
    min-height: 50px;
  }
}

.episode-card-description {
  flex: 1;
  padding: 8px 16px;

  @media (max-width: 960px) {
    padding: 8px 12px;
  }

  p {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    margin: 0;
    line-height: 1.5;
    color: #666666;
  }
}

.episode-card-actions {
  padding: 12px 16px 16px;

  @media (max-width: 960px) {
    padding: 8px 12px 12px;
  }
}
</style>
