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
  name: "podcast-seasons-update-screen",
  components: {
    "category-form-page": CategoryFormPage,
  },
})
class PodcastSeasonsUpdateScreen extends Vue {
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
    this.targetManager.selectTarget("categoryPodcast");

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
        _id: "categoryPodcast",
        name: "Podcast",
        color: "#12539b",
        description: "Temporadas de Podcast",
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
          "categoryPodcast"
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
      this.$router.push(`/podcast/seasons/list`);

      // SHOW SNACKBAR
      this.$bus.$emit("showSnackbar", {
        text: `Temporada actualizada correctamente!`,
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
      path: `/previews/podcast/${this.categoryID}`,
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
    this.$router.push(`/podcast/seasons/update/${categoryID}`);
  }
}
export default PodcastSeasonsUpdateScreen;
</script>

<!-- HTML TEMPLATE -->
<template>
  <category-form-page
    :category="category"
    :categories="categories"
    :parent-category-selected="parentCategorySelected"
    :rules="rules"
    :target-manager="targetManager"
    :target-name="targetInfo?.name || 'Podcast'"
    :loading="loading"
    v-model:form-valid="formValid"
    v-model:show-info-dialog="showInfoDialog"
    v-model:active="active"
    v-model:open="open"
    @target-change="onTargetChange"
    @category-selected="setCategorySelected"
    @update-slug="updateSlug"
  >
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
  </category-form-page>
</template>
