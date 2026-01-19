<!-- SCRIPT TEMPLATE -->
<script lang="ts">
definePageMeta({
  alias: "/canales/:categoryID?",
  seoManual: true,
});

// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";
import { watch, nextTick } from "vue";
import type { ChannelsInterface } from "~/interfaces/channels.interface";
import AppSectionsComponent from "~/components/sections/index.vue";

// IMPORT GRAPHQL QUERY
import {
  GET_CHANNELS_POST,
  GET_CHANNEL_POST_BY_SLUG,
} from "~/graphql/channel.query";
import type { SectionTypeInterface } from "~/interfaces/sections.interface";

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
  name: "channels-detail-screen",
  components: {
    "app-sections-component": AppSectionsComponent,
  },
  async setup() {
    const vm = getCurrentInstance()!.proxy as ChannelsDetailScreen;
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
      data.findChannelsBySlug as ChannelsInterface;

    const queries = {
      singleQuery: GET_CHANNEL_POST_BY_SLUG,
      varNames: { single: "slug" },
      select: selectEntity,
    };

    const pickTitle = makeStringFieldPicker<ChannelsInterface>("title");
    const pickDesc = makeStringFieldPicker<ChannelsInterface>("description");
    const pickId = makeIdFieldPicker<ChannelsInterface>("_id");

    const loadForKey = async (key: string) => {
      const currentKey =
        typeof vm.pageParam === "string"
          ? vm.pageParam
          : normalizeParam(vm.pageParam as any);

      await applyEntitySeoForKey<ChannelsInterface>({
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

    await loadForKey(normalizeParam(route.params.categoryID as any));
    
    // Observar cambios en categoryID para actualizar el canal y aplicar estilos
    watch(
      () => route.params.categoryID,
      async (newParam: any) => {
        const normalizedSlug = normalizeParam(newParam as any);
        if (normalizedSlug) {
          await loadForKey(normalizedSlug);
          await nextTick();
          if (vm.updateChannelBySlug) {
            await vm.updateChannelBySlug(normalizedSlug);
            await nextTick();
            if (vm.applyChannelStyles) {
              vm.applyChannelStyles();
            }
          }
        }
      },
      { immediate: false }
    );
  },
})
class ChannelsDetailScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // APOLLO INSTANCE
  public override $apollo: any;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // SHORTCUTS
  public channels: Array<ChannelsInterface> = [];
  public channel: ChannelsInterface | undefined;

  ///////////////
  //// PROPS ////
  ///////////////

  public pageParam = useRoute().params.categoryID;
  
  // Tab activo para Vuetify
  public activeTab = 0;
  
  /////////////
  // METHODS //
  /////////////

  public async mounted() {
    await this.getChannels();
    // Asegurar que el canal se establezca después de cargar
    if (!this.channel && this.channels.length > 0) {
      await this.updateChannelBySlug(this.pageParam);
    }
    // Aplicar estilos directamente en el DOM para sobrescribir estilos inline
    this.$nextTick(() => {
      this.applyChannelStyles();
      // Usar MutationObserver para aplicar estilos cuando se agreguen nuevos elementos
      if (process.client) {
        const container = document.querySelector('.channels-page-container');
        if (container) {
          const observer = new MutationObserver(() => {
            // Aplicar estilos después de un pequeño delay para que las imágenes se carguen
            setTimeout(() => {
              this.applyChannelStyles();
            }, 100);
          });
          observer.observe(container, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src', 'width', 'height']
          });
          
          // También escuchar eventos de carga de imágenes
          container.addEventListener('load', (e) => {
            if (e.target instanceof HTMLImageElement) {
              setTimeout(() => {
                this.applyChannelStyles();
              }, 50);
            }
          }, true);
          (this as any).channelsObserver = observer;
          
          // Listener para cambios de tamaño de ventana
          const handleResize = () => {
            this.applyChannelStyles();
          };
          window.addEventListener('resize', handleResize);
          (this as any).resizeHandler = handleResize;
        }
      }
    });
  }

  public beforeUnmount() {
    if (process.client) {
      if ((this as any).channelsObserver) {
        (this as any).channelsObserver.disconnect();
      }
      if ((this as any).resizeHandler) {
        window.removeEventListener('resize', (this as any).resizeHandler);
      }
    }
  }

  // Aplicar estilos directamente en el DOM para sobrescribir estilos inline
  public applyChannelStyles() {
    if (!process.client) return;
    
    const container = document.querySelector('.channels-page-container');
    if (!container) return;

    // Función auxiliar para aplicar estilos con retry
    const applyWithRetry = (selector: string, callback: (el: HTMLElement) => void, retries = 5) => {
      const elements = container.querySelectorAll(selector);
      if (elements.length === 0 && retries > 0) {
        setTimeout(() => applyWithRetry(selector, callback, retries - 1), 200);
        return;
      }
      elements.forEach((el: any) => callback(el));
    };

    // 1. Ajustar tarjetas de grid-item (v-card dentro de grids) - FORZAR ESTILOS
    applyWithRetry('.v-card', (el: HTMLElement) => {
      if (el.classList.contains('section-card')) return;
      
      const hasGridComponent = el.querySelector('.grid-component') || el.closest('.grid-component');
      if (!hasGridComponent && !el.querySelector('.grid-layout')) return;

      // Asegurar que las tarjetas de grid se vean bien en TODAS las resoluciones
      el.style.setProperty('width', '100%', 'important');
      el.style.setProperty('max-width', '100%', 'important');
      el.style.setProperty('min-width', 'auto', 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
      
      // Forzar estilos en el grid-component interno
      const gridComponent = el.querySelector('.grid-component') as HTMLElement | null;
      if (gridComponent) {
        gridComponent.style.setProperty('width', '100%', 'important');
        gridComponent.style.setProperty('max-width', '100%', 'important');
      }
      
      // Para grid items pequeños, asegurar tamaño mínimo en la columna padre
      const parentCol = el.closest('.v-col') as HTMLElement | null;
      if (parentCol) {
        const colClasses = parentCol.className || '';
        const width = window.innerWidth;
        
        // Aplicar estilos consistentes según la resolución
        if (colClasses.includes('xl-1') || colClasses.includes('xxl-1')) {
          if (width >= 2560) {
            parentCol.style.setProperty('min-width', '180px', 'important');
          } else if (width >= 1920) {
            parentCol.style.setProperty('min-width', '135px', 'important');
          } else if (width >= 1280) {
            parentCol.style.setProperty('min-width', '120px', 'important');
          }
        } else if (colClasses.includes('xl-2') || colClasses.includes('xxl-2')) {
          if (width >= 2560) {
            parentCol.style.setProperty('min-width', '300px', 'important');
          } else if (width >= 1920) {
            parentCol.style.setProperty('min-width', '235px', 'important');
          } else if (width >= 1280) {
            parentCol.style.setProperty('min-width', '200px', 'important');
          }
        }
        
        // Asegurar que la columna también tenga estilos correctos
        parentCol.style.setProperty('flex', '0 0 auto', 'important');
      }
    });

    // 2. Iconos en canales - Detección inteligente por tamaño en píxeles
    // Si el tamaño natural es pequeño (< 150px), es un icono y se agranda
    // Si el tamaño natural es grande (>= 150px), es una imagen/logo y se mantiene como está
    
    // Función auxiliar para detectar si es un icono pequeño basado en el tamaño natural
    // IMPORTANTE: Ser estricto para no afectar imágenes grandes (logos)
    const isSmallIcon = (imgElement: HTMLImageElement | HTMLElement): boolean => {
      // Si es un elemento img, verificar PRIMERO el tamaño natural (más confiable)
      if (imgElement instanceof HTMLImageElement) {
        // Si la imagen está cargada, verificar naturalWidth/naturalHeight
        if (imgElement.complete && imgElement.naturalWidth > 0 && imgElement.naturalHeight > 0) {
          // Si el tamaño natural es >= 150px, definitivamente NO es un icono pequeño
          if (imgElement.naturalWidth >= 150 || imgElement.naturalHeight >= 150) {
            return false;
          }
          // Si el tamaño natural es < 150px, es un icono pequeño
          if (imgElement.naturalWidth < 150 && imgElement.naturalHeight < 150) {
            return true;
          }
        }
      }
      
      // SEGUNDO: Verificar atributos width/height del elemento
      const attrWidth = imgElement.getAttribute('width');
      const attrHeight = imgElement.getAttribute('height');
      if (attrWidth) {
        const widthNum = Number.parseFloat(attrWidth);
        // Solo considerar icono si es < 100px (más estricto para evitar falsos positivos)
        if (widthNum > 0 && widthNum < 100) return true;
        // Si es >= 150px, definitivamente NO es un icono
        if (widthNum >= 150) return false;
      }
      if (attrHeight) {
        const heightNum = Number.parseFloat(attrHeight);
        // Solo considerar icono si es < 100px
        if (heightNum > 0 && heightNum < 100) return true;
        // Si es >= 150px, definitivamente NO es un icono
        if (heightNum >= 150) return false;
      }
      
      // TERCERO: Verificar el tamaño actual renderizado (solo si no hay tamaño natural)
      if (imgElement instanceof HTMLImageElement && (!imgElement.complete || imgElement.naturalWidth === 0)) {
        const computedStyle = globalThis.getComputedStyle(imgElement);
        const width = Number.parseFloat(computedStyle.width) || imgElement.clientWidth;
        const height = Number.parseFloat(computedStyle.height) || imgElement.clientHeight;
        
        // Solo considerar icono si es < 100px y no hay indicios de que sea grande
        if (width > 0 && width < 100 && height > 0 && height < 100) {
          return true;
        }
      }
      
      // Por defecto, NO es un icono pequeño (ser conservador)
      return false;
    };

    // Aplicar estilos al wrapper de iconos
    applyWithRetry('.section-card-icon-wrapper', (el: HTMLElement) => {
      // Verificar que NO sea parte de un grid-item
      if (el.closest('.grid-item-image') || el.closest('.grid-item-content') || el.closest('.grid-image-container')) {
        return; // No aplicar a grid-items
      }
      el.style.setProperty('position', 'relative', 'important');
      el.style.setProperty('z-index', '1', 'important');
      el.style.setProperty('flex-shrink', '0', 'important');
      el.style.setProperty('order', '1', 'important');
      el.style.setProperty('margin-bottom', '16px', 'important');
      el.style.setProperty('display', 'flex', 'important');
      el.style.setProperty('align-items', 'flex-start', 'important');
      el.style.setProperty('justify-content', 'flex-start', 'important');
      el.style.setProperty('width', '100%', 'important');
    });

    // Aplicar tamaño solo a iconos pequeños (detección por píxeles)
    // IMPORTANTE: En section-cards, iconos pequeños van a 50px, imágenes grandes a 100%
    applyWithRetry('.icon-image-container', (el: HTMLElement) => {
      // Verificar que NO sea parte de un grid-image-container (imágenes/marcas)
      if (el.closest('.grid-image-container') || el.classList.contains('grid-image-container')) {
        return; // No aplicar a imágenes/marcas
      }
      // Verificar que NO sea parte de un botón (v-btn) - los iconos de botones deben mantener su tamaño
      if (el.closest('.v-btn, button, [role="button"]')) {
        return; // No aplicar a iconos dentro de botones
      }
      
      // Buscar la imagen dentro del contenedor para verificar su tamaño
      const imgElement = el.querySelector('img, .icon-image, .icon-image-svg') as HTMLImageElement | HTMLElement | null;
      if (!imgElement) return;
      
      // Verificar si está dentro de un section-card
      const isInSectionCard = el.closest('.section-card') !== null;
      
      // Si la imagen aún no se ha cargado, esperar a que se cargue
      if (imgElement instanceof HTMLImageElement && !imgElement.complete) {
        const applyStyles = () => {
          if (isSmallIcon(imgElement)) {
            // Es un icono pequeño
            const iconSize = isInSectionCard ? '50px' : '160px'; // 50px en section-cards, 160px en otros lugares
            ['width', 'height', 'max-width', 'max-height', 'min-width', 'min-height'].forEach(prop => {
              el.style.setProperty(prop, iconSize, 'important');
            });
            el.style.setProperty('position', 'relative', 'important');
            el.style.setProperty('z-index', '1', 'important');
            el.style.setProperty('flex-shrink', '0', 'important');
            el.style.setProperty('margin', '0', 'important');
            el.style.setProperty('display', 'flex', 'important');
            el.style.setProperty('align-items', 'center', 'important');
            el.style.setProperty('justify-content', 'center', 'important');
          } else if (isInSectionCard) {
            // Es una imagen grande en section-card, usar 100%
            el.style.setProperty('width', '100%', 'important');
            el.style.setProperty('height', '100%', 'important');
            el.style.setProperty('max-width', '100%', 'important');
            el.style.setProperty('max-height', '100%', 'important');
            el.style.setProperty('min-width', '0', 'important');
            el.style.setProperty('min-height', '0', 'important');
          }
        };
        imgElement.addEventListener('load', applyStyles, { once: true });
        // También aplicar si ya tiene atributos width/height
        if (imgElement.getAttribute('width') || imgElement.getAttribute('height')) {
          applyStyles();
        }
        return;
      }
      
      // Si NO es un icono pequeño
      if (!isSmallIcon(imgElement)) {
        // Si está en section-card, aplicar 100% para imágenes grandes
        if (isInSectionCard) {
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('height', '100%', 'important');
          el.style.setProperty('max-width', '100%', 'important');
          el.style.setProperty('max-height', '100%', 'important');
          el.style.setProperty('min-width', '0', 'important');
          el.style.setProperty('min-height', '0', 'important');
        }
        return; // Es una imagen grande, dejarla como está
      }
      
      // Es un icono pequeño, aplicar tamaño según el contexto
      const iconSize = isInSectionCard ? '50px' : '160px'; // 50px en section-cards, 160px en otros lugares
      ['width', 'height', 'max-width', 'max-height', 'min-width', 'min-height'].forEach(prop => {
        el.style.setProperty(prop, iconSize, 'important');
      });
      el.style.setProperty('position', 'relative', 'important');
      el.style.setProperty('z-index', '1', 'important');
      el.style.setProperty('flex-shrink', '0', 'important');
      el.style.setProperty('margin', '0', 'important');
      el.style.setProperty('display', 'flex', 'important');
      el.style.setProperty('align-items', 'center', 'important');
      el.style.setProperty('justify-content', 'center', 'important');
    });

    // Aplicar tamaño solo a imágenes pequeñas (iconos) dentro de icon-image-container
    // IMPORTANTE: En section-cards, iconos pequeños van a 50px, imágenes grandes a 100%
    applyWithRetry('.icon-image-container .icon-image, .icon-image-container img, .icon-image-container .icon-image-svg, .icon-image, .section-card-icon-container .icon-image-container .icon-image, .section-card-icon-container .icon-image-container img, .section-card-icon-container .icon-image', (el: HTMLElement) => {
      // Verificar que NO sea parte de un grid-image-container
      if (el.closest('.grid-image-container')) {
        return; // No aplicar a imágenes/marcas
      }
      // Verificar que NO sea parte de un botón (v-btn) - los iconos de botones deben mantener su tamaño
      if (el.closest('.v-btn, button, [role="button"]')) {
        return; // No aplicar a iconos dentro de botones
      }
      // Verificar que NO sea parte de un grid-item que contenga imágenes
      const parentGrid = el.closest('.grid-item-image, .grid-item-content');
      if (parentGrid && parentGrid.querySelector('.grid-image-container')) {
        return; // No aplicar si está en un grid-item con imágenes
      }
      
      // Verificar si está dentro de un section-card
      const isInSectionCard = el.closest('.section-card') !== null;
      
      // Si la imagen aún no se ha cargado, esperar a que se cargue
      if (el instanceof HTMLImageElement && !el.complete) {
        const applyStyles = () => {
          if (isSmallIcon(el)) {
            // Es un icono pequeño
            const iconSize = isInSectionCard ? '50px' : '160px'; // 50px en section-cards, 160px en otros lugares
            ['width', 'height', 'max-width', 'max-height', 'min-width', 'min-height'].forEach(prop => {
              el.style.setProperty(prop, iconSize, 'important');
            });
            el.style.setProperty('object-fit', 'contain', 'important');
            el.style.setProperty('object-position', 'center', 'important');
            el.style.setProperty('position', 'relative', 'important');
            el.style.setProperty('z-index', '1', 'important');
            el.style.setProperty('flex-shrink', '0', 'important');
            el.style.setProperty('margin', '0', 'important');
            el.style.setProperty('display', 'block', 'important');
          } else if (isInSectionCard) {
            // Es una imagen grande en section-card, usar 100%
            el.style.setProperty('width', '100%', 'important');
            el.style.setProperty('height', '100%', 'important');
            el.style.setProperty('max-width', '100%', 'important');
            el.style.setProperty('max-height', '100%', 'important');
            el.style.setProperty('min-width', '0', 'important');
            el.style.setProperty('min-height', '0', 'important');
            el.style.setProperty('object-fit', 'contain', 'important');
            el.style.setProperty('object-position', 'center', 'important');
          }
        };
        el.addEventListener('load', applyStyles, { once: true });
        // También aplicar si ya tiene atributos width/height
        if (el.getAttribute('width') || el.getAttribute('height')) {
          applyStyles();
        }
        return;
      }
      
      // Verificar si es un icono pequeño basado en el tamaño
      if (!isSmallIcon(el as HTMLImageElement)) {
        // Si está en section-card, aplicar 100% para imágenes grandes
        if (isInSectionCard) {
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('height', '100%', 'important');
          el.style.setProperty('max-width', '100%', 'important');
          el.style.setProperty('max-height', '100%', 'important');
          el.style.setProperty('min-width', '0', 'important');
          el.style.setProperty('min-height', '0', 'important');
          el.style.setProperty('object-fit', 'contain', 'important');
          el.style.setProperty('object-position', 'center', 'important');
        }
        return; // Es una imagen grande, dejarla como está
      }
      
      // Es un icono pequeño, aplicar tamaño según el contexto
      const iconSize = isInSectionCard ? '50px' : '160px'; // 50px en section-cards, 160px en otros lugares
      ['width', 'height', 'max-width', 'max-height', 'min-width', 'min-height'].forEach(prop => {
        el.style.setProperty(prop, iconSize, 'important');
      });
      el.style.setProperty('object-fit', 'contain', 'important');
      el.style.setProperty('object-position', 'center', 'important');
      el.style.setProperty('position', 'relative', 'important');
      el.style.setProperty('z-index', '1', 'important');
      el.style.setProperty('flex-shrink', '0', 'important');
      el.style.setProperty('margin', '0', 'important');
      el.style.setProperty('display', 'block', 'important');
    });

    // Asegurar que el texto no se monte sobre los iconos y esté alineado a la izquierda
    applyWithRetry('.section-card-text', (el: HTMLElement) => {
      el.style.setProperty('position', 'relative', 'important');
      el.style.setProperty('z-index', '1', 'important');
      el.style.setProperty('order', '2', 'important');
      el.style.setProperty('flex-shrink', '0', 'important');
      el.style.setProperty('margin-top', 'auto', 'important');
      el.style.setProperty('text-align', 'left', 'important');
      el.style.setProperty('width', '100%', 'important');
    });

    applyWithRetry('.section-card-content-text', (el: HTMLElement) => {
      el.style.setProperty('text-align', 'left', 'important');
    });

    // Asegurar que el contenido de la tarjeta esté alineado a la izquierda
    applyWithRetry('.section-card-content', (el: HTMLElement) => {
      el.style.setProperty('align-items', 'flex-start', 'important');
      el.style.setProperty('text-align', 'left', 'important');
    });

    // 3. Contenedores de imágenes en grids - Detectar si es icono (50px) o imagen grande (100%)
    applyWithRetry('.grid-item-image .card-image-container.grid-image-container, .grid-item-content .card-image-container.grid-image-container', (el: HTMLElement) => {
      // Buscar la imagen dentro del contenedor para verificar si es un icono
      const imgElement = el.querySelector('img, .card-image, picture img, nuxt-img') as HTMLImageElement | HTMLElement | null;
      
      // Función para aplicar estilos según el tipo
      const applyContainerStyles = () => {
        if (imgElement && isSmallIcon(imgElement)) {
          // Es un icono pequeño, aplicar tamaño fijo de 50px
          el.style.setProperty('width', '50px', 'important');
          el.style.setProperty('height', '50px', 'important');
          el.style.setProperty('max-width', '50px', 'important');
          el.style.setProperty('max-height', '50px', 'important');
          el.style.setProperty('min-width', '50px', 'important');
          el.style.setProperty('min-height', '50px', 'important');
        } else {
          // Es una imagen grande (logo), mantener 100% (flexible) y asegurar que no tenga restricciones
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('height', '100%', 'important');
          el.style.setProperty('max-width', '100%', 'important');
          el.style.setProperty('max-height', '100%', 'important');
          el.style.setProperty('min-width', '0', 'important');
          el.style.setProperty('min-height', '0', 'important');
        }
      };
      
      // Si la imagen aún no se ha cargado, esperar a que se cargue
      if (imgElement instanceof HTMLImageElement && !imgElement.complete) {
        imgElement.addEventListener('load', applyContainerStyles, { once: true });
      }
      
      // Aplicar estilos inmediatamente
      applyContainerStyles();
      
      el.style.setProperty('display', 'flex', 'important');
      el.style.setProperty('align-items', 'center', 'important');
      el.style.setProperty('justify-content', 'center', 'important');
      el.style.setProperty('padding', '12px', 'important');
      el.style.setProperty('box-sizing', 'border-box', 'important');
      el.style.setProperty('overflow', 'visible', 'important');
      // Remover estilos inline que puedan estar causando problemas
      el.style.removeProperty('--aspect-ratio');
      el.style.removeProperty('aspect-ratio');
    });
    
    // 3.1. Aplicar 50px al grid-layout SOLO cuando contiene un icono pequeño
    // Si contiene una imagen grande, NO modificar el grid-layout (dejar que use su tamaño natural)
    applyWithRetry('.grid-layout', (el: HTMLElement) => {
      // Verificar si contiene un grid-item-image con un icono
      const gridItemImage = el.querySelector('.grid-item-image .card-image-container.grid-image-container');
      if (gridItemImage) {
        const imgElement = gridItemImage.querySelector('img, .card-image, picture img, nuxt-img') as HTMLImageElement | HTMLElement | null;
        
        // SOLO si es un icono pequeño, aplicar 50px al grid-layout
        if (imgElement && isSmallIcon(imgElement)) {
          el.style.setProperty('width', '50px', 'important');
          el.style.setProperty('height', '50px', 'important');
          el.style.setProperty('min-width', '50px', 'important');
          el.style.setProperty('min-height', '50px', 'important');
        } else {
          // Es una imagen grande, NO modificar el grid-layout (dejar que use su tamaño natural/grid)
          // Remover cualquier estilo de 50px que pueda haber quedado
          el.style.removeProperty('width');
          el.style.removeProperty('height');
          el.style.removeProperty('min-width');
          el.style.removeProperty('min-height');
        }
      }
    });

    // 4. Imágenes/marcas dentro de grid-image-container - Usar contain para ver la marca completa
    // Si es un icono, usar 50px; si es imagen grande, usar 100%
    applyWithRetry('.grid-item-image .card-image-container.grid-image-container .card-image, .grid-item-image .card-image-container.grid-image-container img, .grid-item-content .card-image-container.grid-image-container .card-image, .grid-item-content .card-image-container.grid-image-container img, .grid-item-image .card-image-container.grid-image-container picture, .grid-item-content .card-image-container.grid-image-container picture, .grid-item-image .card-image-container.grid-image-container picture img, .grid-item-content .card-image-container.grid-image-container picture img', (el: HTMLElement) => {
      // Verificar si es un icono pequeño
      if (isSmallIcon(el as HTMLImageElement)) {
        // Es un icono, usar 50px
        el.style.setProperty('width', '50px', 'important');
        el.style.setProperty('height', '50px', 'important');
        el.style.setProperty('max-width', '50px', 'important');
        el.style.setProperty('max-height', '50px', 'important');
        el.style.setProperty('min-width', '50px', 'important');
        el.style.setProperty('min-height', '50px', 'important');
      } else {
        // Es una imagen grande, usar 100% del contenedor
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('height', '100%', 'important');
        el.style.setProperty('max-width', '100%', 'important');
        el.style.setProperty('max-height', '100%', 'important');
      }
      el.style.setProperty('object-fit', 'contain', 'important');
      el.style.setProperty('object-position', 'center', 'important');
      el.style.setProperty('display', 'block', 'important');
    });

    // 5. Asegurar que NuxtImg dentro de grid-image-container también use contain
    // Si es un icono, usar 50px; si es imagen grande, usar 100%
    applyWithRetry('.grid-item-image .card-image-container.grid-image-container nuxt-img, .grid-item-content .card-image-container.grid-image-container nuxt-img', (el: HTMLElement) => {
      // Verificar si es un icono pequeño (buscar la imagen real dentro de nuxt-img)
      const actualImg = el.querySelector('img') as HTMLImageElement | null;
      const imgToCheck = actualImg || el;
      
      if (isSmallIcon(imgToCheck as HTMLImageElement)) {
        // Es un icono, usar 50px
        el.style.setProperty('width', '50px', 'important');
        el.style.setProperty('height', '50px', 'important');
        el.style.setProperty('max-width', '50px', 'important');
        el.style.setProperty('max-height', '50px', 'important');
        el.style.setProperty('min-width', '50px', 'important');
        el.style.setProperty('min-height', '50px', 'important');
      } else {
        // Es una imagen grande, usar 100% del contenedor
        el.style.setProperty('width', '100%', 'important');
        el.style.setProperty('height', '100%', 'important');
        el.style.setProperty('max-width', '100%', 'important');
        el.style.setProperty('max-height', '100%', 'important');
      }
      el.style.setProperty('object-fit', 'contain', 'important');
      el.style.setProperty('object-position', 'center', 'important');
      el.style.setProperty('display', 'block', 'important');
    });
  }

  // Navegar a un canal específico
  public navigateToChannel(slug: string) {
    this.$router.push(`/canales/${slug}`);
  }

  // Actualizar canal basado en slug
  public async updateChannelBySlug(slug: string | string[]) {
    const normalizedSlug = typeof slug === 'string' ? slug : slug?.[0] || '';
    
    if (!normalizedSlug) {
      // Si no hay slug, usar el primer canal
      if (this.channels.length > 0) {
        const channelsFinal = this.channels.map((post: ChannelsInterface) => ({
          ...post,
          sections: this.decryptBaseToHtml(post.sections),
        }));
        this.channel = channelsFinal.at(0);
        this.setActiveTab();
      }
      return;
    }

    // Buscar el canal en la lista de canales cargados
    if (this.channels.length > 0) {
      const channelsFinal = this.channels.map((post: ChannelsInterface) => ({
        ...post,
        sections: this.decryptBaseToHtml(post.sections),
      }));
      
      const foundChannel = channelsFinal.find(
        (post: ChannelsInterface) => post.slug === normalizedSlug
      );
      
      if (foundChannel) {
        this.channel = foundChannel;
        this.setActiveTab();
      } else {
        // Si no se encuentra en la lista, hacer query individual
        await this.getChannelBySlug(normalizedSlug);
      }
    } else {
      // Si aún no hay canales cargados, hacer query individual
      await this.getChannelBySlug(normalizedSlug);
    }
  }

  // Obtener canal individual por slug
  public async getChannelBySlug(slug: string) {
    try {
      const findChannelDto = {
        slug: slug,
      };
      const { data } = await this.$apollo.query({
        query: GET_CHANNEL_POST_BY_SLUG,
        variables: findChannelDto,
        fetchPolicy: "no-cache",
      });

      if (data.findChannelById) {
        const channelData = {
          ...data.findChannelById,
          sections: this.decryptBaseToHtml(data.findChannelById.sections),
        };
        this.channel = channelData;
        this.setActiveTab();
      }
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // Establecer tab activo basado en el canal actual
  public setActiveTab() {
    if (this.channel && this.channels.length > 0) {
      const index = this.channels.findIndex(
        (c) => c.slug === this.channel?.slug
      );
      if (index !== -1) {
        this.activeTab = index;
      }
    }
    // Aplicar estilos después de establecer el tab
    this.$nextTick(() => {
      this.applyChannelStyles();
    });
  }

  // Scroll de navegación
  public scrollNav() {
    const navContainer = document.getElementById("nav-container");
    if (navContainer) {
      navContainer.scrollBy({ left: 200, behavior: "smooth" });
    }
  }


  // DECRYPT BASE64 TEXT TO HTML
  public decryptBaseToHtml(sections: Array<SectionTypeInterface>) {
    return sections.map((section: any) => {
      return {
        ...section,
        text: section.text ? decrypt(section.text) : "",
      };
    });
  }

  // GET SHORTCUTS BY TARGET
  public async getChannels() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CHANNELS_POST,
        fetchPolicy: "no-cache",
      });

      // SET CATEGORIES
      this.channels = data.findChannelsPostPublic.filter(
        (channel: ChannelsInterface) => channel.disabled !== true
      );
      
      // Actualizar el canal basado en el pageParam actual
      const normalizedParam = typeof this.pageParam === 'string' 
        ? this.pageParam 
        : Array.isArray(this.pageParam) 
          ? this.pageParam[0] || ''
          : '';
      
      await this.updateChannelBySlug(normalizedParam || '');
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }
}
export default ChannelsDetailScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <div>
    <!-- Navegación de canales con Vuetify -->
    <v-card class="navs-container elevation-10" rounded="xl">
      <v-card-text class="pa-0">
        <div class="d-flex align-center justify-space-between">
          <v-tabs
            v-model="activeTab"
            class="nav-container"
            align-tabs="start"
            slider-color="primary"
            hide-slider
          >
            <v-tab
              v-for="channel_item in channels"
              :key="channel_item.slug"
              :href="`/canales/${channel_item?.slug}`"
              :class="{
                'item-nav-active': channel?.slug === channel_item.slug,
              }"
              class="item-nav"
              @click.prevent="navigateToChannel(channel_item.slug)"
            >
              {{ channel_item.title }}
            </v-tab>
          </v-tabs>
          <div class="btn-action-nav-container">
            <v-btn
              id="btn-action-nav"
              icon
              variant="text"
              class="btn-action-nav"
              @click="scrollNav"
            >
              <v-icon>mdi-chevron-right</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- Contenido principal con Vuetify -->
    <div class="pages-container channels-page-container">
      <v-row no-gutters class="page-one-container">
        <v-col cols="12" class="page-one-banner-container" v-if="channel">
          <img
            class="page-one-banner"
            :src="channel?.banner ?? channel?.bannerImageDetail?.image ?? ''"
            :alt="channel?.bannerImageDetail?.altText ?? ''"
          />
        </v-col>
        <v-col cols="12" class="page-one-info-one-container" v-if="channel && channel.sections">
          <app-sections-component :sections="channel.sections" />
        </v-col>
        <v-col cols="12" v-else-if="channels.length > 0 && !channel" class="text-center pa-8">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <p class="mt-4">Cargando canal...</p>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>

