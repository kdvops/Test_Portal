<script lang="ts">
import { Vue } from "vue-facing-decorator";
import { reactive } from "vue";
import PageTreeComponent, {
  type PageTreeItem,
} from "~/components/page-seo/index.vue";
import type {
  DialogCreateSeoPageInterface,
  SeoPageInterface,
} from "~/interfaces/seo.interface";

const AppLottie = process.client
  ? defineAsyncComponent(() => import("vue3-lottie").then((m) => m.Vue3Lottie))
  : defineComponent({ name: "AppLottieSSRStub", setup: () => () => null });
import AnimationLocation from "~/assets/animations/page-seo.json";

import { formatPath, buildUrlPathRules, titleFromPath } from "~/utils/urlPath";

// IMPORT QUERY'S
import { GET_SEO_PAGES } from "~/graphql/query/seoPage.query";
import {
  CREATE_SEO_PAGES,
  CREATE_SEO_PAGE,
  UPDATE_SEO_PAGE,
  REMOVE_SEO_PAGE,
} from "~/graphql/mutations/seoPage.mutation";

@NuxtComponent({
  name: "seo-pages-screen",
  components: {
    "page-tree-component": PageTreeComponent,
    "app-lottie": AppLottie,
  },
})
class SeoPagesScreen extends Vue {
  public animationLocation: any = AnimationLocation;

  public $app: any;
  public $bus: any;
  public override $router: any;
  public override $apollo: any;

  public confirmDelete = reactive<{
    show: boolean;
    item: SeoPageInterface | null;
    index: number;
    loading: boolean;
  }>({
    show: false,
    item: null,
    index: -1,
    loading: false,
  });

  public dialog: DialogCreateSeoPageInterface =
    reactive<DialogCreateSeoPageInterface>({
      show: false,
      loading: false,
      action: "create",
      index: -1,
      seoPage: { path: "", meta: null },
    });

  public created() {
    definePageMeta({ layout: "admin" });
    this.getSeoPages();
  }

  public seoPages: SeoPageInterface[] = [];

