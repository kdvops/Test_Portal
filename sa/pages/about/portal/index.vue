<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: '/sobre-nosotros/portal-de-empleo'
})

// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";
import { useRobustSEO } from '~/composables/useRobustSEO';

// IMPORT OPTIMIZED IMAGE COMPONENTS
import IconImage from '~/components/optimized-image/IconImage.vue';
import HeroImage from '~/components/optimized-image/HeroImage.vue';

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'about-history-screen',
  components: {
    IconImage,
    HeroImage
  }
})
export default class forYouJobPageScreen extends Vue {
  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // MOUNTED METHOD
  public mounted() {
    // Aplicar SEO
    this.applySEO();
  }

  // APPLY SEO METADATA
  public applySEO() {
    this.robustSEO.applyRobustSEO({
      section: 'about',
      item: 'Portal de Empleo',
      customAttributes: {
        metaTitle: 'Portal de Empleo - Portal BSC',
        metaDescription: 'Conoce nuestro portal de empleo y vive la experiencia de ser parte de #NuestraGenteBSC. Regístrate y encuentra las mejores oportunidades laborales.',
        keywords: ['portal empleo', 'trabajo', 'vacantes', 'BSC', 'Banco de Santa Cruz', 'oportunidades laborales'],
        focusKeyword: 'portal empleo BSC',
        structuredType: 'WebPage',
        isFeatured: true
      }
    });
  }
}
</script>

<template>
  <div class="banner">
    <HeroImage
      src="/assets/backgrounds/bannerPage.png"
      alt="Banner Portal de Empleo BSC"
      :width="1920"
      :height="500"
      loading="eager"
      class="banner-background"
    />
    <div class="banner-content">
      <h1>¡Conoce nuestro portal de empleo!</h1>
      <p>Regístrate y vive la experiencia de ser parte de #NuestraGenteBSC</p>
      <a class="banner-button" href="https://vacantes.bsc.com.do">
        Ir al portal de Empleo
        <IconImage
          src="/assets/icons/go.svg"
          alt="Icono ir al portal"
          :width="24"
          :height="24"
        />
      </a>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.banner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 550px;
  color: white;
  padding-left: 3rem;
  overflow: hidden;
}

.banner-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.banner-content {
  position: relative;
  z-index: 2;
  max-width: 500px;
  padding: 5%;
}

.banner h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.banner p {
  font-size: 1.25rem;
}

.banner-button {
  display: inline-flex;
  align-items: center;
  color: white;
  padding: 10px 20px;
  text-decoration: none;
  font-size: 1rem;
  margin-top: 1rem;
  background: var(--bsc-primary-color) 0% 0% no-repeat padding-box;
  border-radius: 40px;
  opacity: 1;
  gap: 3%;
  width: 70%;
  justify-content: center;
}

.banner-button .icon {
  margin-left: 8px;
  width: 24px;
  height: 24px;
}
</style>