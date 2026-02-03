<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// @ts-nocheck
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { CreateCategoryRules } from "~/interfaces/rules.interface";

// IMPORT COMPOSABLES
import { useTargetManager } from "~/composables/useTargetManager";
import CategoryFormPage from "~/features/categories/components/CategoryFormPage.vue";
import { useCategoryForm } from "~/features/categories/composables/useCategoryForm";
import { useCategoryStore } from "~/features/categories/store/categoryStore.factory";
import type { CategoryStorePort } from "~/features/categories/store/categoryStore.port";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "target-categories-create-screen",
  components: {
    "category-form-page": CategoryFormPage,
  },
})
class TargetCategoriesCreateScreen extends Vue {
  // GET PARAM TARGET
  public targetParam = useRoute().params.target;

  // Instances
  public override $bus: any;
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
  public rules: CreateCategoryRules = this.categoryForm.createRules();

  // UI state
  public active: any = [];
  public open: any = [];
  public showInfoDialog: boolean = false;

  public async created() {
    this.categoryStore = useCategoryStore(this.$apollo);

    // CARGAR TARGETS DINÁMICOS
    await this.targetManager.loadDynamicTargets(this.$apollo);

    // SELECCIONAR TARGET BASADO EN PARÁMETRO
    this.targetManager.selectTarget(this.targetParam as string);

    // CONFIGURAR TARGET/TARGETID EN CATEGORÍA SEGÚN SEA ESTÁTICO O DINÁMICO
    const targetValueForSave = this.targetManager.getTargetValueForSave(
      this.targetParam as string
    );
    if (this.targetManager.isStaticTarget(this.targetParam as string)) {
      this.category.target = targetValueForSave;
      this.category.targetID = undefined;
    } else {
      this.category.targetID = targetValueForSave;
      this.category.target = "";
    }

    // INICIALIZAR COMO CATEGORÍA GLOBAL
    this.category.parentTarget = "categoryGlobal";

    // SET CATEGORIES
    await this.setCategories();

    // DEFINE PAGE META
    definePageMeta({ layout: "admin" });
  }

  // SET CATEGORIES
  public async setCategories() {
    try {
      this.categories = await this.targetManager.getCategoriesForTarget(
        this.$apollo,
        this.targetParam as string
      );
    } catch (err) {
      // SHOW ERROR
      this.$bus.$emit("handleError", err);
    }
  }

  // SET PARENT CATEGORY
  public setCategorySelected(category: any) {
    this.parentCategorySelected =
      this.categoryForm.setParentCategorySelected(
        category,
        this.categories,
        this.category
      );
  }

  // MANEJAR CAMBIO DE TARGET
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

  // CREATE CATEGORY
  public async createCategory() {
    this.loading = true;
    try {
      const isStatic = this.categoryForm.validateTargetVsTargetID(this.category);
      const base = this.categoryForm.prepareCategoryForSave(
        this.category,
        isStatic,
        "delete"
      );

      await this.categoryStore.create(base);

      // SET LOADING FALSE
      this.loading = false;

      // REDIRECT TO CATEGORIES LIST
      this.$router.push(`/targets/${this.targetParam}/categories/list`);

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Categoría creada correctamente!",
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

  // CREATE CATEGORY DRAFT
  public async createCategoryDraft() {
    this.loading = true;
    try {
      const isStatic = this.categoryForm.validateTargetVsTargetID(this.category);
      const base = this.categoryForm.prepareCategoryForSave(
        this.category,
        isStatic,
        "delete"
      );

      const { data } = await this.categoryStore.createDraft(base);

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
    // FIRST CREATE CATEGORY STATUS DRAFT
    const category = await this.createCategoryDraft();

    // GO EDIT AFTER CREATE CATEGORY
    this.$router.push(
      `/targets/${this.targetManager.selectedTarget.value}/categories/update/${category.createCategory._id}`
    );

    // GO PREVIEW BEFORE CREATE CATEGORY
    const route = this.$router.resolve({
      path: `/previews/category/targets/${category.createCategory._id}`,
    });

    // OPEN PREVIEW IN NEW TAB
    window.open(route.href, "_blank");
  }

  // SAVE ITEM
  public async saveCategory() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const category = await this.createCategoryDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(
      `/targets/${this.targetManager.selectedTarget.value}/categories/update/${category.createCategory._id}`
    );
  }
}
export default TargetCategoriesCreateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <category-form-page
    :category="category"
    :categories="categories"
    :parent-category-selected="parentCategorySelected"
    :rules="rules"
    :target-manager="targetManager"
    :loading="loading"
    :target-select-clearable="true"
    v-model:form-valid="formValid"
    v-model:show-info-dialog="showInfoDialog"
    v-model:active="active"
    v-model:open="open"
    @target-change="onTargetChange"
    @category-selected="setCategorySelected"
    @update-slug="updateSlug"
  >
    <template #actions>
      <v-col cols="10">
        <v-bottom-navigation bg-color="#12539b">
          <v-btn
            @click="createCategory()"
            :disabled="!formValid"
            :loading="loading"
          >
            <v-icon> mdi-upload </v-icon>
            Crear
          </v-btn>
          <v-btn
            @click="saveCategory()"
            :disabled="!formValid"
            :loading="loading"
          >
            <v-icon> mdi-content-save </v-icon>
            Guardar
          </v-btn>
          <v-btn @click="goPreview()" :disabled="!formValid">
            <v-icon> mdi-eye </v-icon>
            Ver Vista Previa
          </v-btn>
        </v-bottom-navigation>
      </v-col>
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
                  específica (Productos, Empresas, Seguros, etc.). Cada sección
                  tiene su propio conjunto de categorías.
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
                    padre para crear una categoría principal
                  </v-list-item-title>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>Subcategoría:</strong> Selecciona una categoría
                    padre para crear una subcategoría
                  </v-list-item-title>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>Slug:</strong> Se genera automáticamente desde el
                    nombre, pero puedes editarlo
                  </v-list-item-title>
                </v-list-item>

                <v-list-item class="px-0">
                  <template v-slot:prepend>
                    <v-icon color="success">mdi-check-circle</v-icon>
                  </template>
                  <v-list-item-title>
                    <strong>Target:</strong> Define a qué sección pertenece esta
                    categoría
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
