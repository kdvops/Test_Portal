import type {
  CategoriesByParentInterface,
  CategoriesInterface,
} from "~/interfaces/categories.interface";

export type CategoryState = {
  categories: CategoriesInterface[];
  category: CategoriesInterface | null;
  loading: boolean;
  error: unknown | null;
};

export type CategoryStorePort = {
  state: CategoryState;
  loadCategories(target: string): Promise<void>;
  loadCategoriesByTargetId(targetId: string): Promise<void>;
  loadCategoriesByParent(
    parentTarget: string
  ): Promise<CategoriesByParentInterface[]>;
  loadCategory(categoryId: string): Promise<void>;
  create(category: CategoriesInterface): Promise<void>;
  createDraft(category: CategoriesInterface): Promise<{ data: any }>;
  update(category: CategoriesInterface): Promise<void>;
  updateDraft(category: CategoriesInterface): Promise<{ data: any }>;
};
