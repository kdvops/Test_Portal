<script lang="ts">
import { Emit, Prop, Vue, Watch } from "vue-facing-decorator";
import { resolveAssetPath } from "~/composables/useAssetResolver";

@NuxtComponent({
  name: "optimized-image-component",
  inheritAttrs: false,
})
class OptimizedImageComponent extends Vue {
  @Prop({ type: String, default: null })
  declare src: string | null;

  @Prop({ type: String, required: true })
  declare alt: string;

  @Prop({ type: String, default: "lazy" })
  declare loading: "lazy" | "eager";

  @Prop({ type: String, default: undefined })
  declare preset: string | undefined;

  public imageLoaded = false;
  public hasError = false;

  get imageSrc(): string {
    const source = this.src;
    if (!source) return "";

    if (source.startsWith("/assets/") || source.startsWith("~/assets/")) {
      return resolveAssetPath(source);
    }
    if (source.startsWith("http") || source.startsWith("//")) {
      return source;
    }
    if (source.startsWith("/")) {
      return source;
    }
    return `/${source}`;
  }

  get blurSrc(): string {
    const baseUrl = this.imageSrc;
    if (!baseUrl) return "";

    if (baseUrl.includes("picsum.photos") || baseUrl.includes("unsplash.com")) {
      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}w=40&h=30&blur=5&q=10`;
    }
    return baseUrl;
  }

  @Emit("load")
  public onImageLoad(event: string | Event) {
    setTimeout(() => {
      this.imageLoaded = true;
    }, 100);
    return event;
  }

  @Emit("error")
  public onImageError(event: string | Event) {
    this.hasError = true;
    return event;
  }

  @Watch("src")
  public onSrcChange() {
    this.imageLoaded = false;
    this.hasError = false;
  }

  get inheritedAttrs(): Record<string, unknown> {
    return this.$attrs;
  }

  get imgAttrs(): Record<string, unknown> {
    const attrs = this.$attrs as Record<string, unknown>;
    const { loading, fetchpriority, sizes, ...rest } = attrs;
    return rest;
  }

  // Detectar si la imagen es de public/assets/ (no optimizable con NuxtImg)
  get isPublicAsset(): boolean {
    return this.imageSrc.startsWith('/assets/')
  }

  get imgFitStyle() {
    const attrs = this.$attrs as Record<string, unknown>;
    const cover = "cover" in attrs;
    const contain = "contain" in attrs;

    if (contain) return { objectFit: "contain" };
    if (cover) return { objectFit: "cover" };
    // Match v-img default behavior
    return { objectFit: "cover" };
  }

  get imgBaseStyle() {
    return {
      width: "100%",
      height: "100%",
      display: "block",
    };
  }

  get containerStyle() {
    const style: Record<string, string> = {
      position: "relative",
      display: "block",
      lineHeight: "0",
      width: "100%",
      height: "100%",
      overflow: "hidden",
    };

    const { width, height } = this.$attrs as Record<string, unknown>;
    if (width) style.width = this.normalizeSize(width);
    if (height) style.height = this.normalizeSize(height);

    return style;
  }

  private normalizeSize(value: unknown): string {
    if (typeof value === "number") return `${value}px`;
    if (typeof value === "string") {
      return value.match(/^\d+(\.\d+)?$/) ? `${value}px` : value;
    }
    return "";
  }

  get showPlaceholder(): boolean {
    return (
      !this.hasError &&
      !!this.imageSrc &&
      !!this.blurSrc &&
      !this.imageLoaded
    );
  }

  get sizes(): string {
    return "100vw";
  }

  get fetchPriority(): "high" | "auto" | "low" {
    return this.loading === "eager" ? "high" : "auto";
  }
}

export default OptimizedImageComponent;
</script>

<template>
  <div class="optimized-image-wrapper" :style="containerStyle">
    <slot v-if="hasError || !imageSrc" name="error">
      <div
        class="optimized-image-error"
        :class="inheritedAttrs.class"
        aria-hidden="true"
        v-bind="inheritedAttrs"
      >
        📷
      </div>
    </slot>

    <template v-else>
      <slot
        v-if="showPlaceholder && blurSrc"
        name="placeholder"
        :src="blurSrc"
        :alt="alt"
      >
        <NuxtImg
          :src="blurSrc"
          :alt="`${alt} - placeholder`"
          :width="20"
          :height="15"
          format="webp"
          quality="10"
          class="optimized-image-blur"
          loading="eager"
          fetchpriority="low"
          :style="[imgBaseStyle, imgFitStyle]"
          v-bind="imgAttrs"
        />
      </slot>

      <!-- Imagen principal - usar img normal para public/assets/ -->
      <img
        v-if="isPublicAsset"
        :src="imageSrc"
        :alt="alt"
        :loading="loading"
        role="img"
        :aria-label="alt"
        :style="[imgBaseStyle, imgFitStyle]"
        v-bind="imgAttrs"
        @load="onImageLoad"
        @error="onImageError"
      />
      <!-- Imagen optimizada con NuxtImg para otras rutas -->
      <NuxtImg
        v-else
        :src="imageSrc"
        :alt="alt"
        :preset="preset"
        :sizes="sizes"
        :loading="loading"
        :fetchpriority="fetchPriority"
        role="img"
        :aria-label="alt"
        :style="[imgBaseStyle, imgFitStyle]"
        v-bind="imgAttrs"
        @load="onImageLoad"
        @error="onImageError"
      />

      <slot />
    </template>
  </div>
</template>

<style scoped>
.optimized-image-wrapper {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  line-height: 0;
  overflow: hidden;
}

.optimized-image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.05);
}

.optimized-image-blur {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(10px);
  object-position: center;
  opacity: 0.7;
  pointer-events: none;
}
</style>
