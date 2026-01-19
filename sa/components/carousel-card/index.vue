<script lang="ts">
import { Vue, Prop } from "vue-facing-decorator";
import { hasSlides, normalizeHeight, nextIndex, prevIndex } from "./logic";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import HeroImage from "~/components/optimized-image/HeroImage.vue";

export interface CarouselSlide {
  image: string;
  author: string;
  title: string;
  description: string;
  url?: string;
  ctaText?: string;
  type?: "link" | "file";
}

@NuxtComponent({
  name: "carousel-card",
  components: {
    HeroImage,
  },
})
export default class CarouselCard extends Vue {
  @Prop({ type: Array, default: () => [] })
  declare slides: CarouselSlide[];

  @Prop({ type: Number, default: 6000 })
  declare interval: number; // ms between slides

  @Prop({ type: [Number, String], default: 380 })
  declare height: number | string; // card height

  // current slide index
  public model = 0;

  get hasSlides() {
    return hasSlides(this.slides);
  }

  get normalizedHeight() {
    return normalizeHeight(this.height);
  }

  public next() {
    this.model = nextIndex(this.model, this.slides);
  }

  public prev() {
    this.model = prevIndex(this.model, this.slides);
  }

  // GO TO LINK
  public goToLink(link: string) {
    window.open(link, "_blank");
  }
}
</script>

<template>
  <div
    class="position-relative overflow-hidden rounded-xl carousel-card w-100 h-100"
    :style="{ height: normalizedHeight }"
  >
    <!-- Carousel -->
    <v-carousel
      v-model="model"
      :cycle="true"
      :interval="interval"
      hide-delimiters
      :show-arrows="slides.length > 1 ? 'hover' : false"
      class="rounded-xl financially-carousel h-100"
      style="min-height: 380px"
    >
      <v-carousel-item
        v-for="(slide, index) in slides"
        :key="index"
        eager
        helps
        avoid
        glitches
        on
        first
        load
      >
        <div class="position-relative rounded-xl h-100 w-100">
          <HeroImage
            :src="slide.image"
            :alt="slide.title"
            :width="1920"
            :height="parseInt(normalizedHeight.replace('px', '')) || 380"
            container-class="rounded-xl h-100 w-100"
            image-class="rounded-xl"
            loading="eager"
          />
          <div
            class="position-absolute bottom-0 left-0 right-0 d-flex flex-column justify-end pa-6 carousel-overlay h-100"
            style="
              background: linear-gradient(
                180deg,
                rgba(0, 0, 0, 0) 0%,
                rgba(0, 0, 0, 0.6) 100%
              );
            "
          >
            <small class="text-white">
              {{ slide.author }}
            </small>

            <h3 class="text-white font-weight-bold mb-1">
              {{ slide.title }}
            </h3>

            <p class="text-white text-body-2 mb-3">
              {{ slide.description }}
            </p>

            <div>
              <v-btn
                v-if="slide.type === 'link'"
                color="primary"
                variant="flat"
                rounded="pill"
                size="large"
                class="text-caption mx-auto px-8"
                :to="slide.url"
              >
                {{ slide.ctaText || "Ver más" }}
              </v-btn>
              <v-btn
                v-else
                color="primary"
                variant="flat"
                rounded="pill"
                size="large"
                class="text-caption mx-auto px-8"
                :href="slide.url"
                :target="'_blank'"
              >
                {{ slide.ctaText || "Descargar" }}
              </v-btn>
            </div>
          </div>
        </div>
      </v-carousel-item>
    </v-carousel>
  </div>
</template>