/* Contenedor de tarjetas */
.channels-page-container ::v-deep(.section-card) {
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: box-shadow 0.3s ease !important;
  overflow: hidden !important;
}

.channels-page-container ::v-deep(.section-card:hover) {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Contenedor de contenido de tarjeta */
.channels-page-container ::v-deep(.section-card-content) {
  display: flex !important;
  flex-direction: column !important;
  align-items: flex-start !important;
  text-align: left !important;
  padding: 20px 16px !important;
  height: 100% !important;
  position: relative !important;
  z-index: 1 !important;
}

/* Icono alineado a la izquierda - Dentro del flujo del contenedor */
.channels-page-container ::v-deep(.section-card-icon-wrapper) {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  width: 100% !important;
  margin-bottom: 16px !important;
  position: relative !important;
  z-index: 1 !important;
  flex-shrink: 0 !important;
  order: 1 !important;
}

.channels-page-container ::v-deep(.section-card-icon-container) {
  display: flex !important;
  align-items: flex-start !important;
  justify-content: flex-start !important;
  width: auto !important;
  height: auto !important;
  position: relative !important;
  z-index: 1 !important;
  flex-shrink: 0 !important;
}

/* ============================================
   ICONOS EN CANALES - DETECCIÓN INTELIGENTE POR PÍXELES
   La lógica JavaScript detecta automáticamente iconos pequeños vs imágenes grandes
   Los estilos CSS aquí son solo de respaldo y para casos específicos
   ============================================ */

/* Los iconos de section-card ahora se manejan dinámicamente vía JavaScript */
/* Si son iconos pequeños (< 150px), se agrandan a 160px */
/* Si son imágenes grandes (>= 150px), se mantienen como están */
/* Los estilos de 64px del componente cards/index.vue se sobrescriben dinámicamente */

/* Excepciones: NO aplicar a grid-image-container (imágenes/logos grandes) */
.channels-page-container ::v-deep(.grid-image-container .icon-image-container),
.channels-page-container ::v-deep(.grid-image-container .icon-image-container .icon-image),
.channels-page-container ::v-deep(.grid-image-container .icon-image-container img),
.channels-page-container ::v-deep(.grid-image-container .icon-image-container .icon-image-svg),
.channels-page-container ::v-deep(.grid-image-container) {
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
}

/* Excepciones: NO aplicar a iconos dentro de botones - deben mantener su tamaño original */
.channels-page-container ::v-deep(.v-btn .icon-image-container),
.channels-page-container ::v-deep(.v-btn .icon-image-container .icon-image),
.channels-page-container ::v-deep(.v-btn .icon-image-container img),
.channels-page-container ::v-deep(.v-btn .icon-image-container .icon-image-svg),
.channels-page-container ::v-deep(button .icon-image-container),
.channels-page-container ::v-deep(button .icon-image-container .icon-image),
.channels-page-container ::v-deep(button .icon-image-container img),
.channels-page-container ::v-deep(button .icon-image-container .icon-image-svg) {
  width: auto !important;
  height: auto !important;
  max-width: 100% !important;
  max-height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
}

/* Los estilos para iconos pequeños se aplican dinámicamente vía JavaScript */
/* basándose en la detección del tamaño natural de la imagen */

/* Texto alineado a la izquierda */
.channels-page-container ::v-deep(.section-card-text) {
  text-align: left !important;
  width: 100% !important;
  margin-top: auto !important;
  position: relative !important;
  z-index: 1 !important;
  order: 2 !important;
  flex-shrink: 0 !important;
}

.channels-page-container ::v-deep(.section-card-content-text) {
  text-align: left !important;
  margin: 0 !important;
  position: relative !important;
  z-index: 1 !important;
  display: block !important;
  width: 100% !important;
}

/* ============================================
   NAVEGACIÓN - ESTILOS CON VUETIFY
   ============================================ */
.navs-container {
  width: 80%;
  border-radius: 30px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 25px;
  margin-top: 20px;
  background-color: #fafffb;
}

.nav-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  flex-wrap: nowrap;
  
  /* Ocultar scrollbar pero mantener funcionalidad */
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  &::-webkit-scrollbar {
    display: none;
  }
}

