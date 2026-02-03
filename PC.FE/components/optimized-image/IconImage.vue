<script lang="ts">
// IMPORT VUE CLASS
import { Prop, Vue, Watch, Emit } from "vue-facing-decorator"

// IMPORT HELPER
import { resolveAssetPath } from '~/composables/useAssetResolver'

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'icon-image-component',
})
class IconImageComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  @Prop({ required: true })
  public src!: string | null | undefined

  @Prop({ required: true })
  public alt!: string

  @Prop({ default: 64 })
  public width!: number

  @Prop({ default: 64 })
  public height!: number

  @Prop({ default: '' })
  public containerClass!: string

  @Prop({ default: '' })
  public imageClass!: string

  @Prop({ default: 'eager' })
  public loading!: 'lazy' | 'eager'

  @Prop({ default: false })
  public fixedSize!: boolean

  ///////////////
  // VARIABLES //
  ///////////////

  public hasError: boolean = false
  public imageLoaded: boolean = false

  ///////////////
  // COMPUTED //
  ///////////////

  // Procesar src para imágenes locales
  public get imageSrc(): string {
    // Validar que src existe y no es null/undefined
    if (!this.src) {
      return ''
    }
    
    // URLs externas se devuelven tal cual
    if (this.src.startsWith('http') || this.src.startsWith('//')) {
      return this.src
    }
    
    // Resolver assets que empiezan con /assets/ o ~/assets/
    if (this.src.startsWith('/assets/') || this.src.startsWith('~/assets/')) {
      return resolveAssetPath(this.src)
    }
    
    // Rutas absolutas que no son assets (ej: /favicon.ico) se devuelven tal cual
    if (this.src.startsWith('/')) {
      return this.src
    }
    
    // Rutas relativas
    return `/${this.src}`
  }

  // Detectar si es SVG
  public get isSvg(): boolean {
    if (!this.src || !this.imageSrc) {
      return false
    }
    return this.src.toLowerCase().endsWith('.svg') || 
           this.imageSrc.toLowerCase().endsWith('.svg')
  }

  // Detectar si la imagen es de public/assets/ (no optimizable con NuxtImg)
  public get isPublicAsset(): boolean {
    return this.imageSrc.startsWith('/assets/')
  }

  // Crear versión blur de la imagen (placeholder)
  public get blurSrc(): string {
    // No mostrar placeholder para SVG
    if (this.isSvg) {
      return ''
    }
    
    const baseUrl = this.imageSrc
    
    // Validar que baseUrl existe
    if (!baseUrl) {
      return ''
    }
    
    if (baseUrl.includes('picsum.photos') || baseUrl.includes('unsplash.com')) {
      const separator = baseUrl.includes('?') ? '&' : '?'
      return `${baseUrl}${separator}w=20&h=20&blur=2&q=20`
    }
    
    return baseUrl
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
    this.imageLoaded = true
    return event
  }

  @Emit('error')
  public onImageError(event: string | Event): string | Event {
    this.hasError = true
    return event
  }

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  public mounted(): void {
    if (process.client && this.imageSrc) {
      // Para SVGs, marcar como cargado inmediatamente ya que se cargan rápido
      if (this.isSvg) {
        this.imageLoaded = true
      }
    }
  }

  /////////////
  // WATCHERS //
  /////////////

  @Watch('src')
  public onSrcChange(): void {
    this.hasError = false
    this.imageLoaded = false
  }
}

// EXPORT COMPONENT
export default IconImageComponent;
</script>

