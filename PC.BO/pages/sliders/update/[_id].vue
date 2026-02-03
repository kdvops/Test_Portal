<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// @ts-nocheck
// IMPORT LODASH
import _ from "lodash";

// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type {
  NewPictureSlider,
  SliderInterface,
  TargetSectionSlider,
} from "~/interfaces/slider.interface";
import type { itemSelectedInterface } from "~/interfaces/dropdown.interface";
import type { TargetInterface } from "~/interfaces/targets.interface";

// IMPORT COMPONENTS
import AppDropdownComponent from "~/components/dropdown/index.vue";

// MUTATIONS
import { UPDATE_SLIDER } from "~/graphql/mutations/slider.mutation";

// QUERY'S
import { GET_SLIDER } from "~/graphql/query/slider.query";

import DetailedImageComponent from "~/components/detailed-image/index.vue";
// COMPOSABLES
import { useTargetManager } from "~/composables/useTargetManager";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "slider-update-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-dropdown-component": AppDropdownComponent,
    'detailed-image-component': DetailedImageComponent
  },
})
class SliderUpdateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // SLIDER DEFAULT VALUES
  @Ref("sliderImage") sliderImage!: any;

  ///////////////
  // VARIABLES //
  ///////////////

  // GET PARAM SLIDER ID
  public sliderID = useRoute().params._id;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // TARGET IMAGE
  public targetImage: string = "picture";

  // NEW PICTURE FOR BANNER RESPONSIVE
  public newUploadBannerResponsive: Array<NewPictureSlider> = [];

  // NEW PICTURE SLIDERS
  public newUploadPicture: Array<NewPictureSlider> = [];

  // TARGET MANAGER
  public targetManager = useTargetManager();

  // SELECTED TARGET
  public selectedTarget: string = "";

  // SLIDER TARGETS SECTIONS VALUES (ESTÁTICOS)
  public targetSection: Array<TargetSectionSlider> = [
    { target: "bannerHome", name: "Home - Slider" },
    { target: "bannerPromotions", name: "Promociones - Slider" },
    { target: "bannerProfits", name: "Beneficios - Slider" },
    { target: "bannerFinancially", name: "Financieramente - Slider" },
    { target: "bannerProuser", name: "Proteccion al usuario - Slider" },
    { target: "bannerBusiness", name: "Mi Negocio - Slider" },
    { target: "bannerEnterprise", name: "Para tu Empresa - Slider" },
    { target: "bannerInsurance", name: "Seguros - Slider" },
    { target: "bannerAdjudicated", name: "Bienes Adjudicados - Slider" },
  ];

  // TARGETS COMBINADOS (ESTÁTICOS + DINÁMICOS)
  public allTargets: Array<any> = [];

  // SLIDER DEFAULT VALUES
  public slider: SliderInterface = {
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
    target: "",
    targetID: null,
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
  };

  // LOADING
  public loading: boolean = false;

  // TARGET FOCUSED
  public target: string = "";

  // COLOR FOCUSED CHANGE
  public color: string = "primary";

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public async created() {
    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });

    // CARGAR TARGETS DINÁMICOS
    await this.loadTargets();

    // CARGAR SLIDER
    await this.setSlider();
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // CARGAR TARGETS DINÁMICOS Y COMBINAR CON ESTÁTICOS
  public async loadTargets() {
    try {
      // LOAD DYNAMIC TARGETS
      await this.targetManager.loadDynamicTargets(this.$apollo);

      // COMBINE DYNAMIC TARGETS WITH STATIC TARGETS
      const staticTargets = this.targetSection.map(
        (data: any, index: number) => ({
          _id: `${data.target}-${index}`,
          target: data.target,
          targetID: null,
          name: data.name,
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
          type: "dynamic",
          icon: data.icon,
          isStatic: false,
          originalTarget: data,
        })
      );

      // COMBINE DYNAMIC TARGETS WITH STATIC TARGETS
      this.allTargets = [...staticTargets, ...dynamicTargets];
    } catch (error) {
      console.error("Error loading targets:", error);
      // IF ERROR, USE ONLY STATIC TARGETS (ALREADY IN TARGETSECTION)
      this.allTargets = this.targetSection.map((data: any, index: number) => ({
        _id: `${data.target}-${index}`,
        target: data.target,
        targetID: null,
        name: data.name,
        icon: "mdi-folder",
        type: "static",
        isStatic: true,
        originalTarget: data,
      }));
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

      // IF IT DOESN'T HAVE TYPE, IT'S A STATIC TARGET (FROM TARGETSECTION)
      if (!selectedTarget.type || selectedTarget.type === "static") {
        // STATIC TARGET: USE TARGET, TARGETID = NULL
        this.slider.target = selectedTarget.target;
        this.slider.targetID = null;
      } else {
        // DYNAMIC TARGET: USE TARGETID, TARGET = NULL
        this.slider.target = null;
        this.slider.targetID = selectedTarget.targetID;
      }
    }
  }

  // OPEN UPLOAD IMAGE
  public selectImage(targetImage: string) {
    // SET TARGET IMAGE
    this.targetImage = targetImage;

    const imageRefs: any = this.sliderImage;

    // REF IMAGE RESET
    imageRefs.value = null;

    // REF ON CLICK
    imageRefs.click();
  }

  // GET IMAGE FILE AND SET IN BANNER OR THUMBNAIL
  public getSliderImage(files: File | File[]) {
    const file = Array.isArray(files) ? files[0] : files;

    if (file) {
      if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png"
      ) {
        if (file.size <= 19520000) {
          const sliderImage =
            this.targetImage === "picture"
              ? this.newUploadPicture
              : this.newUploadBannerResponsive;
          const fr = new FileReader();
          fr.onload = (el: any) => {
            sliderImage.splice(0, 1, {
              img: el.target.result,
              filetype: file.type.split("/")[1],
            });
          };
          fr.readAsDataURL(file);
        } else {
          this.$bus.$emit("handleError", "El peso máximo es de 2 MB");
        }
      } else {
        this.$bus.$emit("handleError", "Solo se aceptan formato .png y .jpeg");
      }
    }
  }

  // GET JUSTIFY TEXT
  public get getJustifyText() {
    return this.slider.title.align === "left" ||
      this.slider.subtitle.align === "left" ||
      this.slider.description.align === "left"
      ? "start"
      : this.slider.title.align === "center" ||
        this.slider.subtitle.align === "center" ||
        this.slider.description.align === "center"
      ? "center"
      : "end";
  }

  // BACKGROUND COLOR BUTTON SELECTED
  public bgSelected(color: string) {
    this.slider.button.background = color;
  }

  // COLOR SELECTED
  public colorSelected(color: string) {
    this.slider[this.target].color = color;
  }

  // ITEM SELECTED
  public itemSelected(selected: itemSelectedInterface) {
    this.slider[this.target][selected.mode] = selected.item;
  }

  public async setSlider() {
    try {
      // PAYLOAD SLIDER ID
      const sliderID = {
        sliderId: this.sliderID,
      };

      // GET SLIDER QUERY
      const { data } = await this.$apollo.query({
        query: GET_SLIDER,
        variables: sliderID,
        fetchPolicy: "no-cache",
      });

      // SET SLIDER
      const slider = data.findSliderById;

      // NORMALIZE TARGET IF STATIC TARGET
      if (slider.target) {
        slider.target = this.sliderTargetNormalize(slider.target);
      }

      // SET SLIDERS TO VARIABLE
      this.slider = slider;

      // SET CORRECT TARGET IN V-SELECT
      this.setCorrectTargetForSelect();
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SLIDER TARGET NORMALIZE
  public sliderTargetNormalize(target: string) {
    const getType = target.split("::")[0];
    const getSection = target.split("::")[1];
    return `${getType}${getSection.charAt(0).toUpperCase()}${getSection.slice(
      1
    )}`;
  }

  // SET CORRECT TARGET FOR V-SELECT
  public setCorrectTargetForSelect() {
    if (!this.allTargets || this.allTargets.length === 0) {
      console.warn("ALL TARGETS NOT LOADED YET");
      return;
    }

    // FIND TARGET IN allTargets ARRAY
    let foundTarget = null;

    // FIRST CHECK FOR DYNAMIC TARGET (HAS targetID)
    if (this.slider.targetID) {
      foundTarget = this.allTargets.find(
        (data) => data.targetID && this.slider.targetID === data.targetID
      );
    }

    // IF NOT FOUND AND HAS target, CHECK FOR STATIC TARGET
    if (!foundTarget && this.slider.target) {
      foundTarget = this.allTargets.find(
        (data) => data.target && this.slider.target === data.target
      );
    }

    if (foundTarget) {
      // SET SELECTED TARGET USING _id (REQUIRED FOR V-SELECT item-value="_id")
      this.selectedTarget = foundTarget._id;

      // UPDATE SLIDER TARGET/TARGETID BASED ON FOUND TARGET TYPE
      if (foundTarget.type === "dynamic" || foundTarget.targetID) {
        // DYNAMIC TARGET: USE targetID, SET target TO NULL
        this.slider.target = null;
        this.slider.targetID = foundTarget.targetID;
      } else {
        // STATIC TARGET: USE target, SET targetID TO NULL
        this.slider.target = foundTarget.target;
        this.slider.targetID = null;
      }
    } else {
      console.warn("TARGET NOT FOUND IN allTargets", {
        sliderTarget: this.slider.target,
        sliderTargetID: this.slider.targetID,
        allTargets: this.allTargets,
      });
    }
  }

  // UPDATE SLIDER
  public async updateSlider() {
    // SET LOADING TRUE
    this.loading = true;

    try {
      // CLEAN SLIDER
      const cleanSlider = _.omit(this.slider, [
        "path",
        "position",
        "__typename",
        "title.__typename",
        "subtitle.__typename",
        "description.__typename",
        "button.__typename",
        "createdAt",
        "updatedAt",
        "deletedAt",
      ]);

      // PREPARE SLIDER DATA
      const sliderData = {
        ...cleanSlider,
        // ENSURE THAT ONLY TARGET OR TARGETID IS SENT ACCORDING TO THE CASE
        target: this.slider.target || null,
        targetID: this.slider.targetID || null,
      };

      // PAYLOAD LOGIN DTO
      const updateSliderDto = {
        updateSliderDto: cleanSlider,
      };

      // UPDATE SLIDER MUTATION
      await this.$apollo.mutate({
        mutation: UPDATE_SLIDER,
        variables: updateSliderDto,
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO DASHBOARD
      this.$router.push("/sliders/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Slider se ha actualizado correctamente!",
        color: "success",
        timeout: 6000,
      });
    } catch (err) {
      // SET LOADING FALSE
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }
}
export default SliderUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="pa-5" justify="center">
    <!-- SLIDER IMAGE -->
    <v-col cols="6">
      <!-- HOVER IMAGE -->
       <detailed-image-component color="#00a44f" rounded="xl" height="340" v-model="slider.pictureImageDetail" :legacy-image="slider.picture" text="Cargar Banner">
        <template #fallback>
          <v-container class="banner-container-image" fluid>
            <v-row class="banner-row-image px-5" align-content="center" :justify="getJustifyText">
              <v-col cols="6" class="mr-10 py-1 pr-12">
                <p :style="`color: ${slider.title.color}`"
                  :class="`${slider.title.size} text-${slider.title.align} font-weight-${slider.title.weight}`">
                  {{ slider.title.text }}
                </p>
              </v-col>
              <v-col cols="6" class="mr-10 py-1 pr-12">
                <p :style="`color: ${slider.subtitle.color}`"
                  :class="`${slider.subtitle.size} text-${slider.subtitle.align} font-weight-${slider.subtitle.weight}`">
                  {{ slider.subtitle.text }}
                </p>
              </v-col>
              <v-col cols="6" class="mr-10 py-1 pr-12">
                <p :style="`color: ${slider.description.color}`"
                  :class="`${slider.description.size} text-${slider.description.align} font-weight-${slider.description.weight}`">
                  {{ slider.description.text }}
                </p>
              </v-col>
              <v-col v-if="slider.button.enabled" cols="12" :class="`text-${slider.button.align}`">
                <v-btn :color="slider.button.background" variant="flat" small
                  :style="`color: ${slider.button.color}!important`" :class="`font-weight-${slider.button.weight}`">
                  {{ slider.button.text }}
                </v-btn>
              </v-col>
            </v-row>
          </v-container>
        </template>
       </detailed-image-component>
    </v-col>

    <!-- SLIDER RESPONSIVE IMAGE -->
    <v-col cols="6">
      <!-- HOVER IMAGE -->
       <detailed-image-component color="#00a44f" rounded="xl" height="340" v-model="slider.responsiveImageDetail" :legacy-image="slider.responsive" text="Cargar Banner">
        <template #fallback>
          <v-container class="banner-container-image" fluid>
              <v-row class="banner-row-image px-5" align-content="center" :justify="getJustifyText">
                <v-col cols="6" class="mr-10 py-1 pr-12">
                  <p
                    :style="`color: ${slider.title.color}`"
                    :class="`${slider.title.size} text-${slider.title.align} font-weight-${slider.title.weight}`"
                  >
                    {{ slider.title.text }}
                  </p>
                </v-col>
                <v-col cols="6" class="mr-10 py-1 pr-12">
                  <p
                    :style="`color: ${slider.subtitle.color}`"
                    :class="`${slider.subtitle.size} text-${slider.subtitle.align} font-weight-${slider.subtitle.weight}`"
                  >
                    {{ slider.subtitle.text }}
                  </p>
                </v-col>
                <v-col cols="6" class="mr-10 py-1 pr-12">
                  <p
                    :style="`color: ${slider.description.color}`"
                    :class="`${slider.description.size} text-${slider.description.align} font-weight-${slider.description.weight}`"
                  >
                    {{ slider.description.text }}
                  </p>
                </v-col>
                <v-col
                  v-if="slider.button.enabled"
                  cols="12"
                  :class="`text-${slider.button.align}`"
                >
                  <v-btn
                    :color="slider.button.background"
                    variant="flat"
                    small
                    :style="`color: ${slider.button.color}!important`"
                    :class="`font-weight-${slider.button.weight}`"
                  >
                    {{ slider.button.text }}
                  </v-btn>
                </v-col>
              </v-row>
            </v-container>
        </template>
       </detailed-image-component>
    </v-col>

    <!-- SLIDER FORM -->
    <v-col cols="12">
      <v-card rounded="xl" class="pa-5" color="#f5f5f5">
        <v-row align-content="center" justify="center">
          <v-col cols="10" class="text-center">
            <!-- CUSTOM DROPDOWN COLOR COMPONENT -->
            <app-dropdown-component
              v-if="slider.button.enabled && target === 'button'"
              :eager="true"
              icon="mdi-format-color-fill"
              :color="color"
              @selectedColor="bgSelected"
              type="color"
            />

            <!-- CUSTOM DROPDOWN COLOR COMPONENT -->
            <app-dropdown-component
              :eager="true"
              icon="mdi-palette"
              :color="color"
              @selectedColor="colorSelected"
              type="color"
            />

            <!-- CUSTOM DROPDOWN LIST ALIGNS COMPONENT -->
            <app-dropdown-component
              :eager="true"
              icon="mdi-format-align-center"
              :color="color"
              @selectedItem="itemSelected"
              mode="align"
              type="list"
            />

            <!-- CUSTOM DROPDOWN LIST WEIGHT COMPONENT -->
            <app-dropdown-component
              :eager="true"
              icon="mdi-format-font"
              :color="color"
              @selectedItem="itemSelected"
              mode="weight"
              type="list"
            />

            <!-- CUSTOM DROPDOWN LIST SIZES COMPONENT -->
            <app-dropdown-component
              v-if="target !== 'button'"
              :eager="true"
              icon="mdi-format-size"
              :color="color"
              @selectedItem="itemSelected"
              mode="size"
              type="list"
            />
          </v-col>

          <!-- INPUTS COMPONENT -->
          <v-col class="py-0 mt-5 mx-auto text-center" cols="6">
            <v-text-field
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="slider.title.text"
              @update:focused="[(target = 'title'), (color = 'primary')]"
              label="Titulo"
              required
            />
          </v-col>
          <v-col class="py-0 mt-5 mx-auto text-center" cols="6">
            <v-text-field
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="slider.subtitle.text"
              @update:focused="[(target = 'subtitle'), (color = 'green')]"
              label="Subtitulo"
              required
            />
          </v-col>
          <v-col class="py-0 mx-auto text-center" cols="12">
            <v-textarea
              prepend-inner-icon="mdi-text"
              density="compact"
              variant="solo"
              rounded="xl"
              v-model="slider.description.text"
              @update:focused="[(target = 'description'), (color = 'orange')]"
              label="Descripción"
              required
            />
          </v-col>
          <v-col class="py-0 mx-auto text-center" cols="12">
            <v-select
              v-model="selectedTarget"
              :items="allTargets"
              item-value="_id"
              item-title="name"
              prepend-inner-icon="mdi-apps"
              density="compact"
              variant="solo"
              rounded="xl"
              @update:model-value="onTargetSelected"
              required
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
          <v-col
            class="py-0 mx-auto text-center d-flex justify-center"
            cols="12"
          >
            <v-switch
              color="green"
              class="mx-5"
              density="compact"
              v-model="slider.button.enabled"
              label="¿Botón?"
              inset
            />
            <v-switch
              color="green"
              class="mx-5"
              density="compact"
              v-model="slider.disabled"
              label="Deshabilitar"
              inset
            />
          </v-col>
          <v-col
            v-if="slider.button.enabled"
            class="py-0 mx-auto text-center"
            cols="12"
          >
            <v-row>
              <v-col>
                <v-text-field
                  prepend-inner-icon="mdi-text"
                  density="compact"
                  variant="solo"
                  rounded="xl"
                  v-model="slider.button.text"
                  @update:focused="[(target = 'button'), (color = 'red')]"
                  label="Titulo de botón"
                  required
                />
              </v-col>
              <v-col>
                <v-text-field
                  prepend-inner-icon="mdi-text"
                  density="compact"
                  variant="solo"
                  rounded="xl"
                  v-model="slider.button.link"
                  label="Link del botón"
                />
              </v-col>
            </v-row>
          </v-col>
          <v-col class="py-5 mx-auto text-center" cols="11">
            <v-btn @click="updateSlider()" :loading="loading">
              Actualizar
            </v-btn>
          </v-col>
        </v-row>
      </v-card>
    </v-col>
    <v-file-input
      ref="sliderImage"
      class="d-none"
      accept=".jpg, .jpeg, .png"
      @update:model-value="getSliderImage"
    />
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss">
.banner-container-image {
  height: 100%;
  padding: 0;

  .banner-row-image {
    height: 100%;
    margin: 0;
  }
}
</style>