/* Estilos para tabs de Vuetify */
.item-nav {
  font-weight: 400;
  color: #3f4443;
  font-size: 12px !important;
  text-transform: capitalize !important;
  min-width: auto !important;
  padding: 10px 16px !important;
  margin: 0 !important;
  
  &::before {
    display: none !important;
  }
}

.item-nav-active {
  font-weight: 700 !important;
  color: #000000 !important;
  border-bottom: 3px solid #12b041 !important;
  transition: all ease-in-out 0.3s;
}

.btn-action-nav-container {
  height: 35px;
  position: relative;
  display: flex;
  align-items: center;
  padding-right: 10px;
}

.btn-action-nav {
  background-color: #d9efe2 !important;
  color: #12b041 !important;
  min-width: 30px !important;
  width: 30px !important;
  height: 30px !important;
}

/* Contenedores principales */
.pages-container {
  width: 100%;
}

.page-one-container {
  width: 100%;
  margin: 0;
  padding: 0;
}

/* Responsive para móviles */
@media (max-width: 768px) {
  .navs-container {
    width: 100% !important;
    border-radius: 0 !important;
    margin-bottom: 0;
  }

  .nav-container {
    width: 100% !important;
    overflow-x: scroll !important;
    margin: 10px 0;
    padding: 0 20px;
  }
}

