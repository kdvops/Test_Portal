<script lang="ts">
import { Ref, Vue } from "vue-facing-decorator";

// IMPORT LOTTIE (lazy loading)
import { defineAsyncComponent } from "vue";
const Vue3Lottie = defineAsyncComponent(() => import("vue3-lottie"));

// IMPORT ANIMATIONS LOTTIE 
import AnimationLocation from "~/assets/animations/locations-animation.json";

// IMPORT QUERY
import { GET_LOCATIONS } from "~/graphql/locations.query";

// IMPORT COMPONENTS (lazy loading para componentes pesados)
const GoogleMap = defineAsyncComponent(() => import("vue3-google-map").then(m => m.GoogleMap));
const Marker = defineAsyncComponent(() => import("vue3-google-map").then(m => m.Marker));
const InfoWindow = defineAsyncComponent(() => import("vue3-google-map").then(m => m.InfoWindow));
const MarkerCluster = defineAsyncComponent(() => import("vue3-google-map").then(m => m.MarkerCluster));
import IconImage from "~/components/optimized-image/IconImage.vue";

// IMPORT INTERFACES
import type {
  LocationInterface,
  WorkHoursRangeType,
} from "~/interfaces/locations.interface";


// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "locations-screen",
  components: {
    "google-map-app": GoogleMap,
    "marker-map-app": Marker,
    "marker-cluster-map-app": MarkerCluster,
    "info-windows-app": InfoWindow,
    "app-lottie": Vue3Lottie,
    "icon-image": IconImage,
  },
})
export default class LocationsScreen extends Vue {
  ///////////////
  ///// REF /////
  ///////////////

  // MAP REF
  @Ref("map") map!: any;

  // ANIMATION LOCATIONS
  @Ref("animationLocations") animationLocations: any;

  /////////////////
  ///// ICONS /////
  /////////////////

  public LocationSubAgentsIcon: string = '/assets/icons/maps/pin1.svg';
  public LocationBranchesIcon: string = '/assets/icons/maps/pin2.svg';
  public LocationAutoBankIcon: string = '/assets/icons/maps/pin3.svg';
  public LocationAthIcon: string = '/assets/icons/maps/pin4.svg';

  /////////////////////
  ///// VARIABLES /////
  ////////////////////

  // INSTANCE BUS APP
  public $app: any;

  // INSTANCE BUS APP
  public $bus: any;

  // INSTANCE APOLLO CLIENT
  public override $apollo: any;

  // SEO COMPOSABLE
  public robustSEO = useRobustSEO();

  // INSTANCE GOOGLE MAP
  public google: any;

  // API KEY GOOGLE MAP
  private apiKey: string = "AIzaSyAtx-BtQ90KEdEoqy1fDL-EW-i_ruxF5so";

  // LOCATION CENTER MAP DEFAULT
  public mapCenter: { lat: number; lng: number } = {
    lat: 18.7357,
    lng: -70.1627,
  };

  // DIALOG FILTER
  public showDialogFilter: boolean = false;

  // ZOOM DEFAULT MAP
  public mapZoom: number = 10;

  // LOCATIONS MAP
  public allLocations: Array<any> = [];

  // LOCATION FILTER
  public filteredLocations: Array<LocationInterface> = [];

  public selectedFilter: string = "";
  public selectedLocation: any = null;
  public infoWindowsMarked: boolean[] = [false, true];

  // SEARCH TERM
  public search: string = "";

  // ANIMATIONS LOTTIE
  public animationLocation: any = AnimationLocation;

  // PIN DEFAULT MAP
  public pin: any;

  /////////////////////////////
  ///// METHODS CICLE LIFE ////
  /////////////////////////////

  public created() {
    // APPLY SEO METADATA
    // this.applySEOMetadata();
    this.getLocations();
  }

  public mounted() {
    this.$watch('search', (newValue: string, oldValue: string) => {
      this.applyFilter();
    });
  }

  public onSearchInput() {
    this.applyFilter();
  }

  ////////////////////
  ///// METHODS  ////
  ///////////////////

  public async getLocations() {
    try {
      const { data } = await this.$apollo.query({
        query: GET_LOCATIONS,
        fetchPolicy: "no-cache",
      });

      this.allLocations = data.locations;
      this.applyFilter();
    } catch (err) {
      //this.$bus.$emit("handleError", err);
    }
  }

