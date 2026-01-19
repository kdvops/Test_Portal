<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT INTERFACES
import type { SnackbarOptions } from "~/interfaces/snackbar.interface";
import type { HeaderOptions } from "~/interfaces/header.interface";
import type { DrawerCalculatorsPropsInterface } from "~/interfaces/calculators.interface";
import type { PopupInterface } from "~/interfaces/popup.interface";
import type { CategoriesInterface } from "~/interfaces/categories.interface";

// IMPORT COMPONENTS
import AppHeaderComponent from "~/components/header/index.vue";
import AppSnackbarComponent from "~/components/snackbar/index.vue";
import AppFooterComponent from "~/components/footer/index.vue";
import AppDrawerCalculatorsComponent from "~/components/calculators/index.vue";
import AppDrawerComponent from "~/components/drawer/index.vue";
import CookieDialogComponent from "~/components/cookie-dialog/index.vue";

// IMPORT GRAPHQL QUERY
import {
  GET_CATEGORIES_BY_TARGET,
  GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY,
  GET_CATEGORIES_BY_TARGET_ID,
} from "~/graphql/categories.query";
import { GET_COINS } from "~/graphql/coins.query";
import { GET_POPUP_ACTIVE } from "~/graphql/popup.query";
import { GET_ALL_TARGETS } from "~/graphql/targets.query";
import type { TargetInterface } from "~/interfaces/targets.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "default-layout",
  components: {
    // COMPONENTS CUSTOM APP
    "app-header-component": AppHeaderComponent,
    "app-snackbar-component": AppSnackbarComponent,
    "app-footer-component": AppFooterComponent,
    "app-drawer-component": AppDrawerComponent,
    "app-drawer-calculators-component": AppDrawerCalculatorsComponent,
    "cookie-dialog-component": CookieDialogComponent,
  },
})
export default class DefaultLayout extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////
  public showDialogCookies: boolean = false;

  // INSTANCE APOLLO CLIENT
  public override $apollo: any;

  // SNACKBAR DEFAULT OPTIONS
  public snackbar: SnackbarOptions = {
    show: false,
    btn: "",
    y: "bottom",
    x: "",
    mode: "",
    timeout: 0,
    text: "",
    color: "black lighten-2",
  };

  // DRAWER DEFAULT OPTIONS
  public drawerOptions: HeaderOptions = {
    show: false,
    absolute: false,
    notifications: [],
    seasons: [],
    targets: [],
    products: {
      cards: [],
      deposits: [],
      accounts: [],
      loans: [],
      global: [],
    },
    about: [],
  };

  public popup: PopupInterface = {
    title: "",
    excerpt: "",
    subtitle: "",
    description: "",
    orientation: "popupCenter",
    button: {
      background: "",
      color: "",
      text: "",
    },
    background: "",
    color: "",
    link: "",
    image: "",
    active: false,
  };

  // HEADER DEFAULT OPTIONS
  public headerOptions: HeaderOptions = {
    show: true,
    absolute: false,
    notifications: [],
    seasons: [],
    targets: [],
    products: {
      cards: [],
      deposits: [],
      accounts: [],
      loans: [],
      global: [],
    },
    about: [],
  };

  // DRAWER CALCULATORS DEFAULT OPTIONS
  public drawerCalculatorsOptions: DrawerCalculatorsPropsInterface = {
    show: false,
    type: "calculator",
    coins: [],
  };

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  ////////////////////////
  // CICLE LIFE METHODS //
  ////////////////////////

  public mounted() {
    // SET SEASONS PODCAST
    this.setCategoriesByTarget("category::podcast", "seasons");

    // SET ABOUT US CATEGORIES
    this.setCategoriesByTarget("category::about-us", "about");

    // SET TARGETS
    this.setTargets();

    // SET PRODUCTS CATEGORIES
    this.setProductsCategories();

    // SET POPUP ACTIVE
    this.setPopupActive();

    // Cargar script de accesibilidad de forma no bloqueante
    // Solo cargar si no existe ya (para evitar problemas con back/forward cache)
    if (!document.getElementById("aioa-adawidget")) {
      let accessibilityWidgetScript = document.createElement("script");
      accessibilityWidgetScript.setAttribute("id", "aioa-adawidget");
      accessibilityWidgetScript.setAttribute(
        "src",
        "https://www.skynettechnologies.com/accessibility/js/all-in-one-accessibility-js-widget-minify.js?colorcode=#d1202f&token=ADAAIOA-87B3D902F1434AB7BAD33CC9F664AA65&position=bottom_right"
      );
      accessibilityWidgetScript.setAttribute("defer", "true");
      accessibilityWidgetScript.setAttribute("async", "true");
      document.head.appendChild(accessibilityWidgetScript);
    }

    this.showDialogCookies = getConsent() === null;
  }

  public created() {
    this.setEmitEvent();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  public setProductsCategories() {
    // SET PRODUCTS CARDS
    this.setCategoriesByTargetAndParentTarget(
      "category::products",
      "category::cards",
      "products.cards"
    );

    // SET PRODUCTS ACCOUNTS
    this.setCategoriesByTargetAndParentTarget(
      "category::products",
      "category::accounts",
      "products.accounts"
    );

    // SET PRODUCTS DEPOSITS
    this.setCategoriesByTargetAndParentTarget(
      "category::products",
      "category::deposits",
      "products.deposits"
    );

    // SET PRODUCTS LOANS
    this.setCategoriesByTargetAndParentTarget(
      "category::products",
      "category::loans",
      "products.loans"
    );

    // SET PRODUCTS GLOBAL
    this.setCategoriesByTargetAndParentTarget(
      "category::products",
      "category::global",
      "products.global"
    );
  }

  // SET TARGETS
  public async setTargets(): Promise<void> {
    try {
      const { data } = await this.$apollo.query({
        query: GET_ALL_TARGETS,
        fetchPolicy: "no-cache",
      });

      const targets = data.findAllTargets as TargetInterface[];

      // SET TARGETS
      this.headerOptions.targets = targets;
      this.drawerOptions.targets = targets;

      // SET CATEGORIES FOR EACH TARGET IN PARALLEL
      await this.loadTargetsCategories(targets);
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // LOAD TARGETS CATEGORIES IN PARALLEL
  private async loadTargetsCategories(
    targets: TargetInterface[]
  ): Promise<void> {
    const categoryPromises = targets.map(
      (target: TargetInterface) =>
        target && target._id && this.fetchTargetCategories(target._id)
    );
    
    try {
      const results = await Promise.allSettled(categoryPromises);

      results.forEach((result: any, index: number) => {
        if (result.status === "fulfilled" && targets[index]._id) {
          this.assignCategoriesToTarget(targets[index]._id, result.value);
        } else {
          console.error(
            `Failed to load categories for target ${targets[index]._id}:`,
            result.reason
          );
        }
      });
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // FETCH CATEGORIES FOR A SINGLE TARGET
  private async fetchTargetCategories(
    targetId: string
  ): Promise<CategoriesInterface[]> {

    const { data, errors } = await this.$apollo.query({
      query: GET_CATEGORIES_BY_TARGET_ID,
      variables: { 
        targetId: targetId 
      },
      fetchPolicy: "no-cache",
    });

    return data.findCategoriesByTargetId.filter(
      (category: CategoriesInterface) => !category.disabled
    );
  }

  // ASSIGN CATEGORIES TO TARGET IN BOTH HEADER AND DRAWER
  private assignCategoriesToTarget(
    targetId: string,
    categories: CategoriesInterface[]
  ): void {
    const updateTargetCategories = (targets: TargetInterface[]) => {
      const target = targets.find((t) => t._id === targetId);
      if (target) {
        target.categories = categories;
      }
    };

    updateTargetCategories(this.headerOptions.targets);
    updateTargetCategories(this.drawerOptions.targets);
  }

  // SET PRODUCTS BY TARGET
  public async setCategoriesByTarget(
    target: string,
    value: string
  ): Promise<void> {
    try {
      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET,
        variables: { target },
        fetchPolicy: "no-cache",
      });

      const categories = data.findCategoryByTarget.filter(
        (category: CategoriesInterface) => !category.disabled
      );

      this.updateOptionsByPath(value, categories);
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE OPTIONS BY PATH (HEADER AND DRAWER)
  private updateOptionsByPath(
    path: string,
    categories: CategoriesInterface[]
  ): void {
    const pathParts = path.split(".");
    const isNestedPath = pathParts.length > 1;

    const updateOptions = (options: any) => {
      if (isNestedPath) {
        options[pathParts[0]][pathParts[1]] = categories;
      } else {
        options[pathParts[0]] = categories;
      }
    };

    updateOptions(this.headerOptions);
    updateOptions(this.drawerOptions);
  }

  // SET CATEGORIES BY TARGET AND PARENT KEY
  public async setCategoriesByTargetAndParentTarget(
    target: string,
    parentTarget: string | null,
    value: string
  ): Promise<void> {
    try {
      const parentAndTargetDto = {
        parentAndTargetDto: {
          parentTarget,
          target,
        },
      };

      const { data } = await this.$apollo.query({
        query: GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY,
        variables: parentAndTargetDto,
        fetchPolicy: "no-cache",
      });

      const categories = data.findCategoryByParentAndTarget.filter(
        (category: CategoriesInterface) => !category.disabled
      );

      this.updateOptionsByPath(value, categories);
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // SET COINS FOR EXCHANGE
  public async setCoinsExchangeCalculator(): Promise<void> {
    try {
      const { data } = await this.$apollo.query({
        query: GET_COINS,
        fetchPolicy: "no-cache",
      });

      this.drawerCalculatorsOptions.coins = data.coins;
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // SET POPUP ACTIVE
  public async setPopupActive(): Promise<void> {
    try {
      const { data } = await this.$apollo.query({
        query: GET_POPUP_ACTIVE,
        fetchPolicy: "no-cache",
      });

      const defaultPopup: PopupInterface = {
        title: "",
        excerpt: "",
        subtitle: "",
        description: "",
        orientation: "popupCenter",
        button: {
          background: "",
          color: "",
          text: "",
        },
        background: "",
        color: "",
        link: "",
        image: "",
        active: false,
      };

      this.popup = data?.findPopupByActive || defaultPopup;
    } catch (err) {
      // Silently handle popup errors to avoid disrupting user experience
      console.warn("Failed to load popup:", err);
    }
  }

  public get getOrientationPopup(): string {
    const orientationMap: Record<string, string> = {
      popupCenter: "align-center mx-auto",
      popupBottomLeft: "align-end ml-2 mb-2 mr-auto",
      popupBottomRight: "align-end ml-auto mb-2 mr-2",
      popupBottomCenter: "align-end mx-auto mb-2",
    };

    return orientationMap[this.popup.orientation] || "align-center mx-auto";
  }

  ///////////////////
  /// EMIT EVENTS ///
  ///////////////////

  // SET EMIT EVENT
  private setEmitEvent() {
    this.$bus.$on(
      "showDrawerCalculator",
      (options: DrawerCalculatorsPropsInterface) => {
        this.showDrawerCalculator(options);
      }
    );
    this.$bus.$on("showSnackbar", (options: any) => {
      this.showSnackbar(options);
    });
    this.$bus.$on("showDrawer", (options: any) => {
      this.showDrawer(options);
    });
    this.$bus.$on("handleError", (error: string) => {
      this.handleError(error);
    });
  }

  // EMI SHOW DRAWER CALCULATOR
  public showDrawerCalculator(options: DrawerCalculatorsPropsInterface) {
    // GET COINS EXCHANGE
    this.setCoinsExchangeCalculator();

    // SET VALUES EMIT
    this.drawerCalculatorsOptions = options;
  }

  // EMI SHOW SNACKBAR
  public showSnackbar(snackbar: any) {
    this.snackbar = snackbar;
    setTimeout(() => {
      this.closeSnackbar();
    }, this.snackbar.timeout);
  }

  // EMIT SHOW DRAWER
  public showDrawer(show: any) {
    this.drawerOptions.show = show;
  }

  // EMIT HANDLE ERROR
  public handleError(error: string) {
    const snackbar = {
      show: true,
      btn: "",
      y: "bottom",
      x: "center",
      mode: "",
      timeout: 6000,
      text: error,
      color: "red darken-3",
    };
    this.showSnackbar(snackbar);
  }

  // EMIT CLOSE SNACKBAR
  public closeSnackbar() {
    this.snackbar = {
      show: false,
      btn: "",
      y: "bottom",
      x: "",
      mode: "",
      timeout: 0,
      text: "",
      color: "black lighten-2",
    };
  }

  public validateOnRedirect(link: string) {
    const validateRoute = link.split("/");

    if (validateRoute[0] === "https:" || validateRoute[0] === "http:") {
      window.open(link, "_blank");
    } else {
      this.$router.push(link);
    }
  }

  public consentChanged(value: boolean) {
    if (value) setConsent("accepted");
    this.showDialogCookies = false;
  }
}
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-app>
    <!-- CUSTOM APP DRAWER CALCULATORS COMPONENT -->
    <app-drawer-calculators-component :options="drawerCalculatorsOptions" />

    <!-- CUSTOM APP DRAWER COMPONENT -->
    <app-drawer-component :options="drawerOptions" @showDrawer="showDrawer" />

    <v-layout full-height class="layout-default">
      <v-main class="layout-main">
        <!-- CUSTOM APP HEADERS COMPONENT -->
        <app-header-component
          :options="headerOptions"
          @showDrawer="showDrawer"
        />

        <!-- CUSTOM APP SNACKBAR COMPONENT -->
        <app-snackbar-component :options="snackbar" @close="closeSnackbar" />

        <!-- CUSTOM APP POPUP COMPONENT -->
        <v-dialog
          v-model="popup.active"
          :class="getOrientationPopup"
          :scrim="popup.orientation === 'popupCenter'"
          scrollable
        >
          <v-card
            :min-width="popup.image ? 400 : 300"
            :max-width="popup.image ? 500 : 350"
            :min-height="popup.image ? 400 : 300"
            :max-height="popup.image ? 500 : 350"
            :class="getOrientationPopup"
            rounded="xl"
            :color="popup.background"
            :dark="popup.background === '#000000'"
          >
            <v-img
              width="100%"
              height="100%"
              :src="popup.image"
              class="d-flex align-end"
              cover
            >
              <div
                class="px-5 pt-2 pb-5"
                :style="`background: ${popup.background}`"
              >
                <v-btn
                  width="25"
                  height="25"
                  position="absolute"
                  :color="popup.button.background"
                  @click="popup.active = !popup.active"
                  style="z-index: 10; top: 15px; right: 15px"
                  icon
                >
                  <v-icon :color="popup.button.color" size="15"
                    >mdi-close</v-icon
                  >
                </v-btn>
                <p
                  class="px-3 py-2 text-title font-weight-bold"
                  :style="`color: ${popup.title}`"
                >
                  {{ popup.title }}
                </p>
                <p
                  class="px-3 pb-2 text-caption"
                  :style="`color: ${popup.color}`"
                >
                  {{ popup.description }}
                </p>
                <div class="text-right">
                  <v-btn
                    :color="popup.button.background"
                    :dark="popup.button.background === '#000000'"
                    class="mx-3 mt-5 text-caption text-uppercase"
                    rounded="xl"
                    @click="validateOnRedirect(popup.link)"
                    :style="`color: ${popup.button.color};`"
                  >
                    {{ popup.button.text }}
                  </v-btn>
                </div>
              </div>
            </v-img>
          </v-card>
        </v-dialog>

        <!-- LAYOUT MAIN APP -->
        <v-container fluid fill-height class="pa-0">
          <slot
            @showDrawerCalculator="showDrawerCalculator"
            @showSnackbar="showSnackbar"
            @handleError="handleError"
          />
        </v-container>

        <!-- FOOTER APP -->
        <app-footer-component />
      </v-main>
    </v-layout>
    <cookie-dialog-component
      v-model="showDialogCookies"
      @consentChange="consentChanged"
    ></cookie-dialog-component>
  </v-app>
</template>

<style lang="scss">
.layout-default {
  position: relative;

  .layout-admin-main {
    .layout-admin-container {
      &::-webkit-scrollbar {
        display: none !important;
      }
    }
  }
}

#accessibility_settings_toggle {
  /* Estilos para pantallas grandes */
  right: 20px;
  bottom: 20px;
  position: fixed;
  left: auto;
}

@media only screen and (max-width: 600px) {
  #accessibility_settings_toggle {
    /* Estilos para pantallas pequeñas */
    top: 75% !important;
    right: 20px !important;
    bottom: 0 !important;
    position: fixed;
    left: auto;
  }
}

@media only screen and (min-width: 601px) and (max-width: 1024px) {
  #accessibility_settings_toggle {
    /* Estilos para pantallas medianas */
    right: 25px !important;
    bottom: 25px !important;
    position: fixed;
    left: auto;
  }
}

@media only screen and (min-width: 1025px) {
  #accessibility_settings_toggle {
    /* Estilos para pantallas grandes */
    right: 20px !important;
    bottom: 20px !important;
    position: fixed;
    left: auto;
  }
}
</style>