/* ============================================
   BANNER PRINCIPAL
   ============================================ */
.page-one-banner-container {
  width: 100%;
  position: relative;
  overflow: hidden;
  background-color: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 350px;
  min-height: 400px;
  max-height: 350px;
  @supports (aspect-ratio: 16 / 9) {
    aspect-ratio: 16 / 9;
    height: auto;
  }
}

.page-one-banner {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  object-position: center !important;
  display: block !important;
}

.page-one-info-one-container {
  width: 100%;
}
</style>

<!-- ESTILOS SIN SCOPED PARA SOBRESCRIBIR ESTILOS SCOPED DE GRID-ITEM -->
<!-- Estos estilos sobrescriben los estilos scoped de grid-item/index.vue -->
<style lang="scss">
/* ============================================
   SOBRESCRIBIR ESTILOS SCOPED DE GRID-ITEM
   Solo se aplican cuando están dentro de .channels-page-container
   ============================================ */

/* Sobrescribir overflow hidden de grid-item-image.grid-item-content */
.channels-page-container .grid-item-image.grid-item-content {
  overflow: visible !important;
}

/* Contenedores de imágenes en grids - Para marcas/logos - Flexibles para contain */
.channels-page-container .grid-item-image .card-image-container.grid-image-container,
.channels-page-container .grid-item-content .card-image-container.grid-image-container {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  padding: 12px !important;
  box-sizing: border-box !important;
  overflow: visible !important;
}

