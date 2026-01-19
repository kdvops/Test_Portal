<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop } from "vue-facing-decorator";

// IMPORT INTERFACES
import type { FinanciallyInterface } from "~/interfaces/financially.interface";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import CardImage from "~/components/optimized-image/CardImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "app-financially-card-component",
  components: {
    CardImage,
  },
})
export default class AppFinanciallyCardComponent extends Vue {
  //////////////
  //// PROPS ///
  //////////////

  @Prop()
  financially!: FinanciallyInterface;

  ///////////////
  // VARIABLES //
  ///////////////

  // APP INSTANCE
  public $app: any;

  // GET FORMAT DATE RANGE
  public getFormatDateRange(date: string): string {
    let dateFinal = "";
    dateFinal = `${this.$app.$moment(date).format("D")} de ${this.$app
      .$moment(date)
      .format("MMMM")} del ${this.$app.$moment(date).format("YYYY")}`;
    return dateFinal;
  }

  // GO TO LINK
  public goToLink(link: string) {
    window.open(link, "_blank");
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
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-responsive :aspect-ratio="4 / 5" class="w-100">
    <v-card
      rounded="lg"
      color="#fbfaff"
      class="mx-auto d-flex flex-column border-b-lg border-opacity-100 border-success h-100 w-100 overflow-hidden"
    >
      <div class="financially-card-image">
        <CardImage
          :src="
            financially.thumbnail ??
            financially.thumbnailImageDetail?.image ??
            financially.banner ??
            financially.bannerImageDetail?.image
          "
          :alt="financially.bannerImageDetail?.altText ?? ''"
          :width="280"
          :height="180"
          loading="eager"
          container-class="financially-image-container"
        />
      </div>

      <v-card-text class="px-4 pt-4 pb-2 d-flex flex-column flex-grow-1">
        <p
          class="text-subtitle-2 font-weight-medium text-success mb-2"
          v-if="hasAuthors"
        >
          Por {{ combinedNames }}
        </p>

        <p class="text-caption text-medium-emphasis mb-2">
          {{ getFormatDateRange(financially.createdAt) }}
        </p>

        <p class="text-h6 font-weight-bold text-primary mb-2">
          {{ financially.title }}
        </p>

        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ financially.excerpt }}
        </p>
      </v-card-text>

      <v-card-actions class="px-4 pb-4 pt-2 d-flex justify-center mb-3">
        <template v-if="financially.type !== 'post::release'">
          <v-btn
            color="primary"
            variant="flat"
            rounded="pill"
            size="large"
            class="text-caption mx-auto px-8"
            :to="`/financieramente/post/${financially.slug}`"
          >
            Ver más
          </v-btn>
        </template>

        <template v-else>
          <v-btn
            color="primary"
            variant="flat"
            rounded="pill"
            size="large"
            class="text-caption mx-auto px-8"
            @click="goToLink(financially.file)"
          >
            Descargar
          </v-btn>
        </template>
      </v-card-actions>
    </v-card>
  </v-responsive>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>
