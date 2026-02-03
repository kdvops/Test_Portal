<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// @ts-nocheck
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { TargetInterface } from "~/interfaces/targets.interface";
import { useTargetManager } from "~/composables/useTargetManager";
import CategoryFormPage from "~/features/categories/components/CategoryFormPage.vue";
import { useCategoryForm } from "~/features/categories/composables/useCategoryForm";
import { useCategoryStore } from "~/features/categories/store/categoryStore.factory";
import type { CategoryStorePort } from "~/features/categories/store/categoryStore.port";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "profits-categories-update-screen",
  components: {
    "category-form-page": CategoryFormPage,
  },
})
class ProfitsCategoriesUpdateScreen extends Vue {
  // Route params
  public categoryID = useRoute().params._id;

  // Instances
  public $bus: any;
  public override $router: any = useRouter();
  public override $apollo: any;
  public targetManager = useTargetManager();
  public categoryForm = useCategoryForm();
  public categoryStore!: CategoryStorePort;

  // Form state
  public category: CategoriesInterface = this.categoryForm.createDefaultCategory();
  public categories: Array<CategoriesInterface> = [];
  public parentCategorySelected: string | CategoriesInterface = "";
  public formValid: boolean = false;
  public loading: boolean = false;
  public rules = this.categoryForm.createRules();

  // UI state
  public active: any = [];
  public open: any = [];
  public showInfoDialog: boolean = false;
  public targetInfo: TargetInterface | null = null;