/* Media queries para asegurar contain en imágenes/marcas */
@media (min-width: 1920px) and (max-width: 2559px) {
  .channels-page-container .grid-item-image .card-image-container.grid-image-container,
  .channels-page-container .grid-item-content .card-image-container.grid-image-container {
    width: 100% !important;
    height: 100% !important;
    padding: 12px !important;
  }
  
  .channels-page-container .grid-item-image .card-image-container.grid-image-container .card-image,
  .channels-page-container .grid-item-image .card-image-container.grid-image-container img,
  .channels-page-container .grid-item-content .card-image-container.grid-image-container .card-image,
  .channels-page-container .grid-item-content .card-image-container.grid-image-container img {
    object-fit: contain !important;
    object-position: center !important;
  }
}

@media (min-width: 2560px) {
  .channels-page-container .grid-item-image .card-image-container.grid-image-container,
  .channels-page-container .grid-item-content .card-image-container.grid-image-container {
    width: 100% !important;
    height: 100% !important;
    padding: 12px !important;
  }
  
  .channels-page-container .grid-item-image .card-image-container.grid-image-container .card-image,
  .channels-page-container .grid-item-image .card-image-container.grid-image-container img,
  .channels-page-container .grid-item-content .card-image-container.grid-image-container .card-image,
  .channels-page-container .grid-item-content .card-image-container.grid-image-container img {
    object-fit: contain !important;
    object-position: center !important;
  }
}