<template>
  <div class="icon-image-container" :class="containerClass">
    <!-- Estado de error o src vacío -->
    <div v-if="hasError || !imageSrc" class="error-state">
      <div class="error-icon">❌</div>
    </div>
    
    <!-- Para SVG, usar img normal sin procesamiento - siempre visible -->
    <template v-else-if="isSvg && imageSrc">
      <img
        :src="imageSrc"
        :alt="alt"
        :width="width"
        :height="height"
        :loading="loading"
        :style="fixedSize ? { width: `${width}px`, height: `${height}px`, maxWidth: `${width}px`, maxHeight: `${height}px` } : { maxWidth: `${width}px`, maxHeight: `${height}px`, width: 'auto', height: 'auto' }"
        class="icon-image icon-image-svg"
        :class="imageClass"
        @load="onImageLoad"
        @error="onImageError"
      />
    </template>
    
    <!-- Para otras imágenes con placeholder -->
    <template v-else-if="imageSrc">
      <!-- Placeholder blur -->
      <div 
        v-if="!imageLoaded && blurSrc" 
        class="blur-placeholder"
      >
        <NuxtImg
          :src="blurSrc"
          :alt="`${alt} - placeholder`"
          :width="20"
          :height="20"
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
        v-if="isPublicAsset"
        :src="imageSrc"
        :alt="alt"
        :width="width"
        :height="height"
        :loading="loading"
        :style="fixedSize ? { width: `${width}px`, height: `${height}px`, maxWidth: `${width}px`, maxHeight: `${height}px` } : { maxWidth: `${width}px`, maxHeight: `${height}px`, width: 'auto', height: 'auto' }"
        class="icon-image"
        :class="[imageClass, { 'image-loaded': imageLoaded }]"
        :aria-label="alt"
        @load="onImageLoad"
        @error="onImageError"
      />
      <!-- Imagen optimizada con NuxtImg para otras rutas -->
      <NuxtImg
        v-else
        :src="imageSrc"
        :alt="alt"
        :width="width"
        :height="height"
        :loading="loading"
        :fetchpriority="loading === 'eager' ? 'high' : 'auto'"
        :style="fixedSize ? { width: `${width}px`, height: `${height}px`, maxWidth: `${width}px`, maxHeight: `${height}px` } : { maxWidth: `${width}px`, maxHeight: `${height}px`, width: 'auto', height: 'auto' }"
        class="icon-image"
        :class="[imageClass, { 'image-loaded': imageLoaded }]"
        role="img"
        :aria-label="alt"
        @load="onImageLoad"
        @error="onImageError"
      />
    </template>
  </div>
</template>

<style scoped>
.icon-image-container {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  flex-shrink: 0;
}

/* Estado de error */
.error-state {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-width: 32px;
  min-height: 32px;
  background-color: #f8f9fa;
  border-radius: 4px;
  z-index: 10;
}

.error-icon {
  font-size: 1rem;
  opacity: 0.5;
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.blur-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: blur(4px);
  opacity: 0.6;
}

/* Imagen principal - Estilos generales */
.icon-image {
  position: relative;
  z-index: 1;
  -o-object-fit: contain;
  object-fit: contain;
  -o-object-position: center;
  object-position: center;
  display: block !important;
  opacity: 1;
  -webkit-transition: opacity 0.2s ease-out, transform 0.2s ease-in-out;
  -o-transition: opacity 0.2s ease-out, transform 0.2s ease-in-out;
  transition: opacity 0.2s ease-out, transform 0.2s ease-in-out;
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  border: none;
  outline: none;
  background: transparent;
  box-shadow: none;
  /* El width y height se controlan desde el style inline */
  visibility: visible !important;
}

/* SVGs siempre visibles */
.icon-image-svg {
  opacity: 1 !important;
  visibility: visible !important;
  display: block !important;
}

/* Solo aplicar opacidad 0 si no está cargada y no es SVG */
.icon-image:not(.image-loaded):not(.icon-image-svg) {
  opacity: 0;
}

.icon-image.image-loaded {
  opacity: 1;
  visibility: visible !important;
}

/* IMPORTANTE: NO aplicar estos estilos a iconos dentro de section -> cards */
/* Los estilos de section -> cards están en components/sections/cards/index.vue */
/* y tienen selectores más específicos que estos estilos generales */

/* Optimización para dispositivos de bajo rendimiento */
@media (prefers-reduced-motion: reduce) {
  .icon-image {
    transition: none;
  }
}
</style>