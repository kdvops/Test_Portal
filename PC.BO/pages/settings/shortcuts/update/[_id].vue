<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";
import type {
  CardShortcutInterface,
  ShortcutInterface,
  StyleCardShortcut,
  TargetShortcut,
  AlignCardShortcut,
} from "~/interfaces/shortcuts.interface";

// IMPORT QUERY
import { GET_SHORTCUT } from "~/graphql/query/shortcuts.query";

// IMPORT MUTATION
import { UPDATE_SHORTCUT } from "~/graphql/mutations/shortcuts.mutation";

// IMPORT LODASH
import _ from "lodash";

import DetailedImageComponent from "~/components/detailed-image/index.vue";
// COMPOSABLES
import { useTargetManager } from "~/composables/useTargetManager";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "shortcuts-update-screen",
  components: {
    "detailed-image-component": DetailedImageComponent,
  },
})
class ShortcutsUpdateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////


  ///////////////
  // VARIABLES //
  ///////////////

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public override $apollo: any;

  // LOADING DEFAULT
  public loading: boolean = false;

  // TARGET MANAGER
  public targetManager = useTargetManager();

  // TARGETS COMBINADOS (ESTÁTICOS + DINÁMICOS)
  public allTargets: Array<any> = [];

  // SELECTED TARGET
  public selectedTarget: string = "";

  // DEFAULT DATA SHORTCUTS UPDATE
  public shortcut: ShortcutInterface = {
    name: "",
    icon: "",
    color: "",
    background: "",
    target: "targetHome",
    targetID: null,
    type: "shortcutTabs",
    cards: [],
  };

  // GET PARAM SHORTCUT ID
  public shortcutID = useRoute().params._id;

  // ACTION CREATE OR UPDATE
  public action: string = "create";

  // DIALOG CARD SHORTCUT CREATE
  public dialog: {
    position: number;
    show: boolean;
    card: CardShortcutInterface;
  } = {
    show: false,
    position: -1,
      card: {
        align: "alignLeft",
        title: {
          text: "",
          color: "",
        },
        description: {
          text: "",
          color: "",
        },
        style: "cardsShortcutSmall",
        picture: "",
        pictureImageDetail: null,
        background: "",
        button: {
          text: "",
          color: "",
          background: "",
          enabled: false,
          link: "",
        },
        icon: "mdi-apps",
      },
  };

  // STYLE CARD SHORTCUT
  public styleCardShortcut: Array<{ _id: StyleCardShortcut; value: string }> = [
    { _id: "cardsShortcutSmall", value: "Pequeño" },
    { _id: "cardsShortcutMedium", value: "Mediano" },
    { _id: "cardsShortcutLarge", value: "Grande" },
  ];

  // TARGET SHORTCUT
  public targetCardShortcut: Array<{ _id: TargetShortcut; value: string }> = [
    { _id: "targetHome", value: "Home" },
    { _id: "targetBusiness", value: "Negocios" },
    { _id: "targetEnterprise", value: "Empresas" },
    { _id: "targetInsurance", value: "Seguros" },
  ];

  // SHORTCUT ALIGN CARD
  public shortcutAlignCard: Array<{ _id: AlignCardShortcut; value: string }> = [
    { _id: "alignLeft", value: "Izquierda" },
    { _id: "alignCenter", value: "Centro" },
    { _id: "alignRight", value: "Derecha" },
  ];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public async created() {
    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });

    // SET SHORTCUT BY ID
    await this.setShortcutById();

    // CARGAR TARGETS DINÁMICOS
    await this.loadTargets();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET SHORTCUT BY ID
  public async setShortcutById() {
    try {
      // PAYLOAD BY ID
      const shortcutId = {
        shortcutId: this.shortcutID,
      };

      // GET SHORTCUT BY ID
      const { data } = await this.$apollo.query({
        query: GET_SHORTCUT,
        variables: shortcutId,
        fetchPolicy: "no-cache",
      });

      // SET SHORTCUT
      this.shortcut = data.findShortcutById;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // CARGAR TARGETS DINÁMICOS Y COMBINAR CON ESTÁTICOS
  public async loadTargets() {
    try {
      // LOAD DYNAMIC TARGETS
      await this.targetManager.loadDynamicTargets(this.$apollo);

      // COMBINE DYNAMIC TARGETS WITH STATIC TARGETS
      const staticTargets = this.targetCardShortcut.map(
        (data: any, index: number) => ({
          _id: `${data._id}-${index}`,
          target: data._id,
          targetID: null,
          name: data.value,
          icon: "mdi-folder",
          type: "static",
          isStatic: true,
          originalTarget: data,
        })
      );

      const dynamicTargets = this.targetManager.dynamicTargets.map(
        (data: any, index: number) => ({
          _id: data._id,
          target: null,
          targetID: data._id,
          name: data.name,
          icon: data.icon,
          type: "dynamic",
          isStatic: false,
          originalTarget: data,
        })
      );

      // COMBINE DYNAMIC TARGETS WITH STATIC TARGETS
      this.allTargets = [...staticTargets, ...dynamicTargets];

      // SET CORRECT TARGET FOR SELECT (PRE-SELECTION)
      this.setCorrectTargetForSelect();
    } catch (error) {
      console.error("Error loading targets:", error);
      // IF ERROR, USE ONLY STATIC TARGETS (ALREADY IN TARGETCARDSHORTCUT)
      this.allTargets = this.targetCardShortcut.map(
        (data: any, index: number) => ({
          _id: `${data._id}-${index}`,
          target: data._id,
          targetID: null,
          name: data.value,
          icon: "mdi-folder",
          type: "static",
          isStatic: true,
          originalTarget: data,
        })
      );
    }
  }

  // HANDLE TARGET SELECTION
  public onTargetSelected(selectedValue: string) {
    const selectedTarget = this.allTargets.find(
      (target) => target._id === selectedValue
    );

    if (selectedTarget) {
      // SET SELECTED TARGET
      this.selectedTarget = selectedTarget._id;

      // IF IT DOESN'T HAVE TYPE, IT'S A STATIC TARGET (FROM TARGETCARDSHORTCUT)
      if (!selectedTarget.type || selectedTarget.type === "static") {
        // STATIC TARGET: USE TARGET, TARGETID = NULL
        this.shortcut.target = selectedTarget.target;
        this.shortcut.targetID = null;
      } else {
        // DYNAMIC TARGET: USE TARGETID, TARGET = NULL
        this.shortcut.target = null;
        this.shortcut.targetID = selectedTarget.targetID;
      }
    }
  }

  // SET CORRECT TARGET FOR SELECT (PRE-SELECTION)
  public setCorrectTargetForSelect() {
    if (this.shortcut.targetID) {
      // DYNAMIC TARGET: FIND BY TARGETID
      const dynamicTarget = this.allTargets.find(
        (data) => data._id === this.shortcut.targetID
      );

      // SET CORRECT TARGET FOR SELECT
      if (dynamicTarget) {
        this.selectedTarget = dynamicTarget._id;
        this.shortcut.target = null;
        this.shortcut.targetID = dynamicTarget.targetID;
      }
    } else if (this.shortcut.target) {
      // STATIC TARGET: FIND BY TARGET
      const staticTarget = this.allTargets.find(
        (data) => data.target === this.shortcut.target
      );

      // SET CORRECT TARGET FOR SELECT
      if (staticTarget) {
        this.selectedTarget = staticTarget.target;
        this.shortcut.target = staticTarget.target;
        this.shortcut.targetID = null;
      }
    }
  }

  // UPDATE SHORTCUT
  public async updateShortcut() {
    // SET LOADING
    this.loading = true;

    try {
      // CLEAN SHORTCUT
      const cleanShortcuts = _.omit(
        this.shortcut,
        "_id",
        "__typename",
        "cards.__typename",
        "cards.title.__typename",
        "cards.description.__typename",
        "cards.button.__typename",
        "cards.icon.__typename",
        "cards.picture.__typename",
        "cards.background.__typename",
        "cards.newUploadPicture.__typename"
      );

      // CLEAN CARDS
      const cleanCards = this.shortcut.cards.map((card: any) => {
        return _.omit(
          card,
          "__typename",
          "title.__typename",
          "description.__typename",
          "button.__typename",
          "icon.__typename",
          "picture.__typename",
          "background.__typename",
          "newUploadPicture.__typename"
        );
      });

      // PREPARE SHORTCUT DATA
      const shortcutData = {
        ...cleanShortcuts,
        cards: cleanCards,
        // ENSURE THAT ONLY TARGET OR TARGETID IS SENT ACCORDING TO THE CASE
        target: this.shortcut.target || null,
        targetID: this.shortcut.targetID || null,
      };

      // PAYLOAD BY UPDATE
      const updateShortcutsDto = {
        updateShortcutsDto: {
          shortcutID: this.shortcutID,
          shortcut: shortcutData,
        },
      };

      // UPDATE SHORTCUT
      await this.$apollo.mutate({
        mutation: UPDATE_SHORTCUT,
        variables: updateShortcutsDto,
        fetchPolicy: "no-cache",
      });

      // SET LOADING
      this.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Acceso directo actualizada correctamente!",
        color: "success",
      });

      // REDIRECT TO SHORTCUTS LIST
      this.$router.push("/settings/shortcuts/list");
    } catch (err) {
      // SET LOADING
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // OPEN DIALOG CREATE
  public openDialogCreate() {
    // SET ACTION
    this.action = "create";

    // OPEN DIALOG
    this.dialog.show = true;
  }

  // OPEN DIALOG UPDATE
  public openDialogUpdate(card: CardShortcutInterface, index: number) {
    // SET ACTION
    this.action = "update";

    // SET DIALOG CARD
    this.dialog = {
      show: true,
      position: index,
      card: {
        _id: card._id,
        align: card.align,
        title: {
          text: card.title.text,
          color: card.title.color,
        },
        description: {
          text: card.description.text,
          color: card.description.color,
        },
        style: card.style,
        picture: card.picture,
        pictureImageDetail: card.pictureImageDetail || null,
        background: card.background,
        button: {
          text: card.button.text,
          color: card.button.color,
          background: card.button.background,
          enabled: card.button.enabled,
          link: card.button.link,
        },
        icon: card.icon,
      },
    };
  }

  // CLOSE DIALOG
  public closeDialog() {
    // CLEAR DIALOG
    this.dialog = {
      position: -1,
      show: false,
      card: {
        _id: "",
        align: "alignLeft",
        title: {
          text: "",
          color: "",
        },
        description: {
          text: "",
          color: "",
        },
        style: "cardsShortcutSmall",
        picture: "",
        pictureImageDetail: null,
        background: "",
        button: {
          text: "",
          color: "",
          background: "",
          enabled: false,
          link: "",
        },
        icon: "mdi-apps",
      },
    };
  }

  // ADD CARD SHORTCUT
  public addCardShortcut() {
    // CREATE NEW CARD WITH STATUS
    const newCard = { ...this.dialog.card };
    delete newCard._id; // Remove _id for new cards
    newCard.status = "create";
    this.shortcut.cards.push(newCard);
    this.closeDialog();
  }

  // UPDATE CARD SHORTCUT
  public updateCardShortcut() {
    // UPDATE EXISTING CARD WITH STATUS
    const updatedCard = { ...this.dialog.card };
    updatedCard.status = updatedCard._id ? "update" : "create";
    this.shortcut.cards[this.dialog.position] = updatedCard;
    this.closeDialog();
  }

  // REMOVE CARD SHORTCUT
  public removeCardShortcut(index: number) {
    this.shortcut.cards[index].status = "remove";
  }

  // GET CARD ALIGN
  public get cardAlign(): string {
    if (!this.dialog.card.align) return "Izquierda";
    switch (this.dialog.card.align) {
      case "alignLeft":
        return "Izquierda";
      case "alignRight":
        return "Derecha";
      case "alignCenter":
        return "Centro";
      default:
        return "Izquierda";
    }
  }

  public set cardAlign(newValue: AlignCardShortcut) {
    if (!this.dialog.card.align) this.dialog.card.align = newValue;
    switch (newValue) {
      case "alignLeft":
        this.dialog.card.align = "alignLeft";
        break;
      case "alignRight":
        this.dialog.card.align = "alignRight";
        break;
      case "alignCenter":
        this.dialog.card.align = "alignCenter";
        break;
      default:
        this.dialog.card.align = "alignLeft";
        break;
    }
  }

  get cardStyle(): string {
    if (!this.dialog.card.style) return "Pequeño";
    switch (this.dialog.card.style) {
      case "cardsShortcutMedium":
        return "Mediano";
      case "cardsShortcutLarge":
        return "Grande";
      default:
        return "Pequeño";
    }
  }

  set cardStyle(newValue: string) {
    if (!this.dialog.card.style) return;

    switch (newValue) {
      case "cardsShortcutMedium":
        this.dialog.card.style = "cardsShortcutMedium";
        break;
      case "cardsShortcutLarge":
        this.dialog.card.style = "cardsShortcutLarge";
        break;
      default:
        this.dialog.card.style = "cardsShortcutSmall";
        break;
    }
  }
}
export default ShortcutsUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row justify="center" no-gutters>
    <!-- ALERT INFO -->
    <v-col cols="8">
      <v-alert
        class="mt-10"
        rounded="xl"
        color="info"
        icon="$info"
        title="Información"
        prominent
      >
        <p class="text-body-2 my-2">
          Puedes gestionar tus iconos bajo la biblioteca de materials icons
        </p>
        aquí:
        <a href="https://materialdesignicons.com/" 
          target="_blank"
          rel="noopener noreferrer"
          >https://materialdesignicons.com/</a
        >
      </v-alert>
    </v-col>
    <v-col class="mt-10" cols="10">
      <v-form>
        <v-row justify="center">
          <v-col cols="5">
            <v-text-field
              v-model="shortcut.name"
              prepend-inner-icon="mdi-card"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Nombre de acceso directo"
              required
              clearable
            />
          </v-col>
          <v-col cols="5">
            <v-text-field
              v-model="shortcut.icon"
              :prepend-inner-icon="shortcut.icon ? shortcut.icon : 'mdi-apps'"
              density="compact"
              hint="Catalogo de iconos aquí: https://materialdesignicons.com/"
              variant="solo"
              rounded="xl"
              label="Icono"
              required
              clearable
            />
          </v-col>
          <v-col cols="5">
            <v-text-field
              v-model="shortcut.color"
              rounded="xl"
              density="compact"
              variant="solo"
              label="Color de letra del acceso directo"
            >
              <template #prepend-inner>
                <v-icon :color="shortcut.color"> mdi-record </v-icon>
              </template>
              <v-menu activator="parent">
                <v-color-picker
                  v-model="shortcut.color"
                  rounded="xl"
                  width="100%"
                  mode="hex"
                  density="compact"
                  variant="solo"
                />
              </v-menu>
            </v-text-field>
          </v-col>
          <v-col cols="5">
            <v-text-field
              v-model="shortcut.background"
              rounded="xl"
              density="compact"
              variant="solo"
              label="Fondo del acceso directo"
            >
              <template #prepend-inner>
                <v-icon :color="shortcut.background"> mdi-record </v-icon>
              </template>
              <v-menu activator="parent">
                <v-color-picker
                  v-model="shortcut.background"
                  rounded="xl"
                  width="100%"
                  mode="hex"
                  density="compact"
                  variant="solo"
                />
              </v-menu>
            </v-text-field>
          </v-col>
          <v-col cols="10">
            <v-select
              v-model="selectedTarget"
              :items="allTargets"
              item-value="_id"
              item-title="name"
              prepend-inner-icon="mdi-card"
              density="compact"
              variant="solo"
              rounded="xl"
              label="Ubicación de tarjetas"
              @update:model-value="onTargetSelected"
              required
              clearable
            >
              <template v-slot:item="{ props, item }">
                <v-list-item v-bind="props" :title="item.raw.name">
                  <template v-slot:prepend>
                    <v-icon
                      :color="
                        !item.raw.type || item.raw.type === 'static'
                          ? 'primary'
                          : 'green'
                      "
                    >
                      {{ item.raw.icon }}
                    </v-icon>
                  </template>
                </v-list-item>
              </template>
            </v-select>
          </v-col>
        </v-row>
      </v-form>
    </v-col>

    <!-- SHORTCUTS CARDS CREATE -->
    <v-col
      class="shortcuts-create-card py-0 px-5 mt-5 mx-auto text-center align-center d-flex"
      cols="12"
    >
      <p class="text-weight-bold">Crear nueva tarjeta de acceso</p>
      <v-btn
        @click="openDialogCreate()"
        class="ml-5"
        density="compact"
        variant="outlined"
        color="white"
        icon
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-col>

    <!-- SHORTCUTS CARDS LIST -->
    <v-col cols="10">
      <v-row class="px-5 py-10" justify="center">
        <template v-for="(card, index) in shortcut.cards">
          <!-- CARD SMALL -->
          <v-col
            v-if="
              card.style === 'cardsShortcutSmall' && card.status !== 'remove'
            "
            :key="index"
            cols="4"
          >
            <v-card
              height="180"
              class="mx-2 my-2"
              rounded="lg"
              :color="card.background"
              :dark="card.background === '#000000'"
            >
              <v-img
                width="100%"
                height="100%"
                :src="card.picture?.trim() && !card.pictureImageDetail?.image? card.picture:card.pictureImageDetail?.image"
                cover
              >
                <v-btn
                  @click="openDialogUpdate(card, index)"
                  density="comfortable"
                  location="left top"
                  position="absolute"
                  class="mt-2 ml-2"
                  style="z-index: 10"
                  icon
                >
                  <v-icon color="#12539b" size="20"> mdi-pencil </v-icon>
                </v-btn>
                <v-btn
                  @click="removeCardShortcut(index)"
                  density="comfortable"
                  location="right top"
                  position="absolute"
                  class="mt-2 mr-2"
                  style="z-index: 10"
                  icon
                >
                  <v-icon color="#12539b" size="20"> mdi-delete </v-icon>
                </v-btn>
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

          <!-- CARD MEDIUM -->
          <v-col
            v-if="
              card.style === 'cardsShortcutMedium' && card.status !== 'remove'
            "
            :key="index"
            cols="6"
          >
            <v-card
              height="320"
              class="mx-2 my-2"
              rounded="lg"
              :color="card.background"
              :dark="card.background === '#000000'"
            >
              <v-img
                width="100%"
                height="100%"
                :src="card.picture?.trim() && !card.pictureImageDetail?.image? card.picture:card.pictureImageDetail?.image"
                cover
              >
                <v-btn
                  @click="openDialogUpdate(card, index)"
                  density="comfortable"
                  location="left top"
                  position="absolute"
                  class="mt-2 ml-2"
                  style="z-index: 10"
                  icon
                >
                  <v-icon color="#12539b" size="20"> mdi-pencil </v-icon>
                </v-btn>
                <v-btn
                  @click="removeCardShortcut(index)"
                  density="comfortable"
                  location="right top"
                  position="absolute"
                  class="mt-2 mr-2"
                  style="z-index: 10"
                  icon
                >
                  <v-icon color="#12539b" size="20"> mdi-delete </v-icon>
                </v-btn>
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
                    <v-icon
                      class="ml-3"
                      :color="card.title.color"
                      size="24"
                      v-if="card.icon"
                    >
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

          <!-- CARD LARGE -->
          <v-col
            v-if="
              card.style === 'cardsShortcutLarge' && card.status !== 'remove'
            "
            :key="index"
            cols="12"
          >
            <v-card
              class="mx-2 my-2"
              height="300"
              rounded="lg"
              :color="card.background"
              :dark="card.background === '#000000'"
            >
              <v-img
                width="100%"
                height="300"
                :src="
                  card.picture?.trim() && !card.pictureImageDetail?.image
                    ? card.picture
                    : card.pictureImageDetail?.image
                "
                cover
              >
                <v-btn
                  @click="openDialogUpdate(card, index)"
                  density="comfortable"
                  location="left top"
                  position="absolute"
                  class="mt-2 ml-2"
                  style="z-index: 10"
                  icon
                >
                  <v-icon color="#12539b" size="20"> mdi-pencil </v-icon>
                </v-btn>
                <v-btn
                  @click="removeCardShortcut(index)"
                  density="comfortable"
                  location="right top"
                  position="absolute"
                  class="mt-2 mr-2"
                  style="z-index: 10"
                  icon
                >
                  <v-icon color="#12539b" size="20"> mdi-delete </v-icon>
                </v-btn>
                <v-row
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
        <v-col cols="10" class="text-center">
          <v-btn
            @click="updateShortcut()"
            class="mt-5"
            color="primary"
            rounded="xl"
            width="50%"
            :loading="loading"
          >
            Actualizar acceso directo
          </v-btn>
        </v-col>
      </v-row>
    </v-col>

    <!-- DIALOG CREATE CARD SHORTCUT -->
    <v-dialog
      class="dialog-create-shortcut"
      v-model="dialog.show"
      max-width="650"
      persistent
    >
      <v-card rounded="xl">
        <v-card-text>
          <v-row justify="center">
            <v-col cols="12" class="text-center">
              <detailed-image-component
                color="#00a44f"
                rounded="xl"
                height="200"
                v-model="dialog.card.pictureImageDetail"
                :legacy-image="dialog.card.picture"
                text="Cargar imagen"
              ></detailed-image-component>
            </v-col>
            <v-col cols="5">
              <v-select
                v-model="cardStyle"
                :items="styleCardShortcut"
                item-value="_id"
                item-title="value"
                prepend-inner-icon="mdi-card"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Estilo de tarjeta"
                required
                clearable
              />
            </v-col>
            <v-col cols="5">
              <v-select
                v-model="cardAlign"
                :items="shortcutAlignCard"
                item-value="_id"
                item-title="value"
                prepend-inner-icon="mdi-card"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Alineación de tarjeta"
                required
                clearable
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="dialog.card.title.text"
                prepend-inner-icon="mdi-card"
                density="compact"
                variant="solo"
                rounded="xl"
                label="Título de la tarjeta"
                required
                clearable
              />
            </v-col>
            <v-col cols="5">
              <v-text-field
                v-model="dialog.card.title.color"
                rounded="xl"
                density="compact"
                variant="solo"
                label="Color de letra del título"
              >
                <template #prepend-inner>
                  <v-icon :color="dialog.card.title.color"> mdi-record </v-icon>
                </template>
                <v-menu activator="parent">
                  <v-color-picker
                    v-model="dialog.card.title.color"
                    rounded="xl"
                    width="100%"
                    mode="hex"
                    density="compact"
                    variant="solo"
                  />
                </v-menu>
              </v-text-field>
            </v-col>
            <template v-if="dialog.card.style !== 'cardsShortcutSmall'">
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.card.description.text"
                  prepend-inner-icon="mdi-card"
                  density="compact"
                  variant="solo"
                  rounded="xl"
                  label="Descripción de la tarjeta"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.card.description.color"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Color de letra de la descripción"
                >
                  <template #prepend-inner>
                    <v-icon :color="dialog.card.description.color">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker
                      v-model="dialog.card.description.color"
                      rounded="xl"
                      width="100%"
                      mode="hex"
                      density="compact"
                      variant="solo"
                    />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.card.icon"
                  prepend-inner-icon="mdi-apps"
                  density="compact"
                  variant="solo"
                  rounded="xl"
                  label="Icono"
                  required
                  clearable
                />
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.card.background"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Fondo de la tarjeta"
                >
                  <template #prepend-inner>
                    <v-icon :color="dialog.card.background">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker
                      v-model="dialog.card.background"
                      rounded="xl"
                      width="100%"
                      mode="hex"
                      density="compact"
                      variant="solo"
                    />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col
                class="shortcuts-create-card py-0 px-5 mb-5 mx-auto text-center align-center d-flex"
                cols="12"
              >
                <p class="text-weight-bold">Estilos del botón</p>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.card.button.text"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Texto del botón"
                >
                </v-text-field>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.card.button.color"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Color de letra del botón"
                >
                  <template #prepend-inner>
                    <v-icon :color="dialog.card.button.color">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker
                      v-model="dialog.card.button.color"
                      rounded="xl"
                      width="100%"
                      mode="hex"
                      density="compact"
                      variant="solo"
                    />
                  </v-menu>
                </v-text-field>
              </v-col>
              <v-col cols="5">
                <v-text-field
                  v-model="dialog.card.button.background"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Fondo del botón"
                >
                  <template #prepend-inner>
                    <v-icon :color="dialog.card.button.background">
                      mdi-record
                    </v-icon>
                  </template>
                  <v-menu activator="parent">
                    <v-color-picker
                      v-model="dialog.card.button.background"
                      rounded="xl"
                      width="100%"
                      mode="hex"
                      density="compact"
                      variant="solo"
                    />
                  </v-menu>
                </v-text-field>
              </v-col>
            </template>
            <v-col
              :cols="dialog.card.style === 'cardsShortcutSmall' ? '10' : '5'"
            >
              <v-text-field
                v-model="dialog.card.button.link"
                rounded="xl"
                density="compact"
                variant="solo"
                label="Link del botón"
              >
              </v-text-field>
            </v-col>
          </v-row>
        </v-card-text>
        <v-card-actions class="d-flex justify-center">
          <v-btn @click="closeDialog()"> cancelar </v-btn>
          <v-spacer></v-spacer>
          <v-btn
            @click="
              action === 'create' ? addCardShortcut() : updateCardShortcut()
            "
          >
            {{ action === "create" ? "agregar" : "actualizar" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<style lang="scss">
.shortcuts-create-card {
  height: 80px;
  background-color: #12539b;
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
    max-height: 160px;
    overflow: hidden;
  }
}

.dialog-create-shortcut {
  .v-overlay__content {
    .v-card {
      &::-webkit-scrollbar {
        display: none !important;
        scrollbar-width: none !important;
        -ms-overflow-style: none !important;
      }
    }
  }
}
</style>