/* Imágenes/marcas dentro de grid-image-container - Usar contain para ver la marca completa */
.channels-page-container .grid-item-image .card-image-container.grid-image-container .card-image,
.channels-page-container .grid-item-image .card-image-container.grid-image-container img,
.channels-page-container .grid-item-content .card-image-container.grid-image-container .card-image,
.channels-page-container .grid-item-content .card-image-container.grid-image-container img,
.channels-page-container .grid-item-image .card-image-container.grid-image-container picture,
.channels-page-container .grid-item-content .card-image-container.grid-image-container picture,
.channels-page-container .grid-item-image .card-image-container.grid-image-container picture img,
.channels-page-container .grid-item-content .card-image-container.grid-image-container picture img {
  width: 100% !important;
  height: 100% !important;
  max-width: 100% !important;
  max-height: 100% !important;
  object-fit: contain !important;
  object-position: center !important;
  display: block !important;
}

/* ============================================
   TARJETAS EN CANALES - Bordes alternados azul/verde y tamaño forzado
   ============================================ */

/* Estilos básicos para tarjetas - Consolidado */
.channels-page-container .section-card {
  border-bottom-width: 3px !important;
  border-bottom-style: solid !important;
  border-radius: 8px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
  transition: box-shadow 0.3s ease !important;
}

