<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop } from "vue-facing-decorator";

// IMPORT INTERFACES
import type { DrawerOptions } from "~/interfaces/drawer.interface";
import type { UserInterface } from "~/interfaces/user.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "app-drawer-component",
})
class AppDrawerComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // DRAWER OPTIONS
  @Prop({
    default: {
      show: true,
      rail: true,
      absolute: false,
      right: false,
      expandOnHover: false,
      app: false,
      routes: [],
      routesUserConfig: [],
    },
  })
  options!: DrawerOptions;

  ///////////////
  // VARIABLES //
  ///////////////

  // RAIL DRAWER
  public rail: boolean = false;

  ///////////////
  /// METHODS ///
  ///////////////

  // CHANGE RAIL DRAWER
  public changeRailDrawer() {
    this.rail = !this.rail;
  }

  public get getUserAuth(): UserInterface | null {
    const { user } = useAuth();

    return user && typeof user.value === "object" && user.value !== null
      ? (user.value as UserInterface)
      : null;
  }

  // VALIDATE IF THE USER HAS THE 'DIVISAS' ROLE
  public get isCheckRoles(): boolean {
    const user = this.getUserAuth;

    if (!user || !user.roles) {
      return false;
    }

    return Array.isArray(user.roles) && user.roles.includes("divisas");
  }

  public get canEditOrDelete(): boolean {
    const user = this.getUserAuth;
    if (!user || !user.roles) return false;
    const roles = Array.isArray(user.roles) ? user.roles : [];
    return roles.includes("admin") && !roles.includes("divisas");
  }
}
export default AppDrawerComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <template v-if="options.show">
    <v-navigation-drawer width="235" :border="0" :rail="rail" permanent>
      <template v-slot:prepend>
        <div class="text-center">
          <img
            width="100"
            :class="!rail ? 'my-7' : 'mt-15 mb-5'"
            class="mx-auto px-2"
            src="~/assets/icons/logo.png"
          />
        </div>
      </template>

      <v-sheet
        class="rounded-ts-xl drawer-items-container"
        width="100%"
        height="100%"
        color="#12539b"
      >
        <v-btn
          class="ma-2"
          icon="mdi-menu"
          size="35"
          color="transparent"
          @click="changeRailDrawer()"
          flat
        >
          <v-icon icon="mdi-menu" size="20" />
        </v-btn>
        <v-list density="compact" class="pr-0" nav>
          <v-list-item
            title="Gestionar Modulos"
            base-color="green"
            variant="elevated"
            class="rounded-xl"
            prepend-icon="mdi-star"
            to="/targets/list"
            link
            :disabled="isCheckRoles"
          />

          <v-list-item
            class="rounded-s-xl rounded-e-0"
            prepend-icon="mdi-home-city"
            title="Dashboard"
            to="/dashboard"
            active-class="list-item-active"
            link
            :disabled="isCheckRoles"
          />

          <!-- DYNAMIC TARGETS -->
          <v-list-group
            v-for="(route, index) in options.routes"
            :key="`target-${index}`"
            :value="`target-${index}`"
          >
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                style="text-transform: capitalize"
                :prepend-icon="route.icon"
                :title="route.name"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              v-for="child in route.children"
              :key="child.path"
              :title="child.name"
              class="rounded-s-xl rounded-e-0"
              style="text-transform: capitalize"
              :prepend-icon="child.icon"
              :to="child.path"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-item
            class="rounded-s-xl rounded-e-0"
            prepend-icon="mdi-image"
            title="Banners"
            to="/sliders/list"
            active-class="list-item-active"
            :disabled="isCheckRoles"
            link
          />

          <v-list-item
            class="rounded-s-xl rounded-e-0"
            prepend-icon="mdi-percent"
            title="Promociones"
            to="/promotions/list"
            active-class="list-item-active"
            link
            :disabled="isCheckRoles"
          />

          <v-list-item
            class="rounded-s-xl rounded-e-0"
            prepend-icon="mdi-chart-line"
            title="Financieramente"
            to="/financially/list"
            active-class="list-item-active"
            link
            :disabled="isCheckRoles"
          />

          <v-list-group value="forms">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-form-textbox"
                title="Formularios"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Formularios"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-form-textbox"
              to="/forms/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Mensajes"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-message"
              to="/forms/messages"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="adjudicated">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-car"
                title="Bienes Adjudicados"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Categorías"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/adjudicated/categories/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Productos"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-car"
              to="/adjudicated/products/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="regulatory">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-file-document"
                title="Sobre Nosotros"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Categorías"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/regulatory/categories/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Publicaciones"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-file-document"
              to="/regulatory/post/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="prouser">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-shield-account"
                title="Pro Usuario"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Categorías"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/prouser/categories/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Publicaciones"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-shield-account"
              to="/prouser/post/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="insurance">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-shield"
                title="Seguros"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Categorías"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/insurance/categories/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Publicaciones"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-shield"
              to="/insurance/post/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="business">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-handshake"
                title="Mi Negocio"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Categorías"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/business/categories/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Publicaciones"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-handshake"
              to="/business/post/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="enterprise">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-briefcase"
                title="Para tu empresa"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Categorías"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/enterprise/categories/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Publicaciones"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-briefcase"
              to="/enterprise/post/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-item
            class="rounded-s-xl rounded-e-0"
            prepend-icon="mdi-message-processing-outline"
            title="Canales"
            to="/channels/list"
            active-class="list-item-active"
            link
            :disabled="isCheckRoles"
          />

          <v-list-group value="profits">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-offer"
                title="Beneficios"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Categorías"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/profits/categories/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Beneficios"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-offer"
              to="/profits/items/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="podcast">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-microphone"
                title="Podcast"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Temporadas"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/podcast/seasons/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Episodios"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-microphone"
              to="/podcast/episodes/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="products">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-credit-card"
                title="Para ti"
                active-class="list-item-active"
                :disabled="isCheckRoles"
              />
            </template>
            <v-list-item
              title="Categorías"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/products/categories/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Tarjetas"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-credit-card-multiple"
              to="/products/cards/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Cuentas"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-account-cash"
              to="/products/accounts/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Deposito"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-cash-fast"
              to="/products/deposits/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Click to pay"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-star-four-points-circle"
              to="/products/pointsbsc/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Prestamos"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-hand-coin"
              to="/products/loans/list"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>

          <v-list-group value="config">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                class="rounded-s-xl rounded-e-0"
                prepend-icon="mdi-cog"
                title="Configuración"
                active-class="list-item-active"
                :disabled="!canEditOrDelete"
              />
            </template>
            <v-list-item
              title="Monedas"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-plus-circle-multiple-outline"
              to="/settings/coins"
              link
              :disabled="!canEditOrDelete"
            />
            <v-list-item
              title="Ubicaciones"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-map-marker"
              to="/settings/locations"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Accesos Directos"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-apps"
              to="/settings/shortcuts/list"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="Popup"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-image-area"
              to="/settings/popup"
              link
              :disabled="isCheckRoles"
            />
            <v-list-item
              title="SEO - Páginas"
              class="rounded-s-xl rounded-e-0"
              prepend-icon="mdi-file-find"
              to="/settings/seo/pages"
              link
              :disabled="isCheckRoles"
            />
          </v-list-group>
        </v-list>
      </v-sheet>
    </v-navigation-drawer>
  </template>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.drawer-items-container {
  overflow-y: scroll !important;

  &::-webkit-scrollbar {
    display: none !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
}

.list-item-active {
  background-color: #ffffff !important;
  color: #000000 !important;

  i {
    color: #12539b;
  }
}

.v-list-group__items {
  .v-list-item {
    --indent-padding: 10px !important;
  }
}
</style>
