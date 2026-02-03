<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT LOTTIE
const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });

// IMPORT ANIMATIONS LOTTIE
import AnimationLocation from "~/assets/animations/locations-animation.json";

// IMPORT INTERFACE
import type {
  LocationInterface,
  TypeLocation,
  WorkHoursRangeType,
} from "~/interfaces/locations.interface";

// IMPORT QUERY'S
import { GET_LOCATIONS } from "~/graphql/query/locations.query";

// IMPORT MUTATIONS
import {
  REMOVE_LOCATIONS,
  UPDATE_LOCATIONS,
  CREATE_LOCATIONS,
} from "~/graphql/mutations/locations.mutation";

// IMPORT LODASH
import _ from "lodash";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "locations-screen",
  components: {
    // COMPONENTS CUSTOM APP
    "app-lottie": AppLottie,
  },
})
class LocationsScreen extends Vue {
  ///////////////
  //// REFS /////
  ///////////////

  // ANIMATION LOCATIONS
  @Ref("animationLocations") animationLocations: any;

  // INPUT FILE IMAGES
  @Ref("locationItemLogo") locationItemLogo: any;

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
  public $apollo: any;

  // ANIMATIONS LOTTIE
  public animationLocation: any = AnimationLocation;

  // DEFAULT HOUR LOCATION
  public hourLocation: WorkHoursRangeType = {
    day: "0",
    start: "",
    end: "",
  };

  // DEFAULT TYPES ARRAY VALUES
  public typesLocation: Array<{ title: string; value: TypeLocation }> = [
    {
      title: "Sucursal",
      value: "locationBranches",
    },
    {
      title: "Sub Agentes",
      value: "locationSubAgents",
    },
    {
      title: "ATH",
      value: "locationAth",
    },
    {
      title: "Auto Banco",
      value: "locationAutoBank",
    },
  ];

  // DEFAULT DAY WEEK ARRAY VALUES
  public week: Array<{ title: string; value: string }> = [
    {
      title: "Domingo",
      value: "0",
    },
    {
      title: "Lunes",
      value: "1",
    },
    {
      title: "Martes",
      value: "2",
    },
    {
      title: "Miércoles",
      value: "3",
    },
    {
      title: "Jueves",
      value: "4",
    },
    {
      title: "Viernes",
      value: "5",
    },
    {
      title: "Sábado",
      value: "6",
    },
  ];

  // DEFAULT LOCATIONS ARRAY VALUES
  public locations: Array<LocationInterface> = [];

  // DIALOG DELETE LOCATIONS OPTIONS
  public dialogRemove: { show: boolean; locationID: string; loading: boolean } =
    {
      show: false,
      locationID: "",
      loading: false,
    };

  // DIALOG CREATE AND UPDATE LOCATIONS
  public dialog: {
    action: "update" | "create";
    show: boolean;
    location: LocationInterface;
    loading: boolean;
  } = {
    show: false,
    action: "create",
    location: {
      label: "",
      type: "locationBranches",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      hours: [],
    },
    loading: false,
  };

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    this.setLocations();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  ///////////////
  /// METHODS ///
  ///////////////