.channels-page-container .section-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}

/* Bordes inferiores alternados - Azul y Verde (solo para sectionCards) */
.channels-page-container .v-row .v-col:nth-child(odd) .section-card {
  border-bottom: 3px solid #12499b !important; /* Azul */
}

.channels-page-container .v-row .v-col:nth-child(even) .section-card {
  border-bottom: 3px solid #4caf35 !important; /* Verde */
}

/* Asegurar alineación correcta de las columnas */
.channels-page-container ::v-deep(.v-row .v-col) {
  display: flex !important;
  align-items: stretch !important;
}

/* ============================================
   ESTILOS BASE PARA GRID-ITEM - TODAS LAS RESOLUCIONES
   ============================================ */

/* Ajustar tarjetas dentro de grid-item para resoluciones grandes */
.channels-page-container ::v-deep(.v-card) {
  box-sizing: border-box !important;
  width: 100% !important;
  max-width: 100% !important;
}

/* Asegurar que las tarjetas de grid-item (no section-card) tengan comportamiento consistente */
.channels-page-container ::v-deep(.v-card:not(.section-card)) {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  min-width: auto !important;
}

/* Forzar estilos en tarjetas que contienen grid-component */
.channels-page-container ::v-deep(.v-card .grid-component),
.channels-page-container ::v-deep(.v-card[class*="grid-"]) {
  width: 100% !important;
  max-width: 100% !important;
}