  public setFilter(filter: string) {
    this.selectedFilter = filter;
    // Limpiar búsqueda cuando se selecciona un filtro específico
    if (filter !== "") {
      this.search = "";
    }
    this.applyFilter();
  }

  public clearAllFilters() {
    this.selectedFilter = "";
    this.search = "";
    this.applyFilter();
  }

  private normalizeText(text: string): string {
    if (!text) return "";

    return text
      .toLowerCase()
      .normalize("NFD") // Descompone caracteres acentuados (á → a + ´)
      .replace(/[\u0300-\u036f]/g, "") // Elimina marcas diacríticas (´, `, ~, etc.)
      .replace(/[^a-z0-9\s]/g, "") // Elimina caracteres especiales excepto espacios
      .replace(/\s+/g, " ") // Normaliza espacios múltiples a uno solo
      .trim();
  }

  private searchLocations(
    locations: LocationInterface[],
    searchTerm: string
  ): LocationInterface[] {
    if (!searchTerm || searchTerm.trim() === "") {
      return locations;
    }

    const normalizedSearchTerm = this.normalizeText(searchTerm);

    return locations.filter((location) => {
      // Campos a buscar: label, address, city
      const searchableFields = [
        location.label,
        location.address,
        location.city,
      ];

      // Busca en todos los campos usando normalización
      return searchableFields.some((field) => {
        const normalizedField = this.normalizeText(field);
        return normalizedField.includes(normalizedSearchTerm);
      });
    });
  }

  private applyFilter() {
    let filtered = this.allLocations;

    // Aplicar filtro por tipo si está seleccionado
    if (this.selectedFilter) {
      filtered = filtered.filter(
        (location) => location.type === this.selectedFilter
      );
    }

    // Aplicar búsqueda por texto si hay término de búsqueda
    filtered = this.searchLocations(filtered, this.search);

    this.filteredLocations = filtered;

    // Resetear centro del mapa si no hay filtros activos
    if (!this.selectedFilter && !this.search) {
      this.mapCenter = { lat: 18.7357, lng: -70.1627 };
      this.mapZoom = 8;
    }

    // Solo ajustar bounds si Google Maps está inicializado
    this.adjustMapToBounds();
  }

  public selectLocation(location: any) {
    this.selectedLocation = location;
    this.mapCenter = {
      lat: Number(location.latitude),
      lng: Number(location.longitude),
    };
    this.mapZoom = 15;
  }

  private adjustMapToBounds() {
    // Verificar que el mapa esté inicializado
    if (!this.map || !this.map.$mapObject) {
      return;
    }

    if (this.filteredLocations.length === 0) return;

    // Acceder a Google Maps a través del objeto window
    const google = (window as any).google;
    if (!google || !google.maps) {
      return;
    }

    const bounds: any = new google.maps.LatLngBounds();
    this.filteredLocations.forEach((location) => {
      bounds.extend(
        new google.maps.LatLng(
          Number(location.latitude),
          Number(location.longitude)
        )
      );
    });

    const center = bounds.getCenter();
    this.mapCenter = { lat: center.lat(), lng: center.lng() };

    const listener = google.maps.event.addListenerOnce(
      this.map.$mapObject,
      "bounds_changed",
      () => {
        if (this.selectedFilter !== "") {
          this.mapZoom = this.map.$mapObject.getZoom();
        }
        google.maps.event.removeListener(listener);
      }
    );

    this.map.$mapObject.fitBounds(bounds);
  }

  public iconByTypeLocation(type: string): string {
    let defaultIcon: string;

    switch (type) {
      case "locationBranches":
        defaultIcon = this.LocationBranchesIcon;
        break;
      case "locationAth":
        defaultIcon = this.LocationAthIcon;
        break;
      case "locationAutoBank":
        defaultIcon = this.LocationAutoBankIcon;
        break;
      case "locationSubAgents":
        defaultIcon = this.LocationSubAgentsIcon;
        break;
      default:
        defaultIcon = this.LocationAthIcon;
        break;
    }

    return defaultIcon;
  }

  public getFormatHors(hour: WorkHoursRangeType) {
    return `${this.$app.$moment(hour.day, 'e').format('dddd')} de ${this.$app.$moment(hour.start, 'h').format('HH:mm A')} a ${this.$app.$moment(hour.end, 'h').format('HH:mm A')}`;
  }

