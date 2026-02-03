<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// @ts-nocheck
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
import { CREATE_SLIDER } from "~/graphql/mutations/slider.mutation";

import DetailedImageComponent from "~/components/detailed-image/index.vue";
// COMPOSABLES
import { useTargetManager } from "~/composables/useTargetManager";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "slider-create-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-dropdown-component": AppDropdownComponent,
    "detailed-image-component": DetailedImageComponent,
  },
})
class SliderCreateScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // SLIDER DEFAULT VALUES
  @Ref("sliderImage") sliderImage!: any;

  ///////////////
  // VARIABLES //
  ///////////////

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

  // SELECTED TARGET
  public selectedTarget: string = "bannerHome";

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
    target: "bannerHome",
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
  public target: string = "title";

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
          icon: data.icon,
          type: "dynamic",
          isStatic: false,
          originalTarget: data,
        })
      );

      // COMBINE DYNAMIC TARGETS WITH STATIC TARGETS
      this.allTargets = [...staticTargets, ...dynamicTargets];
    } catch (error) {
      console.error("Error loading targets:", error);
      // IF ERROR, USE ONLY STATIC TARGETS (ALREADY IN TARGETSECTION)
      this.allTargets = [...staticTargets];
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
  public getSliderImage(file: File) {
    if (file) {
      if (
        file.type === "image/jpeg" ||
        file.type === "image/jpg" ||
        file.type === "image/png"
      ) {
        if (file.size <= 19520000) {
          const fr = new FileReader();
          fr.onload = (el: any) => {
            if (this.targetImage === "picture") {
              this.newUploadPicture = [
                {
                  img: el.target.result,
                  filetype: file.type.split("/")[1],
                },
              ];
            } else if (this.targetImage === "responsive") {
              this.newUploadBannerResponsive = [
                {
                  img: el.target.result,
                  filetype: file.type.split("/")[1],
                },
              ];
            }
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

  // CREATE SLIDER
  public async createSlider() {
    this.loading = true;
    try {
      // PAYLOAD LOGIN DTO
      const createSliderDto = {
        createSliderDto: this.slider,
        target: this.slider.target || null,
        targetID: this.slider.targetID || null,
      };

      // CREATE SLIDER MUTATION
      await this.$apollo.mutate({
        mutation: CREATE_SLIDER,
        variables: createSliderDto,
      });

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO DASHBOARD
      this.$router.push("/sliders/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Slider creado correctamente!",
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
export default SliderCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="pa-5" justify="center">
    <!-- SLIDER IMAGE -->
    <v-col cols="6">
      <!-- HOVER IMAGE -->
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="340"
        v-model="slider.pictureImageDetail"
        :legacy-image="slider.picture"
        text="Cargar Banner"
      ></detailed-image-component>
    </v-col>

    <!-- SLIDER RESPONSIVE IMAGE -->
    <v-col cols="6">
      <!-- HOVER IMAGE -->
      <detailed-image-component
        color="#00a44f"
        rounded="xl"
        height="340"
        v-model="slider.responsiveImageDetail"
        :legacy-image="slider.responsive"
        text="Cargar Miniatura"
      ></detailed-image-component>
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
                      {{
                        !item.raw.type || item.raw.type === "static"
                          ? "mdi-folder"
                          : item.raw.icon
                      }}
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
            <v-btn
              @click="createSlider()"
              :disabled="
                Boolean(
                  !this.slider.pictureImageDetail?.image ||
                    !this.slider.responsiveImageDetail?.image
                )
              "
              :loading="loading"
            >
              Crear
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
