<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue, Prop, Watch, Emit } from "vue-facing-decorator";

// IMPORT INTERFACES
import type {
  CardShortcutInterface,
  ShortcutInterface,
} from "~/interfaces/shortcuts.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "app-shortcuts-component",
})
class AppShortcutsComponent extends Vue {
  ///////////////
  //// PROPS ////
  ///////////////

  // SHORTCUT PROPS
  @Prop({
    default: {
      _id: "",
      name: "",
      icon: "",
      color: "",
      background: "",
      type: "",
      target: "",
      cards: [],
    },
  })
  shortcuts!: Array<ShortcutInterface>;

  // TYPE PROPS
  @Prop({
    default: "tabs",
  })
  type!: string;

  // TAB SELECTED PROPS
  @Prop({
    default: "",
  })
  tabSelected?: string;

  ///////////////
  // VARIABLES //
  ///////////////

  public shortcutSelected: string = "";

  /////////////
  // METHODS //
  /////////////

  public created() {
    this.shortcutsLength();
    this.tabSelectedValidate();
  }

  public get cardsSelected() {
    return (
      this.shortcuts.find((shortcut) => shortcut._id === this.shortcutSelected)
        ?.cards || []
    );
  }

  public get getLargeCards(): Array<CardShortcutInterface> {
    let cards: Array<CardShortcutInterface> = [];

    this.shortcuts.map((shortcut) => {
      cards = [...cards, ...shortcut.cards];
    });

    return cards;
  }

  public imparIndex(_id: string) {
    const getCard = this.getLargeCards.filter((n, i) => i % 2 !== 0);
    const findCard = getCard.find((card) => card._id === _id);
    return findCard ? true : false;
  }

  public validateOnRedirect(link: string) {
    const validateRoute = link.split("/");

    if (validateRoute[0] === "https:" || validateRoute[0] === "http:") {
      window.open(link, "_blank");
    } else {
      this.$router.push(link);
    }
  }

  @Emit("redirectTab")
  public redirectTab(shortcut: ShortcutInterface): {
    _id: string;
    name: string;
  } {
    this.shortcutSelected = shortcut._id;
    const nameFormat = shortcut.name
      .normalize("NFD") // separa acentos de letras
      .replace(/[\u0300-\u036f]/g, "") // elimina acentos
      .replace(/[^a-zA-Z0-9\s]/g, "") // elimina caracteres especiales
      .trim()
      .replace(/\s+/g, "-") // reemplaza espacios por guiones
      .toLowerCase();

    return { _id: shortcut._id, name: nameFormat };
  }

  @Watch("shortcuts.length")
  public shortcutsLength() {
    this.shortcuts.length > 0 &&
      (this.shortcutSelected = this.shortcuts[0]._id);
  }