  // APPLY SEO METADATA
  // public applySEOMetadata() {
  //   const seoData = this.robustSEO.applyRobustSEO();
  //   this.pageSEO.applySEO();
  // }
}
</script>
<template>
  <v-container
    class="pa-0 pa-md-5"
    style="background: var(--bsc-primary-color)"
    fluid
  >
    <v-row
      :class="$vuetify.display.mdAndDown ? 'rounded-none' : 'rounded-xl'"
      class="position-relative overflow-hidden mb-5"
      no-gutters
    >
      <v-col
        cols="12"
        md="8"
        lg="8"
        order="2"
        order-sm="1"
        class="map-container"
        position="relative"
      >
        <v-btn
          class="d-block d-md-none"
          @click="showDialogFilter = true"
          size="2rem"
          color="green"
          position="absolute"
          style="top: 35px; right: 15px; z-index: 99"
          icon
        >
          <v-icon class="pa-0 mx-0 mt-1" size="20"> mdi-filter-menu </v-icon>
        </v-btn>

        <google-map-app
          ref="map"
          :api-key="apiKey"
          style="width: 102%; height: 100vh; position: relative; z-index: 1"
          :center="mapCenter"
          :zoom="mapZoom"
          :zoomControl="false"
          :mapTypeControl="false"
          :scaleControl="false"
          :streetViewControl="false"
          :rotateControl="false"
          :fullscreenControl="false"
        >
          <!-- <marker-cluster-map-app> -->
          <marker-map-app
            v-for="location in filteredLocations"
            :options="{
              position: {
                lat: Number(location.latitude),
                lng: Number(location.longitude),
              },
              icon: iconByTypeLocation(location.type),
            }"
            @click="selectLocation(location)"
          >
            <info-windows-app :key="location._id">
              <div id="content" class="rounded-xl">
                <div id="firstHeading">
                  <h1 class="text-uppercase text-primary">
                    <v-icon size="20"> mdi-map-marker-radius </v-icon>
                    {{ location.label }}
                  </h1>
                </div>
                <div id="bodyContent">
                  <p class="my-3">
                    <v-icon>mdi-google-maps</v-icon> {{ location.address }}
                  </p>
                  <p class="text-primary">
                    <v-icon>mdi-city</v-icon> {{ location.city }}
                  </p>
                  <v-divider thickness="3" class="mt-5 mb-4"></v-divider>
                  <p class="text-success text-body-2 mb-3">Horarios:</p>
                  <div class="d-flex justify-center align-center my-1">
                    <v-icon> mdi-alarm </v-icon>
                    <p class="text-capitalize" v-for="hour in location.hours">
                      {{ getFormatHors(hour) }}
                    </p>
                  </div>
                </div>
              </div>
            </info-windows-app>
          </marker-map-app>
          <!-- </marker-cluster-map-app> -->
        </google-map-app>
      </v-col>
      <v-col
        cols="12"
        md="4"
        lg="4"
        order="1"
        order-sm="2"
        class="filters-container elevation-7 d-none d-md-block"
      >
        <v-row class="pa-5" justify="space-around" no-gutters>
          <v-col cols="12">
            <v-card height="110" color="success">
              <ClientOnly>
                <template #placeholder>
                  <v-card-text class="d-flex">
                    <div class="w-50">
                      <div class="text-center">Cargando...</div>
                    </div>
                  </v-card-text>
                </template>
                <v-card-text class="d-flex">
                  <div class="w-50">
                    <app-lottie
                      width="200px"
                      height="200px"
                      :loop="true"
                      ref="animationPromo"
                      style="margin-top: -60px; margin-left: -60px"
                      :animationData="animationLocation"
                    />
                  </div>
                  <div class="w-100">
                    <p
                      class="w-100 mt-4 text-white font-weight-bold text-body-1 mb-2"
                      style="margin-left: -30px"
                    >
                      Buscador de oficinas, cajeros y <br> subagentes
                    </p>
                    <!-- <p
                      class="w-100 text-white font-weight-thin text-caption"
                      style="margin-left: -30px"
                    >
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Tempore
                    </p> -->
                  </div>
                </v-card-text>
              </ClientOnly>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-card
              width="100%"
              height="70"
              class="card-filter my-5"
              @click="clearAllFilters()"
              :class="{ active: selectedFilter === '' && search === '' }"
              elevation="0"
              color="primary"
            >
              <v-card-text class="text-center">
                <v-icon color="white" left>mdi-filter-outline</v-icon>
                <p class="mb-5 text-white">Mostrar Todos</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- SEARCH FILTERS -->
          <v-col cols="12">
            <v-text-field
              v-model="search"
              @input="onSearchInput"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              clearable
            ></v-text-field>
          </v-col>

          <!-- FILTERS -->
          <v-col cols="3" class="px-1">
            <v-card
              width="100%"
              height="100"
              class="card-filter"
              @click="setFilter('locationBranches')"
              :class="{ active: selectedFilter === 'locationBranches' }"
              elevation="0"
            >
              <v-card-text class="text-center">
                <icon-image
                  :src="LocationBranchesIcon"
                  alt="Icono sucursales"
                  width="32"
                  height="32"
                  container-class="filter-icon-container"
                />
                <p class="mb-5">Sucursales</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3" class="px-1">
            <v-card
              width="100%"
              height="100"
              class="card-filter"
              @click="setFilter('locationAth')"
              :class="{ active: selectedFilter === 'locationAth' }"
              elevation="0"
            >
              <v-card-text class="text-center">
                <icon-image
                  :src="LocationAthIcon"
                  alt="Icono ATH"
                  width="32"
                  height="32"
                  container-class="filter-icon-container"
                />
                <p class="mb-5">ATH</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3" class="px-1">
            <v-card
              width="100%"
              height="100"
              class="card-filter"
              @click="setFilter('locationAutoBank')"
              :class="{ active: selectedFilter === 'locationAutoBank' }"
              elevation="0"
            >
              <v-card-text class="text-center">
                <icon-image
                  :src="LocationAutoBankIcon"
                  alt="Icono Auto Banco"
                  width="32"
                  height="32"
                  container-class="filter-icon-container"
                />
                <p class="mb-5">Auto Banco</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3" class="px-1">
            <v-card
              width="100%"
              height="100"
              class="card-filter"
              @click="setFilter('locationSubAgents')"
              :class="{ active: selectedFilter === 'locationSubAgents' }"
              elevation="0"
            >
              <v-card-text class="text-center">
                <icon-image
                  :src="LocationSubAgentsIcon"
                  alt="Icono Sub-Agentes"
                  width="32"
                  height="32"
                  container-class="filter-icon-container"
                />
                <p class="mb-5">Sub-Agentes</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-divider thickness="3" class="mt-5 mb-3"></v-divider>
          </v-col>
          <v-col cols="12">
            <v-row class="locations-list">
              <v-col
                v-for="(location, index) in filteredLocations"
                :key="location._id"
                cols="12"
              >
                <v-card class="mb-2" @click="selectLocation(location)">
                  <v-card-title class="text-primary">
                    <icon-image
                      :src="iconByTypeLocation(location.type)"
                      :alt="`Icono ${location.type}`"
                      width="20"
                      height="20"
                      container-class="location-icon-container mr-2"
                    />
                    {{ location.label }}
                  </v-card-title>
                  <v-card-subtitle
                    style="overflow: inherit; white-space: inherit"
                    >{{ location.address }}</v-card-subtitle
                  >
                  <v-card-text>
                    <div>
                      <v-icon color="primary" left>mdi-city</v-icon>
                      {{ location.city }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <!-- DIALOG FILTER MAPS -->
    <v-dialog
      class="dialog-filters d-block d-md-none"
      v-model="showDialogFilter"
    >
      <v-card class="rounded-xl" position="relative" z-index="999999">
        <v-row class="pa-5" justify="space-around" no-gutters>
          <v-col cols="12">
            <v-card
              width="100%"
              height="70"
              class="card-filter mb-5"
              @click="clearAllFilters()"
              :class="{ active: selectedFilter === '' && search === '' }"
              elevation="0"
              color="primary"
            >
              <v-card-text class="text-center">
                <v-icon color="white" left>mdi-filter-outline</v-icon>
                <p class="mb-5 text-white">Mostrar Todos</p>
              </v-card-text>
            </v-card>
          </v-col>

          <!-- SEARCH FILTERS MOBILE -->
          <v-col cols="12">
            <v-text-field
              v-model="search"
              @input="onSearchInput"
              label="Buscar"
              prepend-inner-icon="mdi-magnify"
              clearable
            ></v-text-field>
          </v-col>

          <v-col cols="3" class="px-1">
            <v-card
              width="100%"
              height="100"
              class="card-filter"
              @click="setFilter('locationBranches')"
              :class="{ active: selectedFilter === 'locationBranches' }"
              elevation="0"
            >
              <v-card-text class="text-center">
                <icon-image
                  :src="LocationBranchesIcon"
                  alt="Icono sucursales"
                  width="32"
                  height="32"
                  container-class="filter-icon-container"
                />
                <p class="mb-5">Sucursales</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3" class="px-1">
            <v-card
              width="100%"
              height="100"
              class="card-filter"
              @click="setFilter('locationAth')"
              :class="{ active: selectedFilter === 'locationAth' }"
              elevation="0"
            >
              <v-card-text class="text-center">
                <icon-image
                  :src="LocationAthIcon"
                  alt="Icono ATH"
                  width="32"
                  height="32"
                  container-class="filter-icon-container"
                />
                <p class="mb-5">ATH</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3" class="px-1">
            <v-card
              width="100%"
              height="100"
              class="card-filter"
              @click="setFilter('locationAutoBank')"
              :class="{ active: selectedFilter === 'locationAutoBank' }"
              elevation="0"
            >
              <v-card-text class="text-center">
                <icon-image
                  :src="LocationAutoBankIcon"
                  alt="Icono Auto Banco"
                  width="32"
                  height="32"
                  container-class="filter-icon-container"
                />
                <p class="mb-5">Auto Banco</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="3" class="px-1">
            <v-card
              width="100%"
              height="100"
              class="card-filter"
              @click="setFilter('locationSubAgents')"
              :class="{ active: selectedFilter === 'locationSubAgents' }"
              elevation="0"
            >
              <v-card-text class="text-center">
                <icon-image
                  :src="LocationSubAgentsIcon"
                  alt="Icono Sub-Agentes"
                  width="32"
                  height="32"
                  container-class="filter-icon-container"
                />
                <p class="mb-5">Sub-Agentes</p>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12">
            <v-divider thickness="3" class="mt-5 mb-3"></v-divider>
          </v-col>
          <v-col cols="12">
            <v-row class="locations-list">
              <v-col
                v-for="(location, index) in filteredLocations"
                :key="location._id"
                cols="12"
              >
                <v-card class="mb-2" @click="selectLocation(location)">
                  <v-card-title class="text-primary">
                    <icon-image
                      :src="iconByTypeLocation(location.type)"
                      :alt="`Icono ${location.type}`"
                      width="20"
                      height="20"
                      container-class="location-icon-container mr-2"
                    />
                    {{ location.label }}
                  </v-card-title>
                  <v-card-subtitle
                    style="overflow: inherit; white-space: inherit"
                    >{{ location.address }}</v-card-subtitle
                  >
                  <v-card-text>
                    <div>
                      <v-icon color="primary" left>mdi-city</v-icon>
                      {{ location.city }}
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <v-btn
          @click="showDialogFilter = !showDialogFilter"
          class="text-caption rounded-xl"
          color="primary"
          position="fixed"
          style="bottom: 0"
          block
        >
          Aplicar Filtros
        </v-btn>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style lang="scss" scoped>
.filters-container {
  width: 100%;
  height: 100vh;
  border-radius: 20px 0 0 20px;
  overflow-y: scroll;
  position: relative;
  z-index: 2;
  background: #fbfaff;

  &::-webkit-scrollbar {
    display: none !important;
    scrollbar-width: none !important;
    -ms-overflow-style: none !important;
  }
}

.dialog-filters {
  .v-card {
    &::-webkit-scrollbar {
      display: none !important;
      scrollbar-width: none !important;
      -ms-overflow-style: none !important;
    }
  }
}

.map-container {
  padding-top: 12px;
}

.locations-list {
  margin-top: 0;
}

.card-filter {
  &.active {
    background-color: #4caf50;

    p,
    i {
      color: white;
    }
  }
}

.v-card {
  cursor: pointer;
  border-radius: 15px;
  transition: box-shadow 0.3s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
}

.v-card-title {
  display: flex;
  align-items: center;
  font-weight: bold;
}

.v-icon {
  margin-right: 8px;
}

.v-card-subtitle,
.v-card-text {
  color: #7f8c8d;
}

/* Estilos para iconos optimizados */
.filter-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.location-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
