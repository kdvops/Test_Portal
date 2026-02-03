<script lang="ts">
// IMPORT VUE CLASS
import { Prop, Vue, Watch, Emit } from "vue-facing-decorator"

// IMPORT HELPER
import { resolveAssetPath } from '~/composables/useAssetResolver'

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'hero-image-component',
})
class HeroImageComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  @Prop({ required: true })
  public src!: string | null | undefined

  @Prop({ required: true })
  public alt!: string

  @Prop({ default: 1920 })
  public width!: number

  @Prop({ default: 500 })
  public height!: number

  @Prop({ default: '' })
  public containerClass!: string

  @Prop({ default: '' })
  public imageClass!: string

  @Prop({ default: 'eager' })
  public loading!: 'lazy' | 'eager'

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
    return baseUrl
  }

  // Computed para sizes responsive - Compatible con Safari
  public get sizes(): string {
    // Safari fix: usar media query en lugar de 100vw directo
    return '(max-width: 1920px) 100vw, 1920px'
  }

  // Determinar fetchpriority según loading prop
  public get fetchPriority(): 'high' | 'auto' | 'low' {
    return this.loading === 'eager' ? 'high' : 'auto'
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
    }, 100)
    
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
export default HeroImageComponent;
</script>

<template>
  <div 
    class="hero-image-container" 
    :class="containerClass"
    :style="{ height: `${height}px`, minHeight: `${height}px` }"
  >
    <!-- Estado de error o src vacío -->
    <div v-if="hasError || !imageSrc" class="error-state">
        <div class="error-icon">📷</div>
    </div>
    
    <div 
      v-else-if="!imageLoaded && blurSrc" 
      class="blur-placeholder"
    >
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
      :loading="loading"
      class="hero-image"
      :class="[imageClass, { 'image-loaded': imageLoaded }]"
      :aria-label="alt"
      @load="onImageLoad"
      @error="onImageError"
    />
    <!-- Imagen optimizada con NuxtImg para otras rutas -->
    <NuxtImg
      v-else-if="!hasError && imageSrc && !isPublicAsset"
      :src="imageSrc"
      :alt="alt"
      preset="hero"
      :width="width"
      :height="height"
      :sizes="sizes"
      :loading="loading"
      :fetchpriority="fetchPriority"
      class="hero-image"
      :class="[imageClass, { 'image-loaded': imageLoaded }]"
      role="img"
      :aria-label="alt"
      @load="onImageLoad"
      @error="onImageError"
    />
  </div>
</template>

<style scoped>
.hero-image-container {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 0;
  background-color: #ffffff;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  z-index: 0;
}

/* Estado de error */
.error-state {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: -webkit-box;
  display: -webkit-flex;
  display: -ms-flexbox;
  display: flex;
  -webkit-box-align: center;
  -webkit-align-items: center;
  -ms-flex-align: center;
  align-items: center;
  -webkit-box-pack: center;
  -webkit-justify-content: center;
  -ms-flex-pack: center;
  justify-content: center;
  background-color: #ffffff;
  z-index: 1;
  pointer-events: none;
}

.error-icon {
  font-size: 4rem;
  opacity: 0.4;
}

/* Placeholder blur */
.blur-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.blur-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Prefijos webkit para Safari antiguo */
  -webkit-object-fit: cover;
  -moz-object-fit: cover;
  -o-object-fit: cover;
  object-fit: cover;
  -webkit-object-position: center;
  -moz-object-position: center;
  -o-object-position: center;
  object-position: center;
  -webkit-filter: blur(10px);
  filter: blur(10px);
  opacity: 0.8;
  pointer-events: none;
  z-index: 0;
  /* Forzar aceleración de hardware en Safari */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
}

/* Imagen principal */
.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Prefijos webkit para Safari antiguo */
  -webkit-object-fit: cover;
  -moz-object-fit: cover;
  -o-object-fit: cover;
  object-fit: cover;
  -webkit-object-position: center;
  -moz-object-position: center;
  -o-object-position: center;
  object-position: center;
  display: block;
  opacity: 0;
  -webkit-transition: opacity 0.4s ease-out;
  -o-transition: opacity 0.4s ease-out;
  transition: opacity 0.4s ease-out;
  z-index: 0;
  pointer-events: none;
  /* Forzar aceleración de hardware en Safari */
  -webkit-transform: translateZ(0);
  transform: translateZ(0);
  -webkit-backface-visibility: hidden;
  backface-visibility: hidden;
  will-change: opacity;
}

.hero-image.image-loaded {
  opacity: 1;
}

@media (max-width: 768px) {
  .hero-image-container {
    border-radius: 4px;
  }
  
  .error-icon {
    font-size: 3rem;
  }
}

/* Optimización para dispositivos de bajo rendimiento */
@media (prefers-reduced-motion: reduce) {
  .hero-image {
    -webkit-transition: none;
    -o-transition: none;
    transition: none;
  }
}

/* Compatibilidad específica para Safari */
@supports (-webkit-appearance: none) {
  .hero-image-container {
    /* Fallback para aspect-ratio en Safari antiguo */
    min-height: 300px;
    /* Asegurar renderizado correcto en Safari */
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }
  
  .hero-image,
  .blur-image {
    /* Asegurar que object-fit funcione en Safari */
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    /* Forzar repintado en Safari */
    -webkit-perspective: 1000px;
    perspective: 1000px;
  }
}

/* Fix específico para Safari iOS */
@supports (-webkit-touch-callout: none) {
  .hero-image-container {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
  }
  
  .hero-image,
  .blur-image {
    -webkit-transform: translate3d(0, 0, 0);
    transform: translate3d(0, 0, 0);
    /* Asegurar que las imágenes no se estiren en Safari iOS */
    max-width: 100%;
    max-height: 100%;
  }
}
</style>