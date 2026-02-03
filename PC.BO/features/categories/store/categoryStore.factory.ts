import type { CategoryStorePort } from "./categoryStore.port";
import { createLocalCategoryStore } from "./categoryStore.local";

export const useCategoryStore = (apollo: any): CategoryStorePort => {
  return createLocalCategoryStore(apollo);
};