  // SET LOCATIONS
  public async setLocations() {
    try {
      // GET ALL LOCATIONS
      const { data } = await this.$apollo.query({
        query: GET_LOCATIONS,
        fetchPolicy: "no-cache",
      });

      // SET LOCATIONS TO VARIABLE
      this.locations = data.locations;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // CREATE LOCATION
  public async createLocation() {
    // SET LOADING
    this.dialog.loading = true;

    // CREATE LOCATIONS DTO PAYLOAD
    const createLocationDto = {
      createLocationDto: this.dialog.location,
    };

    try {
      // CREATE LOCATIONS
      await this.$apollo.mutate({
        mutation: CREATE_LOCATIONS,
        variables: createLocationDto,
      });

      // SET LOADING
      this.dialog.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Ubicaciones creada correctamente!",
        color: "success",
      });

      // CLOSE DIALOG
      this.closeDialogLocation();

      // SET LOCATIONS
      this.setLocations();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // CLOSE DIALOG
      this.closeDialogLocation();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE LOCATION
  public async updateLocation() {
    // SET LOADING
    this.dialog.loading = true;

    // CLEAN LOCATION
    let locationClean = _.omit({ ...this.dialog.location }, ["_id"]);

    let hoursClean = this.dialog.location.hours.map(
      (hour: WorkHoursRangeType) => {
        return _.omit(hour, ["__typename"]);
      }
    );

    // CLEAN LOCATION FINAL
    let locationCleanFinal = { ...locationClean, hours: hoursClean };

    // UPDATE LOCATIONS DTO PAYLOAD
    const updateLocationDto = {
      updateLocationDto: {
        locationID: this.dialog.location._id,
        location: locationCleanFinal,
      },
    };

    try {
      // UPDATE LOCATIONS
      await this.$apollo.mutate({
        mutation: UPDATE_LOCATIONS,
        variables: updateLocationDto,
      });

      // SET LOADING
      this.dialog.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Ubicaciones actualizada correctamente!",
        color: "success",
      });

      // CLOSE DIALOG
      this.closeDialogLocation();

      // SET LOCATIONS
      this.setLocations();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // CLOSE DIALOG
      this.closeDialogLocation();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // REMOVE LOCATION
  public async removeLocations() {
    // SET LOADING
    this.dialogRemove.loading = true;

    // REMOVE LOCATIONS DTO PAYLOAD
    const removeLocationsDto = {
      locationId: this.dialogRemove.locationID,
    };

    try {
      // REMOVE LOCATIONS
      await this.$apollo.mutate({
        mutation: REMOVE_LOCATIONS,
        variables: removeLocationsDto,
      });

      // SET LOADING
      this.dialogRemove.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Ubicaciones eliminada correctamente!",
        color: "success",
      });

      // CLOSE DIALOG
      this.closeDialogAlertRemove();

      // SET LOCATIONS
      this.setLocations();
    } catch (err) {
      // SET LOADING
      this.dialogRemove.loading = false;

      // CLOSE DIALOG
      this.closeDialogAlertRemove();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // GO TO UPDATE LOCATION
  public openDialogUpdate(location: LocationInterface) {
    this.dialog.show = true;
    this.dialog.action = "update";
    this.dialog.location = {
      _id: location._id,
      label: location.label,
      type: location.type,
      address: location.address,
      city: location.city,
      latitude: location.latitude,
      longitude: location.longitude,
      hours: location.hours,
    };
  }

  // GO TO CREATE LOCATIONS
  public openDialogCreate() {
    this.dialog.show = true;
    this.dialog.action = "create";
    this.dialog.location = {
      label: "",
      type: "locationBranches",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      hours: [],
    };
  }

  // OPEN DIALOG ALERT REMOVE LOCATIONS
  public openDialogAlertRemove(locationID: string) {
    this.dialogRemove.locationID = locationID;

    // OPEN DIALOG
    this.dialogRemove.show = true;
  }

  // OPEN DIALOG ALERT REMOVE LOCATIONS
  public closeDialogLocation() {
    this.dialog.show = false;
    this.dialog.action = "create";
    this.dialog.location = {
      label: "",
      type: "locationBranches",
      address: "",
      city: "",
      latitude: "",
      longitude: "",
      hours: [],
    };
  }

  // OPEN DIALOG ALERT REMOVE LOCATIONS
  public closeDialogAlertRemove() {
    this.dialogRemove.show = false;
    this.dialogRemove.locationID = "";
    this.dialogRemove.loading = false;
  }

  // VALIDATE STEPS AND ACTION DIALOG
  public validateAction() {
    if (this.dialog.action === "create") {
      this.createLocation();
      this.closeDialogLocation();
    } else {
      this.updateLocation();
      this.closeDialogLocation();
    }
  }

  // VALIDATE STEPS AND ACTION DIALOG
  public get validateForm(): boolean {
    let valid: boolean = false;
    if (this.dialog.action === "create") {
      valid =
        !this.dialog.location.label ||
        !this.dialog.location.type ||
        !this.dialog.location.address ||
        !this.dialog.location.city ||
        !this.dialog.location.latitude ||
        !this.dialog.location.longitude ||
        this.dialog.location.hours.length <= 0;
    } else {
      valid =
        !this.dialog.location.label ||
        !this.dialog.location.type ||
        !this.dialog.location.address ||
        !this.dialog.location.city ||
        !this.dialog.location.latitude ||
        !this.dialog.location.longitude;
    }
    return valid;
  }

  // ADD HOUR IN LOCATION
  public addHourLocation() {
    const isHourExist = this.dialog.location.hours.some(
      (hour: WorkHoursRangeType) => hour.day === this.hourLocation.day
    );
    let newHour = { ...this.hourLocation };
    if (isHourExist) {
      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        text: "El dia de la semana ya existe",
        color: "red",
        timeout: 3000,
      });
    } else {
      this.dialog.location.hours = [...this.dialog.location.hours, newHour];
    }
  }