  @Watch("tabSelected", { deep: true })
  public tabSelectedValidate() {
    this.tabSelected && (this.shortcutSelected = this.tabSelected);
  }
}
export default AppShortcutsComponent;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-container class="pa-0 pa-sm-10">
    <template v-if="type === 'tabs'">
      <v-row justify="center">
        <v-col class="py-0" cols="12" md="8" lg="8" xl="6">
          <v-card
            :width="$vuetify.display.mdAndDown ? '100%' : '81.5%'"
            height="50"
            class="card-menu-shortcuts mx-auto"
            color="white"
            elevation="3"
            :rounded="$vuetify.display.mdAndDown ? 'none' : 'xl'"
            density="comfortable"
          >
            <v-slide-group class="text-center justify-center h-100" show-arrows>
              <template v-for="shortcut in shortcuts">
                <v-slide-group-item
                  v-if="shortcut.type === 'shortcutTabs'"
                  style="position: relative"
                  class="h-100"
                  :key="shortcut._id"
                >
                  <v-btn
                    elevation="0"
                    class="text-caption text-capitalize"
                    :color="
                      shortcutSelected === shortcut._id
                        ? shortcut.background
                        : ''
                    "
                    :style="`color: ${
                      shortcutSelected === shortcut._id
                        ? shortcut.color
                        : '#12539b'
                    }`"
                    @click="shortcutSelected = shortcut._id"
                    rounded="xl"
                    height="100%"
                  >
                    {{ shortcut.name }}
                    <v-icon
                      size="24"
                      class="ml-2"
                      :color="
                        shortcutSelected === shortcut._id
                          ? shortcut.color
                          : 'primary'
                      "
                    >
                      {{ shortcut.icon }}
                    </v-icon>
                  </v-btn>
                </v-slide-group-item>
              </template>
            </v-slide-group>
          </v-card>
        </v-col>
      </v-row>

      <v-row class="mt-10">
        <template v-for="(card, index) in cardsSelected">
          <v-col
            v-if="card.style === 'cardsShortcutSmall'"
            :key="card._id + '_' + index + '_small'"
            class="mx-auto"
            cols="12"
            md="10"
            lg="4"
          >
            <v-card
              height="180"
              @click="validateOnRedirect(card.button.link)"
              class="mx-2 my-2"
              rounded="lg"
              :color="card.background"
              :dark="card.background === '#000000'"
            >
              <v-img width="100%" height="100%" :src="card.picture" cover>
                <p
                  class="px-3 py-2 text-title font-weight-bold"
                  :style="`position:absolute; width:100%; bottom: 0; color: ${
                    card.title.color
                  }; text-align: ${
                    card.align === 'alignLeft'
                      ? 'left'
                      : card.align === 'alignCenter'
                      ? 'center'
                      : card.align === 'alignRight'
                      ? 'right'
                      : 'left'
                  };`"
                >
                  {{ card.title.text }}
                  <v-icon
                    class="pa-2 cursor-pointer rounded-circle"
                    style="background: #000000"
                    color="#ffffff"
                    size="15"
                  >
                    mdi-plus
                  </v-icon>
                </p>
              </v-img>
            </v-card>
          </v-col>

          <v-col
            v-if="card.style === 'cardsShortcutMedium'"
            :key="card._id + '_' + index + '_medium'"
            class="mx-auto"
            cols="12"
            md="12"
            lg="6"
          >
            <v-card
              height="320"
              class="mx-2 my-2"
              rounded="lg"
              :color="card.background"
              :dark="card.background === '#000000'"
            >
              <v-img width="100%" height="100%" :src="card.picture" cover>
                <div
                  class="info-card-shortcut-medium-container"
                  :style="`background: ${card.background}; text-align: ${
                    card.align === 'alignLeft'
                      ? 'left'
                      : card.align === 'alignCenter'
                      ? 'center'
                      : card.align === 'alignRight'
                      ? 'right'
                      : 'left'
                  };`"
                >
                  <p
                    class="px-3 py-2 text-title font-weight-bold"
                    :style="`color: ${card.title.color}`"
                  >
                    {{ card.title.text }}
                    <v-icon class="ml-3" :color="card.title.color" size="24">
                      {{ card.icon }}
                    </v-icon>
                  </p>
                  <p
                    class="px-3 pb-2 text-caption"
                    :style="`color: ${card.description.color}`"
                  >
                    {{ card.description.text }}
                  </p>
                  <v-btn
                    @click="validateOnRedirect(card.button.link)"
                    :color="card.button.background"
                    :dark="card.button.background === '#000000'"
                    class="mx-3 mt-3 text-caption text-uppercase"
                    rounded="xl"
                    :style="`color: ${card.button.color};`"
                  >
                    {{ card.button.text }}
                  </v-btn>
                </div>
              </v-img>
            </v-card>
          </v-col>

          <v-col
            v-if="card.style === 'cardsShortcutLarge'"
            :key="card._id + '_' + index + '_large'"
            cols="12"
          >
            <v-card
              class="mx-2 my-2"
              height="300"
              rounded="lg"
              :color="card.background"
              :dark="card.background === '#000000'"
            >
              <v-img width="100%" height="300px" :src="card.picture" cover>
                <v-row
                  align-self="center"
                  :justify="
                    card.align === 'alignLeft'
                      ? 'start'
                      : card.align === 'alignCenter'
                      ? 'center'
                      : card.align === 'alignRight'
                      ? 'end'
                      : 'start'
                  "
                >
                  <v-col cols="6">
                    <div
                      class="info-card-shortcut-large-container"
                      :style="`background: ${card.background}; height: 300px`"
                    >
                      <p
                        class="px-3 py-2 text-h5 font-weight-bold mt-2"
                        :style="`color: ${card.title.color}`"
                      >
                        {{ card.title.text }}
                        <v-icon
                          class="ml-3"
                          :color="card.title.color"
                          size="24"
                        >
                          {{ card.icon }}
                        </v-icon>
                      </p>
                      <p
                        class="px-3 pb-2 text-body-2 shortcut-description"
                        :style="`color: ${card.description.color}`"
                      >
                        {{ card.description.text }}
                      </p>
                      <v-btn
                        width="140"
                        :color="card.button.background"
                        :dark="card.button.background === '#000000'"
                        class="mx-3 mt-3 text-caption text-uppercase"
                        rounded="xl"
                        :style="`color: ${card.button.color};`"
                        @click="validateOnRedirect(card.button.link)"
                      >
                        {{ card.button.text }}
                      </v-btn>
                    </div>
                  </v-col>
                </v-row>
              </v-img>
            </v-card>
          </v-col>
        </template>
      </v-row>
    </template>

    <template v-else-if="type === 'tabs-redirect'">
      <v-row justify="center">
        <v-col class="py-0" cols="12" md="8" lg="8" xl="6">
          <v-card
            :width="$vuetify.display.mdAndDown ? '100%' : '81.5%'"
            height="50"
            class="card-menu-shortcuts mx-auto"
            color="white"
            elevation="3"
            :rounded="$vuetify.display.mdAndDown ? 'none' : 'xl'"
            density="comfortable"
          >
            <v-slide-group class="text-center justify-center h-100" show-arrows>
              <template v-for="shortcut in shortcuts" :key="shortcut._id">
                <v-slide-group-item style="position: relative" class="h-100">
                  <v-btn
                    elevation="0"
                    class="text-caption text-capitalize"
                    :color="
                      shortcutSelected === shortcut._id
                        ? shortcut.background
                        : ''
                    "
                    :style="`color: ${
                      shortcutSelected === shortcut._id
                        ? shortcut.color
                        : '#12539b'
                    }`"
                    @click="redirectTab(shortcut)"
                    rounded="xl"
                    height="100%"
                  >
                    {{ shortcut.name }}
                    <v-icon
                      size="24"
                      class="ml-2"
                      :color="
                        shortcutSelected === shortcut._id
                          ? shortcut.color
                          : 'primary'
                      "
                    >
                      {{ shortcut.icon }}
                    </v-icon>
                  </v-btn>
                </v-slide-group-item>
              </template>
            </v-slide-group>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- <div v-else>
      <v-row>
        <v-col v-for="card in getLargeCards" cols="12">
          <v-card v-if="imparIndex(card._id)" class="mx-2 my-2" height="280" rounded="lg" :color="card.background"
            :dark="card.background === '#000000'">
            <v-row>
              <v-col class="align-content-center" cols="6">
                <div class="info-card-shortcut-large-container" :style="`background: ${card.background}`">
                  <p class="px-3 py-2 text-h5 font-weight-bold mt-2" :style="`color: ${card.title.color}`">
                    {{ card.title.text }}
                    <v-icon class="ml-3" :color="card.title.color" size="24">
                      {{ card.icon }}
                    </v-icon>
                  </p>
                  <p class="px-3 pb-2 text-caption shortcut-description" :style="`color: ${card.description.color}`">
                    {{ card.description.text }}
                  </p>
                  <v-btn width="140" @click="validateOnRedirect(card.button.link)" :color="card.button.background"
                    :dark="card.button.background === '#000000'" class="mx-3 mt-3 text-caption text-uppercase"
                    rounded="xl" :style="`color: ${card.button.color};`">
                    {{ card.button.text }}
                  </v-btn>
                </div>
              </v-col>
              <v-col cols="6">
                <v-img width="100%" height="280" :src="card.picture" cover />
              </v-col>
            </v-row>
          </v-card>

          <v-card v-else class="mx-2 my-2" height="280" rounded="lg" :color="card.background"
            :dark="card.background === '#000000'">
            <v-row>
              <v-col cols="6">
                <v-img width="100%" height="280" :src="card.picture" cover />
              </v-col>
              <v-col class="align-content-center" cols="6">
                <div class="info-card-shortcut-large-container" :style="`background: ${card.background}`">
                  <p class="px-3 py-2 text-h5 font-weight-bold mt-2" :style="`color: ${card.title.color}`">
                    {{ card.title.text }}
                    <v-icon class="ml-3" :color="card.title.color" size="24">
                      {{ card.icon }}
                    </v-icon>
                  </p>
                  <p class="px-3 pb-2 text-caption shortcut-description" :style="`color: ${card.description.color}`">
                    {{ card.description.text }}
                  </p>
                  <v-btn width="140" @click="validateOnRedirect(card.button.link)" :color="card.button.background"
                    :dark="card.button.background === '#000000'" class="mx-3 mt-3 text-caption text-uppercase"
                    rounded="xl" :style="`color: ${card.button.color};`">
                    {{ card.button.text }}
                  </v-btn>
                </div>
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>
    </div> -->
  </v-container>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-menu-shortcuts {
  margin-top: -50px;
}

.shortcuts-create-card {
  height: 80px;
  background-color: var(--bsc-primary-color);
  color: #ffffff;
  text-align: center;
  justify-content: center;
  box-shadow: 0px 0px 10px 0px #0000001a;
}

.info-card-shortcut-medium-container {
  width: 100%;
  height: 170px;
  position: absolute;
  bottom: 0;
  padding: 10px;
}

.info-card-shortcut-large-container {
  width: 100%;
  bottom: 0;
  padding: 10px;
  display: flex;
  flex-direction: column;
  align-content: center;

  .shortcut-description {
    max-height: 120px;
    overflow: hidden;
  }
}

@media (max-width: 600px) {
  .card-menu-shortcuts {
    margin-top: -10px;
    /* Adjust margin for small screens */
  }
}
</style>
