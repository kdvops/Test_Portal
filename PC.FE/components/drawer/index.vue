<!-- SCRIPT TEMPLATE -->
<script lang="ts">
import { Emit, Prop, Vue } from 'vue-facing-decorator'
import type { CategoriesInterface } from '~/interfaces/categories.interface';
import type { HeaderOptions } from '~/interfaces/header.interface';

// IMPORT OPTIMIZED IMAGE COMPONENTS
import IconImage from "~/components/optimized-image/IconImage.vue";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: 'app-drawer-component',
  components: {
    IconImage,
  }
})
export default class AppDrawerComponent extends Vue {
  ////////////
  // PROPS //
  ////////////

  // PROPS DRAWER
  @Prop({
    default: {
      show: false,
      absolute: false,
      notifications: [],
      seasons: [],
      products: {
        cards: [],
        deposits: [],
        accounts: [],
        loans: [],
        global: [],
      },
      about: [],
    }
  }) options!: HeaderOptions;

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
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-navigation-drawer v-model="options.show" temporary>
    <v-list-item class="text-center my-5">
      <IconImage 
        src="/assets/icons/logo.svg" 
        alt="Logo Banco Santa Cruz" 
        :width="140" 
        :height="50"
      />
    </v-list-item>
    <v-divider></v-divider>
    <v-list>

      <!-- ROUTES PRODUCTS -->
      <v-list-group value="Products">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" class="text-caption">
            Para Ti
          </v-list-item>
        </template>

        <!-- ROUTES PRODUCTS CARDS -->
        <v-list-group v-if="options.products.cards.length > 0" value="Cards">
          <template v-slot:activator="{ props }">
            <v-list-item class="text-caption" v-bind="props">
              Tarjetas
            </v-list-item>
          </template>

          <v-list-item v-for="category in options.products.cards" :key="category._id" class="text-caption"
            :value="category.name" :to="`/productos/tarjetas/${category._id}`">
            {{ category.name }}
          </v-list-item>
        </v-list-group>

        <!-- ROUTES PRODUCTS DEPOSITS -->
        <v-list-group v-if="options.products.deposits.length > 0" value="Deposits">
          <template v-slot:activator="{ props }">
            <v-list-item class="text-caption" v-bind="props">
              Deposito
            </v-list-item>
          </template>

          <v-list-item v-for="category in options.products.deposits" :key="category._id" class="text-caption"
            :value="category.name" :to="`/productos/depositos/${category._id}`">
            {{ category.name }}
          </v-list-item>
        </v-list-group>

        <!-- ROUTES PRODUCTS ACCOUNTS -->
        <v-list-group v-if="options.products.deposits.length > 0" value="Accounts">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" class="text-caption">
              Cuentas
            </v-list-item>
          </template>

          <v-list-item v-for="category in options.products.accounts" :key="category._id" class="text-caption"
            :value="category.name" :to="`/productos/cuentas/${category._id}`">
            {{ category.name }}
          </v-list-item>
        </v-list-group>

        <!-- ROUTES PRODUCTS LOANS -->
        <v-list-group v-if="options.products.loans.length > 0" value="Loans">
          <template v-slot:activator="{ props }">
            <v-list-item v-bind="props" class="text-caption">
              Prestamos
            </v-list-item>
          </template>

          <v-list-item v-for="category in options.products.loans" :key="category._id" class="text-caption"
            :value="category.name" :to="`/productos/prestamos/${category._id}`">
            {{ category.name }}
          </v-list-item>
        </v-list-group>

        <v-list-item class="text-caption" to="/productos/puntos">
          Puntos Bsc
        </v-list-item>

        <v-list-item class="text-caption" to="/products/googlepay">
          Google Pay
        </v-list-item>

        <v-list-item class="text-caption" to="/products/applepay">
          Apple Pay
        </v-list-item>
      </v-list-group>

      <v-list-item to="/empresa" class="text-caption">
        Para tu Empresa
      </v-list-item>
      <v-list-item to="/negocio" class="text-caption">
        Mi Negocio
      </v-list-item>
      <v-list-item to="/beneficios" class="text-caption">
        Beneficios
      </v-list-item>
      <v-list-item to="/canales" class="text-caption">
        Canales
      </v-list-item>
      <v-list-item to="/promociones" class="text-caption">
        Promociones
      </v-list-item>
      <v-list-item to="/sobre-nosotros/proteccion-al-usuario" class="text-caption">
        Protección al Usuario
      </v-list-item>

      <!-- ROUTES PODCAST -->
      <v-list-group v-if="options.seasons.length > 0" value="Podcast">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" class="text-caption">
            Podcast
          </v-list-item>
        </template>

        <v-list-item v-for="category in options.seasons" :key="category._id" class="text-caption" :value="category.name"
          :to="`/podcast/season/${category._id}`">
          {{ category.name }}
        </v-list-item>
      </v-list-group>

      <v-list-item to="/seguros" class="text-caption">
        Seguros
      </v-list-item>

      <v-list-item v-if="setCategoryFeatured.categoryFeatured"
        :to="`/sobre-nosotros/categoria/${setCategoryFeatured.categoryFeatured._id}`" class="text-caption" variant="text">
        {{ setCategoryFeatured.categoryFeatured.name }}
      </v-list-item>

      <v-list-item to="/financieramente" class="text-caption">
        Financieramente
      </v-list-item>

      <!-- ROUTES ABOUT -->
      <v-list-group v-if="options.seasons.length > 0" value="sobre-nosotros">
        <template v-slot:activator="{ props }">
          <v-list-item v-bind="props" class="text-caption">
            Sobre Nosotros
          </v-list-item>
        </template>

        <v-list-item class="text-caption" to="/sobre-nosotros/historia">
          Nuestra Gente
        </v-list-item>

        <v-list-item class="text-caption" to="/adjudicados">
          Bienes Adjudicados
        </v-list-item>

        <v-list-item class="text-caption" to="/sobre-nosotros/portal-de-empleo">
          Portal de Empleo
        </v-list-item>

        <v-list-item v-for="category in setCategoryFeatured.aboutCategories" :key="category._id" class="text-caption"
          :value="category.name" :to="`/sobre-nosotros/categoria/${category._id}`">
          {{ category.name }}
        </v-list-item>
      </v-list-group>

    </v-list>

  </v-navigation-drawer>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>