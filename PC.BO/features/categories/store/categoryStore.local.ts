import { reactive } from "vue";
import type { CategoryStorePort } from "./categoryStore.port";
import {
  createCategory,
  fetchCategoriesByParentKey,
  fetchCategoriesByTarget,
  fetchCategoriesByTargetId,
  fetchCategoryById,
  updateCategory,
} from "~/features/categories/services/categories.service";
import type {
  CategoriesByParentInterface,
  CategoriesInterface,
} from "~/interfaces/categories.interface";
import { validateCategoryPayload } from "~/features/categories/domain/category.domain";

// Manual toggle for optional validations (disabled by default).
const ENABLE_SUGGESTED_VALIDATIONS = true;

export const createLocalCategoryStore = (apollo: any): CategoryStorePort => {
  const state = reactive({
    categories: [] as CategoriesInterface[],
    category: null as CategoriesInterface | null,
    loading: false,
    error: null as unknown | null,
  });

  const loadCategories = async (target: string) => {
    state.loading = true;
    state.error = null;
    try {
      const { data } = await fetchCategoriesByTarget(apollo, target);
      state.categories = data.findCategoryByTarget;
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  const loadCategory = async (categoryId: string) => {
    state.loading = true;
    state.error = null;
    try {
      const { data } = await fetchCategoryById(apollo, categoryId);
      state.category = data.findCategoryById;
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  const loadCategoriesByTargetId = async (targetId: string) => {
    state.loading = true;
    state.error = null;
    try {
      const { data } = await fetchCategoriesByTargetId(apollo, targetId);
      state.categories = data.findCategoriesByTargetId;
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  const loadCategoriesByParent = async (parentTarget: string) => {
    state.loading = true;
    state.error = null;
    try {
      const { data } = await fetchCategoriesByParentKey(apollo, parentTarget);
      return data.findCategoriesByParents as CategoriesByParentInterface[];
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  const create = async (category: CategoriesInterface) => {
    state.loading = true;
    state.error = null;
    try {
      if (ENABLE_SUGGESTED_VALIDATIONS) {
        validateCategoryPayload(category);
      }
      await createCategory(apollo, category, "publish");
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  const createDraft = async (category: CategoriesInterface) => {
    state.loading = true;
    state.error = null;
    try {
      if (ENABLE_SUGGESTED_VALIDATIONS) {
        validateCategoryPayload(category);
      }
      const data = await createCategory(apollo, category, "draft");
      return data;
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  const update = async (category: CategoriesInterface) => {
    state.loading = true;
    state.error = null;
    try {
      if (ENABLE_SUGGESTED_VALIDATIONS) {
        validateCategoryPayload(category);
      }
      await updateCategory(apollo, category, "publish");
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  const updateDraft = async (category: CategoriesInterface) => {
    state.loading = true;
    state.error = null;
    try {
      if (ENABLE_SUGGESTED_VALIDATIONS) {
        validateCategoryPayload(category);
      }
      const data = await updateCategory(apollo, category, "draft");
      return data;
    } catch (err) {
      state.error = err;
      throw err;
    } finally {
      state.loading = false;
    }
  };

  return {
    state,
    loadCategories,
    loadCategoriesByTargetId,
    loadCategoriesByParent,
    loadCategory,
    create,
    createDraft,
    update,
    updateDraft,
  };
};
