<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Watch } from "vue-facing-decorator";

// IMPORT INTERFACES
import type { HeaderOptions } from "~/interfaces/header.interface";
import type { DrawerCalculatorsPropsInterface } from "~/interfaces/calculators.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";

// IMPORT OPTIMIZED IMAGE COMPONENTS
import IconImage from "~/components/optimized-image/IconImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "app-header-component",
  components: {
    IconImage,
  },
})
export default class AppHeaderComponent extends Vue {
  ///////////
  // PROPS //
  ///////////

  @Prop({
    default: {
      show: true,
      absolute: false,
      notification: [],
      seasons: [],
      products: {
        cards: [],
        deposits: [],
        accounts: [],
        loans: [],
        global: [],
      },
      about: [],
    },
  })
  options!: HeaderOptions;

  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE
  public $bus: any;

  // SEARCH PARAM
  public param: string = "";

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  public created() {
    // this.setCategoryFeatured();
  }

  /////////////
  // METHODS //
  /////////////

  // SET FEATURE CATEGORY MENU
  public get setCategoryFeatured(): {
    categoryFeatured: CategoriesInterface | undefined;
    aboutCategories: Array<CategoriesInterface>;
  } {
    const findCategoryFeatured = this.options.about.find(
      (cats: CategoriesInterface) =>
        cats.name.toLowerCase() === "tarifarios y tasas" ||
        cats.name.toLowerCase() === "tarifarías y tasas"
    );
    const cleanCategoriesAbout = this.options.about.filter(
      (cats: CategoriesInterface) =>
        cats.name.toLowerCase() !== "tarifarios y tasas" &&
        cats.name.toLowerCase() !== "tarifarías y tasas"
    );

    return {
      categoryFeatured: findCategoryFeatured,
      aboutCategories: cleanCategoriesAbout,
    };
  }

