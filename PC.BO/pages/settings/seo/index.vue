<script lang="ts">
import { Ref, Vue } from "vue-facing-decorator";
import DetailedImageComponent from "~/components/detailed-image/index.vue";

@NuxtComponent({
  name: "seo-screen",
  components: {
    "detailed-image-component": DetailedImageComponent,
  },
})
class SeoScreen extends Vue {
  // APP INSTANCE
  public $app: any;

  // BUS INSTANCE FOR EMIT EVENT
  public $bus: any;

  // ROUTER INSTANCE
  public override $router: any;
  public override $apollo: any;

  public pages: Array<{ name: string; permalink: string }> = [
    { name: "x", permalink: "/" },
    { name: "x", permalink: "/tarjetas" },
  ];

  public created() {
    this.setPages();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin", middleware: "dashboard" });
  }

  // GET IMAGE FILE AND SET IN ITEM COIN
  public setPages() {}
}
export default SeoScreen;
</script>

<template>
  <v-row class="px-5 pt-10" justify="center" align-content="center">
    <v-col cols="11"> </v-col>
  </v-row>
</template>

<!-- SASS STYLES -->
<style lang="scss" scoped></style>