/* Asegurar que las columnas de grid-item mantengan proporciones correctas */
.channels-page-container ::v-deep(.v-col:has(.grid-component) .v-card),
.channels-page-container ::v-deep(.v-col:has(.grid-layout) .v-card) {
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
}

/* ============================================
   MEDIA QUERIES PARA DIFERENTES RESOLUCIONES
   ============================================ */

/* Resoluciones xl (>= 1280px y < 1920px) */
@media (min-width: 1280px) and (max-width: 1919px) {
  .channels-page-container ::v-deep(.v-row .v-col .v-card) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  /* Ajustar grid items pequeños para que se vean mejor en xl */
  .channels-page-container ::v-deep(.v-col[class*="xl-1"] .v-card),
  .channels-page-container ::v-deep(.v-col[class*="xl-2"] .v-card) {
    width: 100% !important;
    max-width: 100% !important;
    min-width: auto !important;
    box-sizing: border-box !important;
  }
  
  /* Asegurar que las columnas xl-1 y xl-2 tengan un tamaño mínimo razonable */
  .channels-page-container ::v-deep(.v-col[class*="xl-1"]) {
    flex: 0 0 auto !important;
    min-width: 120px !important;
  }
  
  .channels-page-container ::v-deep(.v-col[class*="xl-2"]) {
    flex: 0 0 auto !important;
    min-width: 200px !important;
  }
  
  /* Forzar estilos en todas las tarjetas de grid-item */
  .channels-page-container ::v-deep(.v-card:not(.section-card)) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}

/* Resoluciones xxl (>= 1920px y < 2560px) - RANGO CRÍTICO */
@media (min-width: 1920px) and (max-width: 2559px) {
  /* Forzar estilos en todas las tarjetas de grid-item */
  .channels-page-container ::v-deep(.v-row .v-col .v-card),
  .channels-page-container ::v-deep(.v-card:not(.section-card)) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
    min-width: auto !important;
  }
  
  /* Ajustar columnas xxl para grid items pequeños - Estilos consistentes */
  .channels-page-container ::v-deep(.v-col[class*="xxl-1"] .v-card),
  .channels-page-container ::v-deep(.v-col[class*="xxl-2"] .v-card),
  .channels-page-container ::v-deep(.v-col[class*="xl-1"] .v-card),
  .channels-page-container ::v-deep(.v-col[class*="xl-2"] .v-card) {
    width: 100% !important;
    max-width: 100% !important;
    min-width: auto !important;
    box-sizing: border-box !important;
  }
  
  /* Asegurar que las columnas tengan un tamaño mínimo razonable */
  .channels-page-container ::v-deep(.v-col[class*="xxl-1"]) {
    flex: 0 0 auto !important;
    min-width: 135px !important;
    max-width: none !important;
  }
  
  .channels-page-container ::v-deep(.v-col[class*="xxl-2"]) {
    flex: 0 0 auto !important;
    min-width: 235px !important;
    max-width: none !important;
  }
  
  /* Ajustar columnas xl y xxl para que las tarjetas se vean bien */
  .channels-page-container ::v-deep(.v-col[class*="xl-"]),
  .channels-page-container ::v-deep(.v-col[class*="xxl-"]) {
    flex: 0 0 auto !important;
  }
  
  /* Forzar estilos en tarjetas que contienen grid-component */
  .channels-page-container ::v-deep(.v-card .grid-component),
  .channels-page-container ::v-deep(.v-card[class*="grid-"]) {
    width: 100% !important;
    max-width: 100% !important;
  }
}

/* Ajustar para resoluciones >= 2560px */
@media (min-width: 2560px) {
  .channels-page-container ::v-deep(.v-row .v-col .v-card) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
  
  /* Ajustar grid items pequeños para resoluciones muy grandes */
  .channels-page-container ::v-deep(.v-col[class*="xxl-1"]) {
    flex: 0 0 auto !important;
    min-width: 180px !important;
  }
  
  .channels-page-container ::v-deep(.v-col[class*="xxl-2"]) {
    flex: 0 0 auto !important;
    min-width: 300px !important;
  }
  
  /* Asegurar que todas las tarjetas de grid-item tengan el mismo comportamiento */
  .channels-page-container ::v-deep(.v-card:not(.section-card)) {
    width: 100% !important;
    max-width: 100% !important;
    box-sizing: border-box !important;
  }
}

</style>
