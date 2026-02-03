<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT COMPONENT
import { GoogleMap, Marker } from "vue3-google-map";

// IMPORT ICONS
import PinAth from "~/assets/icons/pin-ath.svg";

// IMPORT QUERY
import { GET_COINS } from "~/graphql/query/coins.query";
import { GET_LOCATIONS } from "~/graphql/query/locations.query";

// IMPORT INTERFACES
import type { LocationInterface } from "~/interfaces/locations.interface";
import type { CoinInterface } from "~/interfaces/coins.interface";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "dashboard-screen",
  components: {
    "google-map-app": GoogleMap,
    "marker-map-app": Marker,
  },
})
class DashboardScreen extends Vue {
  ///////////////
  // VARIABLES //
  ///////////////
  public gmapkey: string = import.meta.env.VITE_GMAP_KEY || '';

  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any = useRouter();

  // APOLLO INSTANCE
  public $apollo: any;

  // PIN TYPE
  public pin: any = PinAth;

  // DEFAULT CENTER MAP
  public mapCenter: { lat: number; lng: number } = {
    lat: 18.50012,
    lng: -69.98857,
  };

  // DEFAULT LOCATIONS ARRAY
  public locations: Array<LocationInterface> = [];

  // DEFAULT COINS ARRAY
  public coins: Array<CoinInterface> = [];

  //////////////////////////
  /// CICLE LIFE METHODS ///
  //////////////////////////

  public created() {
    // SET LOCATIONS
    this.setLocations();

    // SET COINS
    this.setCoins();

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

  // SET COINS
  public async setCoins() {
    try {
      // GET ALL COINS
      const { data } = await this.$apollo.query({
        query: GET_COINS,
        fetchPolicy: "no-cache",
      });

      // SET COINS TO VARIABLE
      this.coins = data.coins;
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }
}
export default DashboardScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <v-row class="px-10" justify="center" align-content="center">
    <v-col cols="12">
      <v-slide-group class="py-10" show-arrows>
        <v-slide-group-item v-for="coin in coins" :key="coin._id">
          <v-card width="250" height="100" rounded="xl" class="pa-0 my-2 mx-4">
            <v-card-text class="text-left pa-0">
              <v-row class="h-100" align-content="center" no-gutters>
                <v-col cols="4" class="pa-0">
                  <v-img :src="coin.logo" width="100" height="100" />
                </v-col>
                <v-col class="mt-4" cols="8">
                  <p class="text-caption">{{ coin.name }}</p>
                  <p class="text-caption">
                    1{{ coin.prefix }} = RD${{ coin.price.buy }}
                  </p>
                  <p class="text-caption">
                    1{{ coin.prefix }} = RD${{ coin.price.sell }}
                  </p>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>
        </v-slide-group-item>
      </v-slide-group>
    </v-col>
    <v-col class="mt-0" cols="8">
      <v-card rounded="xl" class="pa-5">
        <google-map-app
          :api-key="gmapkey"
          style="
            width: 100%;
            height: 500px;
            border-radius: 20px;
            overflow: hidden;
          "
          :center="mapCenter"
          :zoom="7"
        >
          <marker-map-app
            v-for="location in locations"
            :options="{
              position: {
                lat: Number(location.latitude),
                lng: Number(location.longitude),
              },
              icon: pin,
            }"
            :key="location._id"
          />
        </google-map-app>
      </v-card>
    </v-col>
    <v-col class="mt-10" cols="4"> </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss"></style>
