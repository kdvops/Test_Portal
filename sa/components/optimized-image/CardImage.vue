<script lang="ts">
// IMPORT VUE CLASS
import { Prop, Vue, Watch, Emit } from "vue-facing-decorator"

// IMPORT HELPER
import { resolveAssetPath } from '~/composables/useAssetResolver'

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'card-image-component',
})
class CardImageComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  @Prop({ required: true })
  public src!: string | null | undefined

  @Prop({ required: true })
  public alt!: string

  @Prop({ default: 400 })
  public width!: number

  @Prop({ default: 300 })
  public height!: number

  @Prop({ default: '' })
  public containerClass!: string

  @Prop({ default: '' })
  public imageClass!: string

  ///////////////
  // VARIABLES //
  ///////////////

  public imageLoaded: boolean = false
  public hasError: boolean = false

  ///////////////
  // COMPUTED //
  ///////////////

  // Procesar src para imágenes locales
  public get imageSrc(): string {
    // Validar que src existe y no es null/undefined
    if (!this.src) {
      return ''
    }
    
    // Resolver assets que empiezan con /assets/ o ~/assets/
    if (this.src.startsWith('/assets/') || this.src.startsWith('~/assets/')) {
      return resolveAssetPath(this.src)
    }
    
    // URLs externas se devuelven tal cual
    if (this.src.startsWith('http') || this.src.startsWith('//')) {
      return this.src
    }
    
    // Rutas absolutas que no son assets (ej: /favicon.ico) se devuelven tal cual
    if (this.src.startsWith('/')) {
      return this.src
    }
    
    // Rutas relativas
    return `/${this.src}`
  }

  // Crear versión blur de la imagen (placeholder) - versión muy pequeña para mejor rendimiento
  public get blurSrc(): string {
    const baseUrl = this.imageSrc
    
    // Validar que baseUrl existe
    if (!baseUrl) {
      return ''
    }
    
    // Para imágenes externas con soporte de parámetros
    if (baseUrl.includes('picsum.photos') || baseUrl.includes('unsplash.com')) {
      const separator = baseUrl.includes('?') ? '&' : '?'
      return `${baseUrl}${separator}w=20&h=15&blur=5&q=10`
    }
    
    // Para imágenes locales, usar NuxtImg con parámetros de optimización
    // Generar una versión muy pequeña (10px) para el placeholder
    return baseUrl
  }

  // Computed para sizes responsive - Compatible con Safari
  public get sizes(): string {
    // Safari fix: usar valores más específicos en lugar de vw directo
    return '(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 400px'
  }

  // Detectar si la imagen es de public/assets/ (no optimizable con NuxtImg)
  public get isPublicAsset(): boolean {
    return this.imageSrc.startsWith('/assets/')
  }

  /////////////
  // METHODS //
  /////////////

  public onBlurLoad(): void {
    // Blur cargado
  }

  public onBlurError(): void {
    // Blur falló, continuar sin él
  }

  @Emit('load')
  public onImageLoad(event: string | Event): string | Event {
    setTimeout(() => {
      this.imageLoaded = true
    }, 150)
    
    return event
  }

  @Emit('error')
  public onImageError(event: string | Event): string | Event {
    this.hasError = true
    return event
  }

  /////////////
  // WATCHERS //
  /////////////

  @Watch('src')
  public onSrcChange(): void {
    this.imageLoaded = false
    this.hasError = false
  }
}

// EXPORT COMPONENT
export default CardImageComponent;
</script>

<template>
  <div 
    class="card-image-container" 
    :class="containerClass"
    :style="{ height: `${height}px`, aspectRatio: `${width} / ${height}` }"
  >
    <!-- Estado de error o src vacío -->
    <div v-if="hasError || !imageSrc" class="error-state">
      <div class="error-icon">🖼️</div>
    </div>
    
    <!-- Placeholder blur -->
    <div 
      v-else-if="!imageLoaded && blurSrc" 
      class="blur-placeholder"
    >
      <!-- Imagen blur pequeña - versión optimizada de 10-20px -->
      <NuxtImg
        :src="blurSrc"
        :alt="`${alt} - placeholder`"
        :width="20"
        :height="15"
        format="webp"
        quality="10"
        class="blur-image"
        loading="eager"
        fetchpriority="low"
        @load="onBlurLoad"
        @error="onBlurError"
      />
    </div>
    
    <!-- Imagen principal - usar img normal para public/assets/ -->
    <img
      v-if="!hasError && imageSrc && isPublicAsset"
      :src="imageSrc"
      :alt="alt"
      :width="width"
      :height="height"
      loading="lazy"
      class="card-image"
      :class="[imageClass, { 'image-loaded': imageLoaded }]"
      role="img"
      :aria-label="alt"
      @load="onImageLoad"
      @error="onImageError"
    />
    <!-- Imagen optimizada con NuxtImg para otras rutas -->
    <NuxtImg
      v-else-if="!hasError && imageSrc && !isPublicAsset"
      :src="imageSrc"
      :alt="alt"
      preset="card"
      :width="width"
      :height="height"
      :sizes="sizes"
      loading="lazy"
      fetchpriority="auto"
      class="card-image"
      :class="[imageClass, { 'image-loaded': imageLoaded }]"
      role="img"
      :aria-label="alt"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>

<style scoped>
.card-image-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 8px;
  background-color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Estado de error */
.error-state {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  z-index: 3;
}

.error-icon {
  font-size: 3rem;
  opacity: 0.4;
}

/* Placeholder blur */
.blur-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  overflow: hidden;
}

.blur-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: blur(8px);
  opacity: 0.7;
}

/* Imagen principal */
.card-image {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  opacity: 0;
  transition: opacity 0.3s ease-out;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  box-shadow: none;
}

.card-image.image-loaded {
  opacity: 1;
}

@media (max-width: 768px) {
  .card-image-container {
    border-radius: 6px;
  }
  
  .error-icon {
    font-size: 2.5rem;
  }
}

/* Optimización para dispositivos de bajo rendimiento */
@media (prefers-reduced-motion: reduce) {
  .card-image {
    transition: none;
  }
}
</style>