  public async created() {
    this.categoryStore = useCategoryStore(this.$apollo);

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });

    // CARGAR TARGETS DINÁMICOS Y SELECCIONAR TARGET ACTUAL
    await this.targetManager.loadDynamicTargets(this.$apollo);
    this.targetManager.selectTarget("categoryProfits");

    // SET TARGET INFO
    await this.setTargetInfo();

    // SET CATEGORY
    await this.setCategory();

    // SET CATEGORIES
    await this.setCategories();

    // SET PARENT TARGET
    if (this.category.parentID) {
      this.category.parentTarget = null;
    } else {
      this.category.parentTarget = "categoryGlobal";
    }
  }

  // SET TARGET INFO
  public async setTargetInfo() {
    try {
      // SET TARGET INFO FOR STATIC TARGET
      this.targetInfo = {
        _id: "categoryProfits",
        name: "Profits",
        color: "#12539b",
        description: "Categorías de Profits",
        status: "publish",
        createdAt: new Date(),
        updatedAt: new Date(),
        slug: "",
        icon: "",
        sections: [],
        featured: "hidden",
      };
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET CATEGORY
  public async setCategory() {
    try {
      await this.categoryStore.loadCategory(this.categoryID as string);
      this.category = this.categoryStore.state.category as CategoriesInterface;

      const normalizedTargetKey = this.targetManager.getTargetKey(
        this.category.target || ""
      );
      if (normalizedTargetKey) {
        this.targetManager.selectTarget(normalizedTargetKey);
        if (this.targetManager.isStaticTarget(normalizedTargetKey)) {
          this.category.target =
            this.targetManager.getTargetValueForSave(normalizedTargetKey);
          this.category.targetID = undefined;
        } else {
          this.category.targetID =
            this.targetManager.getTargetValueForSave(normalizedTargetKey);
          this.category.target = "";
        }
      }
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET CATEGORIES
  public async setCategories() {
    try {
      const categoriesForTarget =
        await this.targetManager.getCategoriesForTarget(
          this.$apollo,
          "categoryProfits"
        );
      this.categories = (categoriesForTarget || []).filter(
        (category: any) => category._id !== this.categoryID
      );
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  public setCategorySelected(category: any) {
    this.parentCategorySelected =
      this.categoryForm.setParentCategorySelected(
        category,
        this.categories,
        this.category
      );
  }

  // MANEJAR CAMBIO DE TARGET (DESHABILITADO EN UI, SE MANTIENE PARA PARIDAD)
  public async onTargetChange(targetKey: any) {
    if (!targetKey) return;

    try {
      const key = String(targetKey);
      const targetValueForSave = this.targetManager.getTargetValueForSave(key);
      if (this.targetManager.isStaticTarget(key)) {
        this.category.target = targetValueForSave;
        this.category.targetID = undefined;
      } else {
        this.category.targetID = targetValueForSave;
        this.category.target = "";
      }

      // CARGAR CATEGORÍAS PARA EL NUEVO TARGET
      this.categories = await this.targetManager.getCategoriesForTarget(
        this.$apollo,
        key
      );

      // RESETEAR SELECCIÓN DE CATEGORÍA PADRE
      this.parentCategorySelected = "";
      this.category.parentID = null;
      this.category.parentTarget = "categoryGlobal";
    } catch (err) {
      this.$bus.$emit("handleError", err);
    }
  }

  // UPDATE CATEGORY
  public async updateCategory() {
    this.loading = true;
    try {
      const isStatic = this.categoryForm.validateTargetVsTargetID(this.category);
      const base = this.categoryForm.prepareCategoryForSave(
        this.category,
        isStatic,
        "null"
      );

      await this.categoryStore.update(base);

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO CATEGORIES LIST
      this.$router.push(`/profits/categories/list`);

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: `Categoría de ${this.targetInfo?.name} actualizada correctamente!`,
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

  // UPDATE CATEGORY DRAFT
  public async updateCategoryDraft() {
    this.loading = true;
    try {
      const isStatic = this.categoryForm.validateTargetVsTargetID(this.category);
      const base = this.categoryForm.prepareCategoryForSave(
        this.category,
        isStatic,
        "null"
      );

      const { data } = await this.categoryStore.updateDraft(base);

      // SET LOADING FALSE
      this.loading = false;

      return data;
    } catch (err) {
      // SET LOADING FALSE
      this.loading = false;

      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  public updateSlug() {
    this.categoryForm.updateSlug(this.category);
  }

  public async goPreview() {
    // UPDATE ALL CHANGE
    await this.updateCategoryDraft();

    // GO PREVIEW CATEGORY
    const route = this.$router.resolve({
      path: `/previews/category/${"profits"}`,
    });
    window.open(route.href, "_blank");

    // REFRESH ROUTE
    window.location.reload();
  }

  // SAVE ITEM
  public async saveCategory() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    await this.updateCategoryDraft();

    // REFRESH ROUTE
    window.location.reload();
  }

  // GO TO UPDATE SUBCATEGORY
  public goUpdate(categoryID: string) {
    this.$router.push(`/profits/categories/update/${categoryID}`);
  }
}
export default ProfitsCategoriesUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <category-form-page
    :category="category"
    :categories="categories"
    :parent-category-selected="parentCategorySelected"
    :rules="rules"
    :target-manager="targetManager"
    :target-name="targetInfo?.name || 'Profits'"
    :loading="loading"
    v-model:form-valid="formValid"
    v-model:show-info-dialog="showInfoDialog"
    v-model:active="active"
    v-model:open="open"
    @target-change="onTargetChange"
    @category-selected="setCategorySelected"
    @update-slug="updateSlug"
  >
    <template #extra-sections>
      <template
        v-if="
          category.subcategories &&
          category.subcategories.length > 0 &&
          !category.parentID
        "
      >
        <v-col cols="12">
          <div class="banner-categories-by-parent pl-2 pr-15">
            <h3 class="text-white text-uppercase">Subcategorías</h3>
          </div>
        </v-col>
        <v-col cols="12" class="pb-15 mb-15">
          <v-slide-group class="pa-4" show-arrows>
            <v-slide-group-item
              v-for="subcategory in category.subcategories"
              :key="subcategory._id"
            >
              <v-card width="250" rounded="xl" class="pa-0 mx-4" color="#00a44f">
                <v-toolbar color="transparent">
                  <v-toolbar-title
                    class="text-subtitle-2 text-caption text-uppercase text-white font-weight-bold"
                    :text="subcategory.name"
                  >
                    <v-tooltip activator="parent" location="bottom">{{
                      subcategory.name
                    }}</v-tooltip>
                  </v-toolbar-title>
                  <template v-slot:append>
                    <v-btn
                      @click="goUpdate(subcategory._id!)"
                      variant="outlined"
                      rounded="xl"
                      absolute
                      density="compact"
                      icon
                      class="mr-4"
                    >
                      <v-icon size="15">mdi-pencil</v-icon>
                    </v-btn>
                  </template>
                </v-toolbar>
                <v-card-text class="pa-0">
                  <v-img
                    width="100%"
                    height="200px"
                    :src="subcategory.pictures.responsive"
                    cover
                  />
                </v-card-text>
              </v-card>
            </v-slide-group-item>
          </v-slide-group>
        </v-col>
      </template>
    </template>
    <template #actions>
      <v-bottom-navigation :bg-color="targetInfo?.color || '#12539b'">
        <v-btn
          position="absolute"
          rounded="xl"
          :base-color="
            category.status && category.status === 'draft' ? 'orange' : 'green'
          "
          style="height: 30px; top: 15px; left: 10px"
          variant="tonal"
          readonly
        >
          {{
            category.status && category.status === "draft"
              ? "Borrador"
              : "Publicado"
          }}
        </v-btn>
        <v-btn
          @click="updateCategory()"
          :disabled="!formValid"
          :loading="loading"
        >
          <v-icon> mdi-upload </v-icon>
          Actualizar y publicar
        </v-btn>
        <v-btn @click="saveCategory()" :disabled="!formValid" :loading="loading">
          <v-icon> mdi-content-save </v-icon>
          Guardar borrador
        </v-btn>
        <v-btn @click="goPreview()" :disabled="loading">
          <v-icon> mdi-eye </v-icon>
          Ver Vista Previa
        </v-btn>
      </v-bottom-navigation>
    </template>
    <template #info-dialog>
      <v-card class="info-dialog">
        <v-card-title class="d-flex align-center">
          <v-icon color="primary" class="mr-2">mdi-information</v-icon>
          <span class="text-h5 font-weight-bold"
            >📋 Guía de Uso: Secciones y Categorías</span
          >
        </v-card-title>

        <v-card-text class="pa-6">
          <v-row>
            <v-col cols="12" md="6">
              <v-card
                variant="outlined"
                color="success"
                class="pa-4 rounded-lg h-100"
              >
                <div class="d-flex align-center mb-3">
                  <v-icon color="success" class="mr-2"
                    >mdi-folder-multiple</v-icon
                  >
                  <span class="text-h6 font-weight-bold text-success"
                    >Secciones</span
                  >
                </div>
                <p class="text-body-1 mb-0">
                  Las <strong>secciones</strong> son contenedores principales
                  que organizan el contenido por tipo de negocio o área
                  específica. Cada sección tiene su propio conjunto de
                  categorías.
                </p>
              </v-card>
            </v-col>

            <v-col cols="12" md="6">
              <v-card
                variant="outlined"
                color="info"
                class="pa-4 rounded-lg h-100"
              >
                <div class="d-flex align-center mb-3">
                  <v-icon color="info" class="mr-2">mdi-tag-multiple</v-icon>
                  <span class="text-h6 font-weight-bold text-info"
                    >Categorías</span
                  >
                </div>
                <p class="text-body-1 mb-0">
                  Las <strong>categorías</strong> organizan el contenido dentro
                  de cada sección. Pueden ser globales (principales) o
                  subcategorías (hijas de otras categorías). Usa el selector de
                  categoría padre para crear jerarquías.
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-divider class="my-6"></v-divider>

          <v-row>
            <v-col cols="12">
              <div class="d-flex align-center mb-3">
                <v-icon color="warning" class="mr-2">mdi-lightbulb-on</v-icon>
                <span class="text-h6 font-weight-bold text-warning"
                  >💡 Consejos Prácticos:</span
                >
              </div>
              <v-list class="bg-transparent">
                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>Categoría Global:</strong> No selecciones categoría
                    padre para una categoría principal.
                  </v-list-item-title>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>Subcategoría:</strong> Selecciona una categoría
                    padre para crear una subcategoría.
                  </v-list-item-title>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>Slug:</strong> Se genera automáticamente desde el
                    nombre, pero puedes editarlo.
                  </v-list-item-title>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>Target:</strong> Muestra el target de la categoría
                    (no editable en esta pantalla).
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn
            color="primary"
            variant="tonal"
            @click="showInfoDialog = false"
          >
            Entendido
          </v-btn>
        </v-card-actions>
      </v-card>
    </template>
  </category-form-page>
</template>