  // REMOVE HOUR IN LOCATION
  public removeHourLocation(index: number) {
    this.dialog.location.hours.splice(index, 1);
  }

  // FIND WEEK STRING NAME
  public findWeek(day: string): string {
    const getWeekDay = this.week.find((wk: any) => wk.value === day);
    return (getWeekDay && getWeekDay.title) || "";
  }
}

export default LocationsScreen;
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
                  Lista de Ubicaciones,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar tus ubicaciones de una manera mas
                  sencilla!
                </p>
                <v-btn
                  @click="openDialogCreate()"
                  width="130"
                  variant="outlined"
                  class="mt-5 ml-10 text-caption"
                  rounded="xl"
                  density="compact"
                  text="Crear Ubicación"
                />
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="400px"
                  height="400px"
                  :loop="true"
                  ref="animationPromo"
                  :animationData="animationLocation"
                />
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </client-only>
    </v-col>
  </v-row>
  <v-row class="px-15 pt-5 pb-10" justify="center">
    <v-col cols="4" v-for="(location, i) in locations" :key="i">
      <v-card width="300" height="200" rounded="xl" class="pa-0 mx-4">
        <v-card-text class="pa-0">
          <v-row
            class="my-0"
            align-content="center"
            justify="center"
            no-gutters
          >
            <v-col cols="4">
              <div class="location-card-image rounded-xl mt-2 ml-2 pa-5">
                <img
                  width="80"
                  height="80"
                  v-if="location.type === 'locationBranches'"
                  src="~/assets/icons/pin-branch.svg"
                />
                <img
                  width="80"
                  height="80"
                  v-else-if="location.type === 'locationSubAgents'"
                  src="~/assets/icons/pin-sub-agent.svg"
                />
                <img
                  width="80"
                  height="80"
                  v-else-if="location.type === 'locationAth'"
                  src="~/assets/icons/pin-ath.svg"
                />
                <img
                  width="80"
                  height="80"
                  v-else
                  src="~/assets/icons/pin-auto-bank.svg"
                />
              </div>
              <v-btn
                @click="openDialogUpdate(location)"
                density="comfortable"
                location="right top"
                position="absolute"
                class="mt-2 mr-2"
                style="z-index: 10"
                icon
              >
                <v-icon color="#12539b" size="20"> mdi-pencil </v-icon>
              </v-btn>
              <v-btn
                @click="openDialogAlertRemove(location._id!)"
                density="comfortable"
                location="right bottom"
                position="absolute"
                class="mb-2 mr-2"
                style="z-index: 10"
                icon
              >
                <v-icon color="#12539b" size="20"> mdi-delete </v-icon>
              </v-btn>
            </v-col>
            <v-col cols="8" class="location-card-info pt-5 pl-4 text-left">
              <div class="my-2 d-flex align-center">
                <v-icon class="location-card-icon" color="#ffffff" size="20">
                  mdi-text
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Label</p>
                  <p class="my-0 text-caption">
                    {{ location.label }}
                  </p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <v-icon class="location-card-icon" color="#ffffff" size="20">
                  mdi-map-marker
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Coordenadas</p>
                  <p class="my-0 text-caption">
                    {{ location.latitude }}, {{ location.longitude }}
                  </p>
                </div>
              </div>
              <div class="my-2 d-flex align-center">
                <v-icon class="location-card-icon" color="#ffffff" size="20">
                  mdi-map
                </v-icon>
                <div class="ml-2">
                  <p class="my-0 text-caption font-weight-bold">Coordenadas</p>
                  <p class="my-0 text-caption">
                    {{ location.type }}
                  </p>
                </div>
              </div>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-col>
  </v-row>

  <!-- DIALOG CREATE AND UPDATE LOCATIONS -->
  <v-dialog v-model="dialog.show" width="500" persistent>
    <v-card rounded="xl" color="primary" title="Nueva Ubicación BSC">
      <v-card-text>
        <v-row justify="center" align-content="center">
          <v-col cols="11">
            <v-row no-gutters>
              <v-col cols="12">
                <v-text-field
                  v-model="dialog.location.label"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Titulo de ubicación"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pr-2"
                  v-model="dialog.location.city"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Ciudad de ubicación"
                />
              </v-col>
              <v-col cols="6">
                <v-select
                  class="pl-2"
                  v-model="dialog.location.type"
                  :items="typesLocation"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Tipo de ubicación"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pr-2"
                  v-model="dialog.location.latitude"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Latitud"
                />
              </v-col>
              <v-col cols="6">
                <v-text-field
                  class="pl-2"
                  v-model="dialog.location.longitude"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Longitud"
                />
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="dialog.location.address"
                  rounded="xl"
                  density="compact"
                  variant="solo"
                  label="Dirección de ubicación"
                />
              </v-col>
              <v-col cols="12">
                <v-expansion-panels>
                  <v-expansion-panel
                    rounded="xl"
                    title="Gestionar horarios de trabajo"
                  >
                    <v-expansion-panel-text>
                      <v-row
                        class="pa-0 pb-5"
                        justify="center"
                        align-content="center"
                        no-gutters
                      >
                        <v-col cols="12">
                          <v-select
                            v-model="hourLocation.day"
                            :items="week"
                            type="time"
                            rounded="xl"
                            density="compact"
                            variant="solo-filled"
                            label="Dia de la semana"
                          />
                        </v-col>
                        <v-col cols="5" class="pr-2">
                          <v-text-field
                            v-model="hourLocation.start"
                            type="time"
                            rounded="xl"
                            density="compact"
                            variant="solo-filled"
                            label="Hora de apertura"
                          />
                        </v-col>
                        <v-col cols="5" class="pl-2">
                          <v-text-field
                            v-model="hourLocation.end"
                            type="time"
                            rounded="xl"
                            density="compact"
                            variant="solo-filled"
                            label="Hora de cierre"
                          />
                        </v-col>
                        <v-col cols="2">
                          <v-btn
                            @click="addHourLocation()"
                            :disabled="
                              !hourLocation.day ||
                              !hourLocation.start ||
                              !hourLocation.end
                            "
                            class="mt-2 ml-5"
                            color="primary"
                            density="compact"
                            icon
                          >
                            <v-icon size="15"> mdi-plus </v-icon>
                          </v-btn>
                        </v-col>
                        <v-col cols="12">
                          <p>Horarios</p>
                          <v-list>
                            <v-list-item
                              v-for="(hour, i) in dialog.location.hours"
                              :key="i"
                            >
                              <v-list-item-title>
                                {{ findWeek(hour.day) }} de {{ hour.start }} a
                                {{ hour.end }}
                              </v-list-item-title>
                              <template v-slot:append>
                                <v-btn
                                  @click="removeHourLocation(i)"
                                  color="red"
                                  density="compact"
                                  icon
                                >
                                  <v-icon size="15"> mdi-minus </v-icon>
                                </v-btn>
                              </template>
                            </v-list-item>
                          </v-list>
                        </v-col>
                      </v-row>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-btn
          :disabled="dialog.loading"
          @click="closeDialogLocation()"
          variant="text"
        >
          Cancelar
        </v-btn>
        <v-spacer />
        <v-btn
          @click="validateAction()"
          :disabled="validateForm"
          :loading="dialog.loading"
          variant="text"
        >
          {{ dialog.action === "create" ? "Crear" : "Actualizar" }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- DIALOG DELETE LOCATIONS -->
  <v-dialog v-model="dialogRemove.show" max-width="480">
    <v-card class="" rounded="xl" color="primary">
      <v-card-item>
        <v-card-title class="text-body-1 text-orange">Advertencia</v-card-title>
        <v-card-subtitle class="text-caption"
          >Una vez eliminado se pierde la imagen, y datos de este
          item!</v-card-subtitle
        >
      </v-card-item>
      <v-card-text>
        <p class="my-2">
          <strong>¿Estas seguro de eliminar la ubicación?</strong>
        </p>
      </v-card-text>
      <v-card-actions>
        <v-btn
          text="Cancelar"
          variant="text"
          @click="closeDialogAlertRemove()"
        />
        <v-spacer />
        <v-btn
          text="Aceptar"
          variant="text"
          @click="removeLocations()"
          :loading="dialogRemove.loading"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -100px;
  }

  .card-principal-animation {
    margin-top: -90px;
    margin-right: -20px;
  }
}

.location-card-image {
  width: 100px;
  height: 180px;
  display: flex;
  align-items: center;
  margin: 5px auto 0 auto;
  background: #12539b;
  color: #ffffff;
  position: relative;
  align-items: center;
  text-align: center;

  p {
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 30px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
}

.location-card-info {
  background-color: #ffffff;
  color: #535353;

  .location-card-condition {
    height: 115px;
    overflow: hidden;
  }

  .location-card-icon {
    width: 30px !important;
    height: 30px !important;
    background-color: #00a44f;
    border-radius: 100px;
  }
}

.banner-location-month {
  height: 90px;
  border-radius: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #12539b;
}
</style>