  // SHOW DRAWER CALCULATOR EMIT
  public openDrawerCalculator(payload: DrawerCalculatorsPropsInterface) {
    // SHOW DRAWER CALCULATOR
    this.$bus.$emit("showDrawerCalculator", payload);
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <template v-if="options.show">
    <div class="d-none d-sm-block mt-0">
      <v-app-bar
        :absolute="options.absolute"
        elevation="0"
        color="white"
        height="80"
        dark
        app
      >
        <v-toolbar-title
          @click="$router.push('/')"
          class="cursor-pointer pl-md-15"
        >
          <IconImage 
            src="/assets/icons/logo.svg" 
            alt="Logo Banco Santa Cruz" 
            :width="130" 
            :height="50"
          />
        </v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn
          href="https://bscenlinea.com.do/"
          target="_blank"
          class="mr-6 text-subtitle-2"
          color="green"
          variant="flat"
          rounded="xl"
        >
          BSC En Línea
        </v-btn>
        <v-btn
          @click="openDrawerCalculator({ show: true, type: 'calculator' })"
          class="mx-1"
          variant="flat"
          icon
        >
          <IconImage 
            src="/assets/icons/menu/Calculadora.svg" 
            alt="Calculadora" 
            :width="26" 
            :height="26"
          />
        </v-btn>
        <v-btn
          @click="openDrawerCalculator({ show: true, type: 'exchange' })"
          class="mx-1"
          variant="flat"
          icon
        >
          <IconImage 
            src="/assets/icons/menu/Divisas.svg" 
            alt="Divisas" 
            :width="26" 
            :height="26"
          />
        </v-btn>
        <v-btn to="/locations" class="ml-1 mr-4" variant="flat" icon>
          <IconImage 
            src="/assets/icons/menu/Ubicacion.svg" 
            alt="Ubicaciones" 
            :width="26" 
            :height="26"
          />
        </v-btn>
        <div class="search-input-header">
          <v-text-field
            class="text-caption"
            @keydown.enter="$router.push(`/search/${param}`)"
            v-model="param"
            rounded="xs"
            color="green"
            density="compact"
            variant="outlined"
          >
            <template v-slot:append-inner>
              <v-icon
                class="pa-5"
                color="white"
                style="background-color: var(--bsc-primary-color); opacity: 1"
              >
                mdi-magnify
              </v-icon>
            </template>
          </v-text-field>
        </div>
      </v-app-bar>
      <v-toolbar density="comfortable" color="primary">
        <v-toolbar-items class="subnav-items-container">
          <v-menu open-on-hover offset-y>
            <template v-slot:activator="{ props }">
              <v-btn v-bind="props" class="text-caption" variant="text"
                >Para ti</v-btn
              >
            </template>
            <v-list>
              <!-- CARDS -->
              <v-list-item link>
                <template v-slot:title>
                  <v-list-item-title class="text-caption text-primary"
                    >Tarjetas</v-list-item-title
                  >
                </template>
                <v-menu
                  activator="parent"
                  open-on-hover
                  offset-x
                  location="end top"
                  location-strategy="connected"
                  :offset="[0, 8]"
                >
                  <v-list>
                    <v-list-item
                      v-for="(category, index) in options.products.cards"
                      :key="index"
                      :value="index"
                      :to="`/productos/tarjetas/${category.slug}`"
                    >
                      <template v-slot:title>
                        <v-list-item-title class="text-caption text-primary">
                          {{ category.name }}
                        </v-list-item-title>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>

              <!-- ACCOUNTS -->
              <v-list-item link>
                <template v-slot:title>
                  <v-list-item-title class="text-caption text-primary"
                    >Cuentas</v-list-item-title
                  >
                </template>
                <v-menu
                  activator="parent"
                  open-on-hover
                  offset-x
                  location="end top"
                  location-strategy="connected"
                  :offset="[0, 8]"
                >
                  <v-list>
                    <v-list-item
                      v-for="(category, index) in options.products.accounts"
                      :key="index"
                      :value="index"
                      :to="`/productos/cuentas/${category.slug}`"
                    >
                      <template v-slot:title>
                        <v-list-item-title class="text-caption text-primary">
                          {{ category.name }}
                        </v-list-item-title>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>

              <!-- DEPOSITS -->
              <v-list-item link>
                <template v-slot:title>
                  <v-list-item-title class="text-caption text-primary"
                    >Depósitos</v-list-item-title
                  >
                </template>
                <v-menu
                  activator="parent"
                  open-on-hover
                  offset-x
                  location="end top"
                  location-strategy="connected"
                  :offset="[0, 8]"
                >
                  <v-list>
                    <v-list-item
                      v-for="(category, index) in options.products.deposits"
                      :key="index"
                      :value="index"
                      :to="`/productos/depositos/${category.slug}`"
                    >
                      <template v-slot:title>
                        <v-list-item-title class="text-caption text-primary">
                          {{ category.name }}
                        </v-list-item-title>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>

              <!-- LOANS -->
              <v-list-item link>
                <template v-slot:title>
                  <v-list-item-title class="text-caption text-primary"
                    >Préstamos</v-list-item-title
                  >
                </template>
                <v-menu
                  activator="parent"
                  open-on-hover
                  offset-x
                  location="end top"
                  location-strategy="connected"
                  :offset="[0, 8]"
                >
                  <v-list>
                    <v-list-item
                      v-for="(category, index) in options.products.loans"
                      :key="index"
                      :value="index"
                      :to="`/productos/prestamos/${category.slug}`"
                    >
                      <template v-slot:title>
                        <v-list-item-title class="text-caption text-primary">
                          {{ category.name }}
                        </v-list-item-title>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>

              <!-- GLOBAL -->
              <v-list-item
                v-for="(category, index) in options.products.global"
                :key="index"
                :to="`/productos/categorias/${category.slug}`"
                link
              >
                <template v-slot:title>
                  <v-list-item-title
                    class="text-caption text-primary text-capitalize"
                    >{{ category.name }}</v-list-item-title
                  >
                </template>
                <v-menu
                  v-if="
                    category.subcategories && category.subcategories.length > 0
                  "
                  activator="parent"
                  open-on-hover
                  offset-x
                  location="end top"
                  location-strategy="connected"
                  :offset="[0, 8]"
                >
                  <v-list>
                    <v-list-item
                      v-for="(subcategories, index) in category.subcategories"
                      :value="subcategories._id"
                      :key="index"
                      :to="`/productos/categorias/${subcategories.slug}`"
                    >
                      <template v-slot:title>
                        <v-list-item-title class="text-caption text-primary">{{
                          subcategories.name
                        }}</v-list-item-title>
                      </template>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-list-item>

              <v-list-item to="/productos/puntos">
                <template v-slot:title>
                  <v-list-item-title class="text-caption text-primary"
                    >Puntos Bsc</v-list-item-title
                  >
                </template>
              </v-list-item>
              <v-list-item to="/products/googlepay">
                <template v-slot:title>
                  <v-list-item-title class="text-caption text-primary"
                    >Google Pay</v-list-item-title
                  >
                </template>
              </v-list-item>
              <v-list-item to="/products/applepay">
                <template v-slot:title>
                  <v-list-item-title class="text-caption text-primary"
                    >Apple Pay</v-list-item-title
                  >
                </template>
              </v-list-item>
            </v-list>
          </v-menu>

          <v-btn to="/empresa" class="text-caption" variant="text">
            Para tu Empresa
          </v-btn>
          <v-btn to="/negocio" class="text-caption" variant="text">
            Mi Negocio
          </v-btn>
          <v-btn to="/beneficios" class="text-caption" variant="text">
            Beneficios
          </v-btn>
          <v-btn to="/canales" class="text-caption" variant="text">
            Canales
          </v-btn>
          <v-btn to="/promociones" class="text-caption" variant="text">
            Promociones
          </v-btn>
          <v-btn class="text-caption" variant="text">
            Podcast
            <v-menu activator="parent" open-on-hover>
              <v-list>
                <v-list-item
                  v-for="(season, index) in options.seasons"
                  :key="index"
                  :value="index"
                  :to="`/podcast/season/${season.slug}`"
                >
                  <v-list-item-title class="text-caption">{{
                    season.name
                  }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>
          <v-btn to="/seguros" class="text-caption" variant="text">
            Seguros
          </v-btn>
          <v-btn to="/financieramente" class="text-caption" variant="text">
            Financieramente
          </v-btn>
          <v-btn
            to="/sobre-nosotros/proteccion-al-usuario"
            class="text-caption"
            variant="text"
          >
            Protección al Usuario
          </v-btn>
          <v-btn
            v-if="setCategoryFeatured.categoryFeatured"
            :to="`/sobre-nosotros/categoria/${setCategoryFeatured.categoryFeatured.slug}`"
            class="text-caption"
            variant="text"
          >
            {{ setCategoryFeatured.categoryFeatured.name }}
          </v-btn>
          <v-btn class="text-caption" variant="text">
            Sobre Nosotros
            <v-menu activator="parent" open-on-hover>
              <v-list>
                <v-list-item to="/sobre-nosotros/historia">
                  <v-list-item-title class="text-caption text-primary"
                    >Nuestra Gente</v-list-item-title
                  >
                </v-list-item>
                <v-list-item to="/adjudicados">
                  <v-list-item-title class="text-caption text-primary"
                    >Bienes Adjudicados</v-list-item-title
                  >
                </v-list-item>
                <v-list-item to="/sobre-nosotros/portal-de-empleo">
                  <v-list-item-title class="text-caption text-primary"
                    >Portal de Empleo</v-list-item-title
                  >
                </v-list-item>
                <v-list-item
                  v-for="(
                    category, index
                  ) in setCategoryFeatured.aboutCategories"
                  :key="index"
                  :value="index"
                  :to="`/sobre-nosotros/categoria/${category.slug}`"
                >
                  <template v-slot:title>
                    <p class="text-caption text-primary">{{ category.name }}</p>
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
          </v-btn>

          <!-- TARGETS -->
          <template v-for="(target, index) in options.targets" :key="index">
    
            <!-- MENU EXPANDED -->
            <template
              v-if="
                target.featured !== 'hidden' &&
                target.featured === 'menuExpanded'
              "
            >
              <v-btn
                :to="`/seccion/${target.slug}`"
                class="text-caption"
                variant="text"
              >
                {{ target.name }}
                <v-menu
                  activator="parent"
                  open-on-hover
                  location="bottom start"
                  location-strategy="connected"
                >
                  <v-list>
                    <v-list-item
                      v-for="(category, index) in target.categories"
                      :key="index"
                      :to="`/seccion/${target.slug}/ ${category.slug}`"
                      class="text-caption"
                    >
                      <v-list-item-title>{{ category.name }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-menu>
              </v-btn>
            </template>

            <!-- MENU SIMPLE -->
            <template
              v-if="target.featured !== 'hidden' && target.featured === 'menu'"
            >
              <v-btn
                v-if="
                  target.featured !== 'hidden' && target.featured === 'menu'
                "
                :to="`/seccion/${target.slug}`"
                class="text-caption"
                variant="text"
              >
                {{ target.name }}
              </v-btn>
            </template>
          </template>
        </v-toolbar-items>
      </v-toolbar>
    </div>
    <div class="d-block d-sm-none mt-0">
      <v-toolbar
        class="position-fixed"
        elevation="5"
        color="white"
        height="100"
        style="top: 0; z-index: 10"
      >
        <v-toolbar-title
          @click="$router.push('/')"
          class="cursor-pointer text-center"
        >
          <IconImage 
            src="/assets/icons/Logo-Vertical.svg" 
            alt="Logo BSC Vertical" 
            :width="90" 
            :height="60"
          />
        </v-toolbar-title>
        <v-btn
          href="https://bscenlinea.com.do/"
          target="_blank"
          class="text-subtitle-2 mr-15"
          color="green"
          variant="flat"
          rounded="xl"
        >
          BSC En Línea
        </v-btn>
      </v-toolbar>
      <v-toolbar
        height="80"
        class="position-fixed"
        density="comfortable"
        color="primary"
        style="bottom: 0; z-index: 10"
      >
        <v-toolbar-items class="subnav-items-container responsive-mobile">
          <v-btn
            @click="openDrawerCalculator({ show: true, type: 'calculator' })"
            class="mx-1"
            icon
          >
            <IconImage 
              src="/assets/icons/calculator_white.svg" 
              alt="Calculadora" 
              :width="26" 
              :height="26"
            />
          </v-btn>
          <v-btn
            @click="openDrawerCalculator({ show: true, type: 'exchange' })"
            class="mx-1"
            icon
          >
            <IconImage 
              src="/assets/icons/change_white.svg" 
              alt="Cambio de divisas" 
              :width="26" 
              :height="26"
            />
          </v-btn>
          <v-btn to="/locations" class="mx-1" icon>
            <IconImage 
              src="/assets/icons/location_white.svg" 
              alt="Ubicaciones" 
              :width="26" 
              :height="26"
            />
          </v-btn>
          <v-btn @click="$bus.$emit('showDrawer', true)" class="mx-1" icon>
            <v-icon size="30"> mdi-menu </v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>
    </div>
  </template>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.search-input-header {
  width: 200px;
  margin: 20px 20px 0 20px;

  .v-field.v-field--appended,
  .v-field__append-inner {
    padding: 0;
  }

  input {
    background-color: #fbfaff;
  }
}

.subnav-items-container {
  width: 100%;
  margin: 0 auto;
  justify-content: center;

  &.subnav-items-container.responsive-mobile {
    justify-content: space-around;
  }
}

.list-menu-header {
  box-shadow: none !important;
  border-radius: 0 !important;
}

.v-btn:not(.v-btn--variant-text) {
  color: inherit;
  text-decoration: none;
}
.v-btn:hover {
  color: inherit;
  text-decoration: none;
}

/* Asegurar que los botones con iconos tengan tamaño adecuado */
.v-btn--icon {
  min-width: 40px !important;
  width: 40px !important;
  height: 40px !important;
}

/* Asegurar que los iconos dentro de los botones se vean */
.v-btn--icon .icon-image-container {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  width: 100% !important;
  height: 100% !important;
}

.v-btn--icon .icon-image,
.v-btn--icon img {
  display: block !important;
  width: 26px !important;
  height: 26px !important;
  object-fit: contain !important;
}
</style>
