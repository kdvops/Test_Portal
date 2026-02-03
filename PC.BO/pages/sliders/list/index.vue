<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// @ts-nocheck
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT LODASH
import _ from "lodash";

// IMPORT DRAGGABLE
import draggable from "vuedraggable";

// IMPORT ANIMATIONS LOTTIE
import AnimationSlider from "~/assets/animations/slider-animation.json";

// IMPORT INTERFACE
import type {
  SliderInterface,
  SlidersForTarget,
} from "~/interfaces/slider.interface";
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT QUERY'S
import { GET_SLIDERS } from "~/graphql/query/slider.query";

// IMPORT MUTATIONS
import {
  REMOVE_SLIDER,
  UPDATE_SLIDERS_POSITIONS,
} from "~/graphql/mutations/slider.mutation";

// IMPORT COMPOSABLES
import { useTargetManager } from "~/composables/useTargetManager";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "sliders-list-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
    draggable,
  },
})
class SlidersListScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // ANIMATIONS LOTTIE
  public animationSlider: any = AnimationSlider;

  // DIALOG DELETE SLIDER OPTIONS
  public dialog = {
    show: false,
    sliderID: "",
    loading: false,
  };

  // SLIDER DEFAULT VALUES
  public sliders: Array<SliderInterface> = [
    {
      picture: "",
      responsive: "",
      title: {
        text: "",
        align: "",
        color: "",
        size: "",
        weight: "",
      },
      subtitle: {
        text: "",
        align: "",
        color: "",
        size: "",
        weight: "",
      },
      description: {
        text: "",
        align: "",
        color: "",
        size: "",
        weight: "",
      },
      button: {
        enabled: false,
        text: "",
        align: "",
        color: "",
        weight: "",
        background: "",
        link: "",
      },
      disabled: false,
    },
  ];

  // TARGET MANAGER COMPOSABLE
  public targetManager = useTargetManager();

  // DYNAMIC TARGETS WITH SLIDERS
  public dynamicTargetsWithSliders: Array<{
    target: TargetInterface;
    sliders: Array<SliderInterface>;
  }> = [];

  // LOADING STATE
  public loadingDynamicTargets: boolean = false;

  // SAVING POSITIONS STATE
  public savingPositions: { [key: string]: boolean } = {};

  // EDITED TARGETS (TO TRACK WHICH TARGETS HAVE CHANGES)
  public editedTargets: Set<string> = new Set();

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public async created() {
    await this.setSliders();
    await this.loadDynamicTargetsWithSliders();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET SLIDERS
  public async setSliders() {
    try {
      // GET ALL SLIDERS
      const { data } = await this.$apollo.query({
        query: GET_SLIDERS,
        fetchPolicy: "no-cache",
      });

      // VALIDATE AND ASSIGN DEFAULT POSITIONS IF NULL
      this.sliders = this.assignDefaultPositions(data.sliders || []);
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // ASSIGN DEFAULT POSITIONS - ASSIGN DEFAULT POSITIONS TO SLIDERS WITH NULL POSITION
  public assignDefaultPositions(
    sliders: Array<SliderInterface>
  ): Array<SliderInterface> {
    // GROUP SLIDERS BY TARGET TO ASSIGN RELATIVE POSITIONS
    const slidersByTarget: { [key: string]: Array<SliderInterface> } = {};

    sliders.forEach((slider) => {
      const target = slider.target || "default";
      if (!slidersByTarget[target]) {
        slidersByTarget[target] = [];
      }
      slidersByTarget[target].push(slider);
    });

    // ASSIGN DEFAULT POSITIONS BASED ON CURRENT ORDER AND TARGET
    const updatedSliders: Array<SliderInterface> = [];

    Object.keys(slidersByTarget).forEach((target) => {
      const targetSliders = slidersByTarget[target];

      // SORT BY EXISTING POSITION (IF EXISTS) OR MAINTAIN ORIGINAL ORDER
      targetSliders.sort((a, b) => {
        const posA = a.position != null ? a.position : 9999;
        const posB = b.position != null ? b.position : 9999;
        return posA - posB;
      });

      // ASSIGN SEQUENTIAL POSITIONS
      targetSliders.forEach((slider, index) => {
        if (slider.position == null || slider.position === undefined) {
          slider.position = index + 1;
        }
        updatedSliders.push(slider);
      });
    });

    return updatedSliders;
  }

  // LOAD DYNAMIC TARGETS WITH SLIDERS
  public async loadDynamicTargetsWithSliders() {
    this.loadingDynamicTargets = true;
    try {
      // LOAD DYNAMIC TARGETS
      await this.targetManager.loadDynamicTargets(
        this.$apollo
      );

      // GET ALL DYNAMIC TARGETS
      const { dynamicTargets } = this.targetManager;

      // LOAD SLIDERS FOR EACH DYNAMIC TARGET
      this.dynamicTargetsWithSliders = [];

      for (const target of dynamicTargets) {
        try {
          const sliders = await this.targetManager.getSlidersForTarget(
            this.$apollo,
            target._id
          );

          // VALIDATE AND ASSIGN DEFAULT POSITIONS TO DYNAMIC SLIDERS
          const validatedSliders = this.assignDefaultPositions(sliders || []);

          // SORT BY POSITION
          validatedSliders.sort((a, b) => {
            const posA = a.position != null ? a.position : 9999;
            const posB = b.position != null ? b.position : 9999;
            return posA - posB;
          });

          this.dynamicTargetsWithSliders.push({
            target,
            sliders: validatedSliders,
          });
        } catch (error) {
          console.error(
            `Error loading sliders for target ${target._id}:`,
            error
          );
          // Add target with empty sliders array
          this.dynamicTargetsWithSliders.push({
            target,
            sliders: [],
          });
        }
      }
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    } finally {
      this.loadingDynamicTargets = false;
    }
  }

  // REMOVE SLIDER
  public async removeSlider() {
    // SET LOADING
    this.dialog.loading = true;

    try {
      // REMOVE SLIDER
      await this.$apollo.mutate({
        mutation: REMOVE_SLIDER,
        variables: {
          sliderId: this.dialog.sliderID,
        },
      });

      // SET LOADING
      this.dialog.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Slider eliminado correctamente!",
        color: "success",
        timeout: 6000,
      });

      // CLOSE DIALOG
      this.closeDialogAlertRemove();

      // RELOAD SLIDERS AND DYNAMIC TARGETS
      await this.setSliders();
      await this.loadDynamicTargetsWithSliders();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO CREATE SLIDER
  public goCreate() {
    this.$router.push(`/sliders/create`);
  }

  // GO TO UPDATE SLIDER
  public goUpdate(sliderID: string) {
    this.$router.push(`/sliders/update/${sliderID}`);
  }

  // GET SLIDERS FOR TARGET
  public get slidersForTarget(): SlidersForTarget {
    const sliders = this.sliders;

    // FILTER AND SORT BY POSITION, ASSIGNING DEFAULT POSITION IF NULL
    const filterAndSort = (targetValue: string) => {
      const filtered = sliders.filter(
        (slider: SliderInterface) => slider.target === targetValue
      );

      // ENSURE ALL HAVE VALID POSITION
      filtered.forEach((slider, index) => {
        if (slider.position == null || slider.position === undefined) {
          slider.position = index + 1;
        }
      });

      // SORT BY POSITION
      return filtered.sort((a, b) => {
        const posA = a.position != null ? a.position : 9999;
        const posB = b.position != null ? b.position : 9999;
        return posA - posB;
      });
    };

    const bannerHome = filterAndSort("banner::home");
    const bannerProfits = filterAndSort("banner::profits");
    const bannerPromotions = filterAndSort("banner::promotions");
    const bannerFinancially = filterAndSort("banner::financially");
    const bannerBusiness = filterAndSort("banner::business");
    const bannerEnterprise = filterAndSort("banner::enterprise");
    const bannerInsurance = filterAndSort("banner::insurance");
    const bannerAdjudicated = filterAndSort("banner::adjudicated");
    const bannerProuser = filterAndSort("banner::prouser");

    return {
      bannerHome,
      bannerProfits,
      bannerPromotions,
      bannerFinancially,
      bannerBusiness,
      bannerEnterprise,
      bannerInsurance,
      bannerAdjudicated,
      bannerProuser,
    };
  }

  // OPEN DIALOG ALERT REMOVE SLIDER
  public openDialogAlertRemove(sliderID: string) {
    this.dialog.show = true;
    this.dialog.sliderID = sliderID;
  }

  // CLOSE DIALOG ALERT REMOVE SLIDER
  public closeDialogAlertRemove() {
    this.dialog.show = false;
    this.dialog.sliderID = "";
    this.dialog.loading = false;
  }

  // HANDLE DRAG END - UPDATE POSITIONS WHEN A SLIDER IS MOVED
  public async onDragEnd(
    evt: any,
    targetKey: string,
    sliders: Array<SliderInterface>
  ) {
    if (evt.oldIndex === evt.newIndex) return;

    // MARK TARGET AS EDITED
    this.editedTargets.add(targetKey);
  }

  // UPDATE SLIDERS ARRAY BASED ON TARGET KEY
  public updateSlidersArray(
    targetKey: string,
    updatedSliders: Array<SliderInterface>
  ) {
    // UPDATE MAIN SLIDERS ARRAY
    const targetMap: { [key: string]: string } = {
      bannerHome: "banner::home",
      bannerPromotions: "banner::promotions",
      bannerProfits: "banner::profits",
      bannerFinancially: "banner::financially",
      bannerBusiness: "banner::business",
      bannerEnterprise: "banner::enterprise",
      bannerInsurance: "banner::insurance",
      bannerAdjudicated: "banner::adjudicated",
      bannerProuser: "banner::prouser",
    };

    const targetValue = targetMap[targetKey];
    if (!targetValue) {
      // IF IT IS A DYNAMIC TARGET, UPDATE dynamicTargetsWithSliders
      if (targetKey.startsWith("dynamic_")) {
        const targetId = targetKey.replace("dynamic_", "");
        const targetIndex = this.dynamicTargetsWithSliders.findIndex(
          (t) => t.target._id === targetId
        );
        if (targetIndex !== -1) {
          // UPDATE POSITIONS IN THE DYNAMIC TARGET SLIDERS ARRAY
          // THE updatedSliders ARRAY ALREADY COMES IN THE CORRECT ORDER AFTER DRAG
          const updatedWithPositions = updatedSliders.map((slider, index) => ({
            ...slider,
            position: index + 1, // UPDATE POSITION BASED ON ARRAY INDEX
          }));
          this.dynamicTargetsWithSliders[targetIndex].sliders = updatedWithPositions;
        }
      }
      return;
    }

    // REMOVE OLD SLIDERS FROM THIS TARGET
    this.sliders = this.sliders.filter((s) => s.target !== targetValue);

    // ADD UPDATED SLIDERS WITH CORRECT POSITIONS
    // THE updatedSliders ARRAY ALREADY COMES IN THE CORRECT ORDER AFTER DRAG
    // UPDATE POSITIONS BASED ON ARRAY INDEX (1, 2, 3, ...)
    const slidersWithPositions = updatedSliders.map((slider, index) => ({
      ...slider,
      position: index + 1, // ALWAYS UPDATE POSITION BASED ON ARRAY ORDER
    }));

    this.sliders = [...this.sliders, ...slidersWithPositions];
  }

  // SET FIRST SLIDER - MARK A SLIDER AS FIRST (POSITION 1)
  public async setFirstSlider(
    sliderId: string,
    targetKey: string,
    sliders: Array<SliderInterface>
  ) {
    try {
      // FIND THE SLIDER
      const sliderIndex = sliders.findIndex((s) => s._id === sliderId);
      if (sliderIndex === -1) return;

      // MOVE THE SLIDER TO THE BEGINNING
      const slider = sliders[sliderIndex];
      const newSliders = [slider, ...sliders.filter((s) => s._id !== sliderId)];

      // UPDATE POSITIONS, ENSURING THEY ALWAYS HAVE A VALID VALUE
      const updatedSliders = newSliders.map((s, index) => ({
        ...s,
        position: index + 1, // ALWAYS ASSIGN VALID POSITION
      }));

      // UPDATE ARRAY
      this.updateSlidersArray(targetKey, updatedSliders);

      // MARK AS EDITED
      this.editedTargets.add(targetKey);

      // SAVE POSITIONS
      await this.saveSlidersPositions(targetKey, updatedSliders);
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // SAVE SLIDERS POSITIONS - SAVE POSITIONS TO BACKEND (ONLY FOR SPECIFIC TARGET)
  public async saveSlidersPositions(
    targetKey: string,
    sliders: Array<SliderInterface>
  ) {
    if (!sliders || sliders.length === 0) {
      console.warn("NO SLIDERS TO SAVE FOR", targetKey);
      return;
    }

    this.savingPositions[targetKey] = true;

    try {
      // MAP targetKey TO TARGET VALUE
      const targetMap: { [key: string]: string } = {
        bannerHome: "banner::home",
        bannerPromotions: "banner::promotions",
        bannerProfits: "banner::profits",
        bannerFinancially: "banner::financially",
        bannerBusiness: "banner::business",
        bannerEnterprise: "banner::enterprise",
        bannerInsurance: "banner::insurance",
        bannerAdjudicated: "banner::adjudicated",
        bannerProuser: "banner::prouser",
      };

      // IF IT IS A DYNAMIC TARGET, GET SLIDERS DIRECTLY FROM ARRAY
      let slidersToSave = sliders;
      if (targetKey.startsWith("dynamic_")) {
        const targetId = targetKey.replace("dynamic_", "");
        const targetWithSliders = this.dynamicTargetsWithSliders.find(
          (t) => t.target._id === targetId
        );
        if (targetWithSliders) {
          slidersToSave = targetWithSliders.sliders;
        }
      } else {
        // FOR STATIC TARGETS, GET FROM MAIN ARRAY FILTERED BY TARGET
        const targetValue = targetMap[targetKey];
        if (targetValue) {
          slidersToSave = this.sliders
            .filter((s) => s.target === targetValue)
            .sort((a, b) => {
              const posA = a.position != null ? a.position : 9999;
              const posB = b.position != null ? b.position : 9999;
              return posA - posB;
            });
        }
      }

      if (!slidersToSave || slidersToSave.length === 0) {
        console.warn("NO SLIDERS FOUND TO SAVE FOR", targetKey);
        return;
      }

      // PREPARE ARRAY WITH ONLY ID AND POSITION OF SLIDERS FOR THIS TARGET
      // POSITIONS ARE CALCULATED BASED ON ARRAY ORDER (index + 1)
      const slidersToUpdate = slidersToSave.map((slider, index) => ({
        id: slider._id!,
        position: index + 1, // ALWAYS USE INDEX + 1 AS POSITION
      }));

      console.log("SAVING POSITIONS FOR", targetKey, slidersToUpdate);

      // SEND MUTATION WITH ONLY SLIDERS FOR THIS TARGET
      const result = await this.$apollo.mutate({
        mutation: UPDATE_SLIDERS_POSITIONS,
        variables: {
          updatePositionsSliderDto: {
            sliders: slidersToUpdate,
          },
        },
      });

      console.log("MUTATION RESULT:", result);

      this.$bus.$emit("showSnackbar", {
        text: "Posiciones actualizadas correctamente!",
        color: "success",
        timeout: 4000,
      });

      // REMOVE FROM EDITED
      this.editedTargets.delete(targetKey);

      // RELOAD SLIDERS TO ENSURE DATA IS SYNCHRONIZED
      await this.setSliders();
      await this.loadDynamicTargetsWithSliders();
    } catch (err: any) {
      console.error("ERROR SAVING POSITIONS:", err);
      console.error("ERROR DETAILS:", err?.graphQLErrors || err?.networkError || err);
      this.$bus.$emit("handleError", err);
    } finally {
      this.savingPositions[targetKey] = false;
    }
  }
}
export default SlidersListScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="11">
      <client-only>
        <v-card
          width="100%"
          height="180px"
          rounded="xl"
          class="card-principal-container pa-0 ma-0"
          color="#12539b"
          flat
        >
          <v-card-text>
            <v-row align-content="center" justify="space-between">
              <v-col
                cols="6"
                class="card-principal-info-container text-left d-flex flex-column align-self-center"
              >
                <p
                  class="text-h5 text-uppercase text-white font-weight-bold ml-10"
                >
                  Lista de sliders,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus slider de una manera mas sencilla!
                </p>
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="400px"
                  height="400px"
                  :loop="true"
                  :animationData="animationSlider"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5" justify="start" align-content="center">
    <v-col cols="3">
      <v-text-field
        class="ml-5"
        prepend-inner-icon="mdi-magnify"
        rounded="xl"
        density="compact"
        variant="solo"
        label="Buscar Banner"
      />
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="start" align-content="center">
    <!-- TARGET SECTION: HOME BANNER -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#4caf50' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#4caf50">mdi-star</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER DE HOME
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerHome') &&
                  slidersForTarget.bannerHome.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerHome']"
                @click="
                  saveSlidersPositions('bannerHome', slidersForTarget.bannerHome)
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerHome"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerHome', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerHome', slidersForTarget.bannerHome)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerHome',
                          slidersForTarget.bannerHome
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" eager cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#4caf50' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- TARGET SECTION: PROMOTIONS -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#12539b' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#12539b">mdi-tag</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER DE PROMOCIONES
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerPromotions') &&
                  slidersForTarget.bannerPromotions.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerPromotions']"
                @click="
                  saveSlidersPositions(
                    'bannerPromotions',
                    slidersForTarget.bannerPromotions
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerPromotions"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerPromotions', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerPromotions', slidersForTarget.bannerPromotions)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerPromotions',
                          slidersForTarget.bannerPromotions
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#12539b' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- TARGET SECTION: BENEFITS -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#4caf50' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#4caf50">mdi-gift</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER DE BENEFICIOS
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerProfits') &&
                  slidersForTarget.bannerProfits.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerProfits']"
                @click="
                  saveSlidersPositions(
                    'bannerProfits',
                    slidersForTarget.bannerProfits
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerProfits"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerProfits', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerProfits', slidersForTarget.bannerProfits)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerProfits',
                          slidersForTarget.bannerProfits
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" eager cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#4caf50' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- TARGET SECTION: FINANCIALLY -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#12539b' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#12539b">mdi-bank</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER FINANCIERAMENTE
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerFinancially') &&
                  slidersForTarget.bannerFinancially.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerFinancially']"
                @click="
                  saveSlidersPositions(
                    'bannerFinancially',
                    slidersForTarget.bannerFinancially
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerFinancially"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerFinancially', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerFinancially', slidersForTarget.bannerFinancially)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerFinancially',
                          slidersForTarget.bannerFinancially
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" eager cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#12539b' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- TARGET SECTION: MY BUSINESS -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#4caf50' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#4caf50">mdi-store</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER MI NEGOCIO
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerBusiness') &&
                  slidersForTarget.bannerBusiness.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerBusiness']"
                @click="
                  saveSlidersPositions(
                    'bannerBusiness',
                    slidersForTarget.bannerBusiness
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerBusiness"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerBusiness', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerBusiness', slidersForTarget.bannerBusiness)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerBusiness',
                          slidersForTarget.bannerBusiness
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#4caf50' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- TARGET SECTION: FOR YOUR COMPANY -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#12539b' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#12539b">mdi-domain</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER PARA TU EMPRESA
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerEnterprise') &&
                  slidersForTarget.bannerEnterprise.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerEnterprise']"
                @click="
                  saveSlidersPositions(
                    'bannerEnterprise',
                    slidersForTarget.bannerEnterprise
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerEnterprise"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerEnterprise', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerEnterprise', slidersForTarget.bannerEnterprise)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerEnterprise',
                          slidersForTarget.bannerEnterprise
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#12539b' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- TARGET SECTION: INSURANCE -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#4caf50' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#4caf50">mdi-shield</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER SEGUROS
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerInsurance') &&
                  slidersForTarget.bannerInsurance.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerInsurance']"
                @click="
                  saveSlidersPositions(
                    'bannerInsurance',
                    slidersForTarget.bannerInsurance
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerInsurance"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerInsurance', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerInsurance', slidersForTarget.bannerInsurance)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerInsurance',
                          slidersForTarget.bannerInsurance
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" eager cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#4caf50' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- TARGET SECTION: ADJUDICATED ASSETS -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#12539b' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#12539b">mdi-home</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER BIENES ADJUDICADOS
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerAdjudicated') &&
                  slidersForTarget.bannerAdjudicated.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerAdjudicated']"
                @click="
                  saveSlidersPositions(
                    'bannerAdjudicated',
                    slidersForTarget.bannerAdjudicated
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerAdjudicated"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerAdjudicated', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerAdjudicated', slidersForTarget.bannerAdjudicated)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerAdjudicated',
                          slidersForTarget.bannerAdjudicated
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" eager cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#12539b' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- TARGET SECTION: USER PROTECTION -->
    <v-col cols="12" class="mb-0">
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{ backgroundColor: '#4caf50' }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon size="30" color="#4caf50">mdi-account-shield</v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              BANNER PROTECCIÓN AL USUARIO
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has('bannerProuser') &&
                  slidersForTarget.bannerProuser.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="savingPositions['bannerProuser']"
                @click="
                  saveSlidersPositions(
                    'bannerProuser',
                    slidersForTarget.bannerProuser
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="slidersForTarget.bannerProuser"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray('bannerProuser', newValue); }"
          @end="(evt: any) => onDragEnd(evt, 'bannerProuser', slidersForTarget.bannerProuser)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          'bannerProuser',
                          slidersForTarget.bannerProuser
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" eager cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{ backgroundColor: '#4caf50' }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>

    <!-- DYNAMIC TARGETS SECTIONS -->
    <v-col
      v-for="targetWithSliders in dynamicTargetsWithSliders"
      :key="targetWithSliders.target._id"
      cols="12"
      class="mb-0"
    >
      <!-- TARGET HEADER -->
      <v-card
        rounded="xl"
        class="mb-4"
        :style="{
          backgroundColor: targetWithSliders.target.color || '#4caf50',
        }"
        height="80"
      >
        <v-card-text class="d-flex align-center justify-space-between pa-3">
          <div class="d-flex align-center">
            <v-avatar size="60" color="white" class="mr-4">
              <v-icon
                size="30"
                :color="targetWithSliders.target.color || '#4caf50'"
              >
                {{ targetWithSliders.target.icon || "mdi-folder" }}
              </v-icon>
            </v-avatar>
            <h2 class="text-h6 text-white font-weight-bold text-uppercase">
              {{ targetWithSliders.target.name }}
            </h2>
          </div>

          <!-- SAVE POSITIONS BUTTON -->
          <v-tooltip text="Guardar Posiciones" location="bottom">
            <template v-slot:activator="{ props }">
              <v-btn
                v-if="
                  editedTargets.has(`dynamic_${targetWithSliders.target._id}`) &&
                  targetWithSliders.sliders.length > 1
                "
                v-bind="props"
                icon
                color="white"
                class="ml-auto"
                :loading="
                  savingPositions[`dynamic_${targetWithSliders.target._id}`]
                "
                @click="
                  saveSlidersPositions(
                    `dynamic_${targetWithSliders.target._id}`,
                    targetWithSliders.sliders
                  )
                "
                size="small"
                rounded="xl"
                elevation="4"
              >
                <v-icon size="24">mdi-content-save</v-icon>
              </v-btn>
            </template>
          </v-tooltip>
        </v-card-text>
      </v-card>

      <!-- SLIDERS DRAGGABLE CONTAINER -->
      <div class="sliders-container pa-4" style="overflow-x: auto">
        <draggable
          :model-value="targetWithSliders.sliders"
          :animation="200"
          handle=".drag-handle"
          item-key="_id"
          class="d-flex flex-nowrap"
          style="min-width: max-content"
          @update:model-value="(newValue: Array<SliderInterface>) => { updateSlidersArray(`dynamic_${targetWithSliders.target._id}`, newValue); }"
          @end="(evt: any) => onDragEnd(evt, `dynamic_${targetWithSliders.target._id}`, targetWithSliders.sliders)"
        >
          <template #item="{ element: slider, index }">
            <div
              class="slider-item-wrapper ma-2"
              style="position: relative; flex-shrink: 0"
            >
              <v-hover>
                <template v-slot:default="{ isHovering, props }">
                  <v-card
                    height="200"
                    width="300"
                    rounded="xl"
                    v-bind="props"
                    class="slider-card"
                    style="position: relative"
                  >
                    <!-- DRAG HANDLE -->
                    <v-btn
                      icon
                      size="small"
                      class="drag-handle"
                      style="
                        position: absolute;
                        top: 8px;
                        left: 8px;
                        z-index: 10;
                        background: rgba(0, 0, 0, 0.6);
                      "
                      color="white"
                    >
                      <v-icon size="18">mdi-drag</v-icon>
                    </v-btn>

                    <!-- FLOATING BUTTON FOR FIRST -->
                    <v-btn
                      v-if="index !== 0"
                      icon
                      size="small"
                      class="set-first-btn"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                        background: rgba(76, 175, 80, 0.9);
                      "
                      color="white"
                      @click.stop="
                        setFirstSlider(
                          slider._id!,
                          `dynamic_${targetWithSliders.target._id}`,
                          targetWithSliders.sliders
                        )
                      "
                    >
                      <v-icon size="16">mdi-arrow-up-bold</v-icon>
                    </v-btn>

                    <!-- FIRST BADGE -->
                    <v-chip
                      v-if="index === 0"
                      size="small"
                      color="success"
                      style="
                        position: absolute;
                        top: 8px;
                        right: 8px;
                        z-index: 10;
                      "
                    >
                      <v-icon start size="14">mdi-star</v-icon>
                      Primero
                    </v-chip>

                    <v-img :src="slider.picture ?? slider.pictureImageDetail?.image" height="200" eager cover>
                      <!-- HOVER OVERLAY -->
                      <div v-if="isHovering" class="slider-overlay">
                        <v-btn
                          @click.stop="goUpdate(slider._id!)"
                          class="ma-2"
                          color="white"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-pencil</v-icon>
                          Editar
                        </v-btn>
                        <v-btn
                          @click.stop="openDialogAlertRemove(slider._id!)"
                          class="ma-2"
                          color="error"
                          rounded="xl"
                          variant="outlined"
                          size="small"
                        >
                          <v-icon left>mdi-delete</v-icon>
                          Eliminar
                        </v-btn>
                      </div>
                    </v-img>
                  </v-card>
                </template>
              </v-hover>
            </div>
          </template>
        </draggable>

        <!-- CREATE NEW SLIDER CARD -->
        <v-card
          height="200"
          width="300"
          rounded="xl"
          class="create-slider-card d-flex align-center justify-center ma-2"
          style="flex-shrink: 0"
          @click="goCreate()"
        >
          <v-btn
            :style="{
              backgroundColor: targetWithSliders.target.color || '#4caf50',
            }"
            color="white"
            variant="outlined"
            size="large"
          >
            <v-icon left size="30">mdi-plus</v-icon>
            Crear Slider
          </v-btn>
        </v-card>
      </div>
    </v-col>
  </v-row>

  <!-- DIALOG ALERT REMOVE SLIDER -->
  <v-dialog v-model="dialog.show" max-width="400">
    <v-card rounded="xl">
      <v-card-title class="text-h6 font-weight-bold">
        <v-icon color="error" class="mr-2">mdi-alert-circle</v-icon>
        Confirmar Eliminación
      </v-card-title>

      <v-card-text class="pt-4">
        <p class="text-body-1">
          ¿Estás seguro de que quieres eliminar este slider?
        </p>
        <p class="text-caption text-grey-darken-1">
          Esta acción no se puede deshacer.
        </p>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          @click="closeDialogAlertRemove()"
          variant="outlined"
          :disabled="dialog.loading"
        >
          Cancelar
        </v-btn>
        <v-btn @click="removeSlider()" color="error" :loading="dialog.loading">
          Eliminar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.slider-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: row;
  border-radius: 12px;
}

.sliders-container {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;

    &:hover {
      background: #555;
    }
  }
}

.slider-item-wrapper {
  position: relative;
  flex-shrink: 0;
}

.slider-card {
  cursor: move;
  transition: transform 0.2s ease-in-out;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }

  .drag-handle {
    cursor: grab;

    &:active {
      cursor: grabbing;
    }
  }

  .set-first-btn {
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
      background: rgba(76, 175, 80, 1) !important;
    }
  }
}

.create-slider-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  border: 2px dashed #ccc;

  &:hover {
    border-color: #1976d2;
    background-color: rgba(25, 118, 210, 0.05);
    transform: translateY(-2px);
  }
}

.card-principal-container {
  .card-principal-info-container {
    margin-top: -180px;
    z-index: 1;
  }

  .card-principal-animation {
    margin-top: -100px;
    z-index: 2;
  }
}
</style>