  public async getSeoPages() {
    try {
      // GET ALL LOCATIONS
      const { data } = await this.$apollo.query({
        query: GET_SEO_PAGES,
        fetchPolicy: "no-cache",
      });

      this.seoPages.splice(0, this.seoPages.length, ...data.seoPages);
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public async createSeoPage() {
    // SET LOADING
    this.dialog.loading = true;

    // CREATE COINS DTO PAYLOAD
    const createSeoPageDto = {
      createSeoPageDto: { ...this.dialog.seoPage },
    };

    try {
      // CREATE COINS
      await this.$apollo.mutate({
        mutation: CREATE_SEO_PAGE,
        variables: createSeoPageDto,
      });

      // SET LOADING
      this.dialog.loading = false;

      // SHOW MESSAGE SUCCESS SNACKBAR
      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Moneda creada correctamente!",
        color: "success",
      });

      // CLOSE DIALOG
      this.closeDialog();

      // SET COINS
      this.getSeoPages();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // CLOSE DIALOG
      this.closeDialog();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public async updateSeoPage() {
    this.dialog.loading = true;
    const seoPage = this.dialog.seoPage || {};

    const updateSeoPageDto = {
      updateSeoPageDto: seoPage,
    };

    try {
      await this.$apollo.mutate({
        mutation: UPDATE_SEO_PAGE,
        variables: updateSeoPageDto,
      });

      this.dialog.loading = false;

      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Página actualizada correctamente!",
        color: "success",
      });

      this.closeDialog();
      this.getSeoPages();
    } catch (err) {
      // SET LOADING
      this.dialog.loading = false;

      // CLOSE DIALOG
      this.closeDialog();

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public async removeSeoPage() {
    this.confirmDelete.loading = true;

    const removeSeoPageDto = {
      seoPageId: this.confirmDelete.item?._id,
    };

    try {
      await this.$apollo.mutate({
        mutation: REMOVE_SEO_PAGE,
        variables: removeSeoPageDto,
      });

      this.confirmDelete.loading = false;

      this.$bus.$emit("showSnackbar", {
        show: true,
        message: "Página eliminada correctamente!",
        color: "success",
      });

      this.cancelDelete();

      this.getSeoPages();
    } catch (err) {
      this.confirmDelete.loading = false;

      this.cancelDelete();

      this.$bus.$emit("handleError", err);
    }
  }

  public createPage = async () => {
    this.dialog.action = "create";
    this.dialog.index = -1;
    this.dialog.seoPage = { path: "", meta: { title: "", description: "" } };
    this.dialog.show = true;
  };

  public onEdit = async (n: PageTreeItem) => {
    const idx = this.seoPages.findIndex((page) => {
      return page.path === n.path;
    });

    if (idx === -1) return;

    const original = this.seoPages[idx];
    const clone: SeoPageInterface = JSON.parse(JSON.stringify(original));
    clone.meta = clone.meta ?? { title: "", description: "" };

    this.dialog.index = idx;
    this.dialog.action = "edit";
    this.dialog.seoPage = clone;
    this.dialog.show = true;
  };

  public onDelete = (n: PageTreeItem) => {
    this.requestDelete(n);
  };

  public closeDialog = () => {
    this.dialog.show = false;
    this.dialog.seoPage = { path: "", meta: null };
    this.dialog.index = -1;
  };

  public savePage = () => {
    const seoPage = JSON.parse(JSON.stringify(this.dialog.seoPage));
    if (!seoPage) return;

    if (this.dialog.action === "create") {
      this.createSeoPage();
    } else if (this.dialog.index > -1) {
      this.updateSeoPage();
    }
    this.closeDialog();
  };

  public onPathInput = (val: string) => {
    if (!this.dialog?.seoPage) return;
    const formatted = formatPath(val);
    if (formatted !== val) {
      this.dialog.seoPage.path = formatted;
    }
    if (this.dialog.seoPage.meta) {
      this.dialog.seoPage.meta.title = titleFromPath(this.dialog.seoPage.path);
    }
  };

  public onPathBlur = () => {
    if (!this.dialog?.seoPage) return;
    this.dialog.seoPage.path = formatPath(this.dialog.seoPage.path || "");
    if (this.dialog.seoPage.meta) {
      this.dialog.seoPage.meta.title = titleFromPath(this.dialog.seoPage.path);
    }
  };

  get urlPathRules() {
    return buildUrlPathRules(
      this.seoPages.map((p) => p.path),
      this.dialog.index
    );
  }

  requestDelete(n: PageTreeItem) {
    const idx = this.seoPages.findIndex((p) => p.path === n.path);
    if (idx !== -1) {
      const item = this.seoPages[idx];
      this.confirmDelete.item = item;
      this.confirmDelete.index = idx;
      this.confirmDelete.show = true;
    }
  }

  cancelDelete() {
    this.confirmDelete.show = false;
    this.confirmDelete.item = null;
    this.confirmDelete.loading = false;
  }

  confirmDeleteNow() {
    console.log("confirmDeleteNow", this.confirmDelete);
    if (!this.confirmDelete.index || this.confirmDelete.index === -1) return;
    console.log("confirmDeleteNow - proceed");
    this.removeSeoPage();
  }
}
export default SeoPagesScreen;
</script>

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
                  Lista de páginas SEO,
                </p>
                <p class="text-caption text-white font-weight-light ml-10">
                  Ahora puedes gestionar las páginas SEO de tu sitio web de
                  manera fácil y rápida.
                </p>
                <v-btn
                  width="130"
                  variant="outlined"
                  class="mt-5 ml-10 text-caption"
                  rounded="xl"
                  density="compact"
                  @click="createPage"
                >
                  Crear página
                </v-btn>
              </v-col>
              <v-col cols="5" class="card-principal-animation">
                <app-lottie
                  width="290px"
                  height="290px"
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
    <v-col cols="12">
      <v-card class="pa-5" rounded="md" outlined elevation="2" color="#ffffff">
        <v-card-title class="text-h6 font-weight-bold">
          Páginas SEO
        </v-card-title>
        <v-divider class="my-4" />
        <v-card-text class="text-caption mb-4">
          Desde este panel puedes gestionar las páginas SEO de tu sitio web.
          Puedes crear nuevas páginas, editar las existentes y eliminar las que
          ya no necesites. Asegúrate de optimizar cada página con títulos y
          descripciones adecuadas para mejorar el posicionamiento en motores de
          búsqueda.
        </v-card-text>

        <page-tree-component
          v-model="seoPages"
          :max-depth="6"
          :base-url="'https://www.bsc.com.do'"
          :default-open="true"
          :indent-unit="20"
          :force-top-as-roots="true"
          :line-color="'rgba(150,150,150,.55)'"
          :line-width="1"
          @edit="onEdit"
          @delete="onDelete"
        />
      </v-card>
    </v-col>
  </v-row>

  <client-only>
    <teleport to="body">
      <v-dialog v-model="dialog.show" width="500" max-width="500" persistent>
        <v-card class="pa-0" rounded="xl" color="primary">
          <v-card-text v-if="dialog.seoPage">
            <v-row
              align-content="center"
              justify="center"
              no-gutters
              v-if="dialog.seoPage.meta"
            >
              <v-col cols="12" class="text-center" />
              <v-col cols="12" class="text-center mt-5">
                <v-text-field
                  prepend-inner-icon="mdi-card"
                  density="compact"
                  rounded="md"
                  v-model="dialog.seoPage.path"
                  label="Url de la página"
                  :rules="urlPathRules"
                  hint="Ej: /productos/tarjetas"
                  persistent-hint
                  clearable
                  @update:modelValue="onPathInput"
                  @blur="onPathBlur"
                />
              </v-col>

              <v-col cols="12" class="text-center pr-2">
                <v-text-field
                  prepend-inner-icon="mdi-card-text-outline"
                  density="compact"
                  rounded="md"
                  v-model="dialog.seoPage.meta.title"
                  label="Meta título"
                  required
                  clearable
                />
              </v-col>

              <v-col cols="12" class="text-center pr-2">
                <v-textarea
                  prepend-inner-icon="mdi-card-text"
                  density="compact"
                  rounded="md"
                  v-model="dialog.seoPage.meta.description"
                  label="Meta descripción"
                  auto-grow
                  rows="4"
                  clearable
                />
              </v-col>
            </v-row>
          </v-card-text>

          <v-card-actions class="px-4 pb-4">
            <v-btn variant="text" @click="closeDialog()">Cancelar</v-btn>
            <v-spacer />
            <v-btn variant="flat" color="white" @click="savePage()">
              {{ dialog.action === "create" ? "Crear" : "Guardar" }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
      <!-- DIALOG DELETE SLIDER -->
      <v-dialog v-model="confirmDelete.show" max-width="480">
        <v-card class="" rounded="xl" color="primary">
          <v-card-item>
            <v-card-title class="text-body-1 text-orange"
              >Confirmar eliminación</v-card-title
            >
          </v-card-item>
          <v-card-text>
            <p class="my-2">
              ¿Seguro que deseas eliminar
              <span v-if="confirmDelete.item">{{
                confirmDelete.item.path
              }}</span
              >? Esta acción no se puede deshacer.
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn text="Cancelar" variant="text" @click="cancelDelete" />
            <v-spacer />
            <v-btn
              text="Aceptar"
              variant="text"
              @click="confirmDeleteNow"
              :loading="confirmDelete.loading"
            />
          </v-card-actions>
        </v-card>
      </v-dialog>
    </teleport>
  </client-only>
</template>

<style lang="scss" scoped>
.card-principal-container {
  overflow: inherit !important;

  .card-principal-info-container {
    height: 180px !important;
    margin-top: -35px;
  }

  .card-principal-animation {
    margin-top: -60px;
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
