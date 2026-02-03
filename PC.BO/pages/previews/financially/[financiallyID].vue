<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Vue } from "vue-facing-decorator";
// IMPORT INTERFACES
import type { FinanciallyInterface } from "~/interfaces/financially.interface";

// IMPORT COMPONENTS
import AppPreviewSectionsComponent from "~/components/previews/sections/index.vue";

// IMPORT GRAPHQL QUERY
import { GET_FINANCIALLY_BY_ID } from "~/graphql/query/financially.query";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "previews-financially-post-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-preview-sections-component": AppPreviewSectionsComponent,
  },
})
class PreviewsFinanciallyPostScreen extends Vue {
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
  public postID = useRoute().params.financiallyID;

  // POSTS
  public financially: FinanciallyInterface = {
    _id: "",
    title: "",
    slug: "",
    excerpt: "",
    subtitle: "",
    description: "",
    file: "",
    type: "post::article",
    sections: [],
    banner: "",
    responsive: "",
    thumbnail: "",
    disabled: false,
    createdAt: "",
  };

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  // MOUNTED METHOD
  public mounted() {
    // GET POSTS
    this.getFinanciallyById();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // GET FINANCIALLY BY ID
  public async getFinanciallyById() {
    try {
      // GET POST ID
      const financiallyId = {
        financiallyId: this.postID,
      };

      const { data } = await this.$apollo.query({
        query: GET_FINANCIALLY_BY_ID,
        variables: financiallyId,
        fetchPolicy: "no-cache",
      });

      // SET FINANCIALLY
      const financially = data.findFinanciallyById;

      // DECRYPT BASE64 TEXT TO HTML
      const sections = financially.sections.map((section: any) => {
        return {
          ...section,
          text: section.text ? decrypt(section.text) : "",
        };
      });

      // SET FINANCIALLY TO VARIABLE
      this.financially = { ...financially, sections };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GET FORMAT DATE RANGE
  public getFormatDateRange(date: string): string {
    let dateFinal = "";
    dateFinal = `${this.$app.$moment(date).format("D")} ${this.$app
      .$moment(date)
      .format("MMMM")} ${this.$app.$moment(date).format("YYYY")}`;
    return dateFinal;
  }

  get hasAuthors() {
    return (this.financially?.authors?.length ?? 0) > 0;
  }

  get combinedNames(): string {
    const names = (this.financially.authors ?? [])
      .map((a) => a.name?.trim())
      .filter(Boolean) as string[];
    if (!names.length) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} y ${names[1]}`;
    return `${names.slice(0, -1).join(", ")} y ${names[names.length - 1]}`;
  }

  get combinedPositions(): string {
    const uniq = Array.from(
      new Set(
        (this.financially.authors ?? [])
          .map((a) => a.position?.trim())
          .filter(Boolean)
      )
    ) as string[];
    if (!uniq.length) return "";
    if (uniq.length === 1) return uniq[0];
    return uniq.join(" • ");
  }
}

export default PreviewsFinanciallyPostScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="hero-banners-container" justify="space-between" no-gutters>
    <!-- BANNER -->
    <v-col cols="12">
      <v-img
        width="100%"
        height="400"
        :src="
          $vuetify.display.mdAndDown
            ? financially.responsive ?? financially.responsiveImageDetail?.image
            : financially.banner ?? financially.responsiveImageDetail?.image
        "
        cover
      />
    </v-col>

    <v-col cols="12" md="12" lg="12" class="px-2 px-md-15 py-10">
      <v-row>
        <v-col cols="12" md="9" lg="9">
          <h1
            class="text-h5 text-md-h3 text-center text-md-left text-primary font-weight-bold"
          >
            {{ financially.subtitle }}
          </h1>
          <p
            class="text-caption text-md-h5 text-center text-md-left text-green font-weight-regular mt-5 pr-0 pr-md-15"
          >
            {{ financially.description }}
          </p>
        </v-col>
        <v-col class="d-flex justify-space-between" cols="12">
          <p class="text-caption text-grey" style="width: 100px">
            {{ getFormatDateRange(financially.createdAt!) }}
          </p>
          <v-divider class="mt-2" length="100%" thickness="2" />
        </v-col>
        <v-col cols="12">
          <!-- SECTION COMPONENT -->
          <app-preview-sections-component :sections="financially.sections" />

          <div
            v-if="financially.authors"
            class="d-flex align-center ga-4 w-100"
          >
            <!-- avatar stack (leftmost on top) -->
            <div class="d-flex align-center">
              <div
                v-for="(a, i) in financially.authors || []"
                :key="i"
                class="position-relative"
                :class="i > 0 ? 'ms-n6' : ''"
                :style="{ zIndex: (financially.authors?.length || 1) - i }"
              >
                <v-avatar :size="56" class="elevation-2 rounded-circle">
                  <v-img
                    :src="a?.image?.image ?? ''"
                    :alt="a?.name || `Autor ${i + 1}`"
                  />
                </v-avatar>
              </div>
            </div>

            <div class="d-flex flex-column">
              <div class="d-flex align-center">
                <span
                  class="me-2 text-blue-darken-3 font-weight-bold"
                  v-if="combinedNames"
                  >Por:</span
                >
                <span class="text-blue-darken-3 font-weight-bold">{{
                  combinedNames || ""
                }}</span>
              </div>
              <div
                class="text-green-darken-2 text-subtitle-1 font-weight-semibold"
              >
                {{ combinedPositions }}
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>
