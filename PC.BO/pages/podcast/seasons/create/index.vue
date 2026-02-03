<!-- SCRIPT TEMPLATE -->
<script lang="ts">
// @ts-nocheck
// IMPORT VUE CLASS
import { Vue } from "vue-facing-decorator";

// IMPORT INTERFACE
import type { CategoriesInterface } from "~/interfaces/categories.interface";
import { useTargetManager } from "~/composables/useTargetManager";
import CategoryFormPage from "~/features/categories/components/CategoryFormPage.vue";
import { useCategoryForm } from "~/features/categories/composables/useCategoryForm";
import { useCategoryStore } from "~/features/categories/store/categoryStore.factory";
import type { CategoryStorePort } from "~/features/categories/store/categoryStore.port";

// INIT COMPONENTS CLASS
@NuxtComponent({
  name: "podcast-seasons-create-screen",
  components: {
    "category-form-page": CategoryFormPage,
  },
})
class PodcastSeasonsCreateScreen extends Vue {
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

  public async created() {
    this.categoryStore = useCategoryStore(this.$apollo);

    // CARGAR TARGETS DINAMICOS
    await this.targetManager.loadDynamicTargets(this.$apollo);

    // SELECCIONAR TARGET ESTATICO POR SECCION
    const defaultKey = "categoryPodcast";
    this.targetManager.selectTarget(defaultKey);

    // CONFIGURAR TARGET/TARGETID EN CATEGORIA
    const targetValueForSave =
      this.targetManager.getTargetValueForSave(defaultKey);
    this.category.target = targetValueForSave;
    this.category.targetID = undefined;

    // INICIALIZAR COMO CATEGORIA GLOBAL
    this.category.parentTarget = "categoryGlobal" as any;

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
        "categoryPodcast"
      );
    } catch (err) {
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

      // CARGAR CATEGORIAS PARA EL NUEVO TARGET
      this.categories = await this.targetManager.getCategoriesForTarget(
        this.$apollo,
        key
      );

      // RESETEAR SELECCION DE CATEGORIA PADRE
      this.parentCategorySelected = "";
      this.category.parentID = null;
      this.category.parentTarget = "categoryGlobal" as any;
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
      this.$router.push("/podcast/seasons/list");

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: "Temporada creada correctamente!",
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
    this.$router.push(`/podcast/seasons/update/${category.createCategory._id}`);

    // GO PREVIEW BEFORE CREATE CATEGORY
    const route = this.$router.resolve({
      path: `/previews/podcast/${category.createCategory._id}`,
    });
    window.open(route.href, "_blank");
  }

  // SAVE ITEM
  public async saveCategory() {
    // FIRST CREATE PRODUCT STATUS DRAFT
    const category = await this.createCategoryDraft();

    // GO EDIT AFTER CREATE PRODUCT
    this.$router.push(`/podcast/seasons/update/${category.createCategory._id}`);
  }
}
export default PodcastSeasonsCreateScreen;
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
  </category-form-page>
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