import type { CategoriesInterface } from "~/interfaces/categories.interface";
import type { CreateCategoryRules } from "~/interfaces/rules.interface";
import { toSlug } from "~/utils/stringUtils";

type ClearStrategy = "delete" | "null";

export const useCategoryForm = () => {
  const createDefaultCategory = (): CategoriesInterface => ({
    name: "",
    description: "",
    slug: "",
    pictures: {
      banner: "",
      thumbnail: "",
      responsive: "",
      bannerImageDetail: null,
      responsiveImageDetail: null,
      thumbnailImageDetail: null,
    },
    tags: [],
    excerpt: "",
    parentID: null,
    parentTarget: null,
    target: "",
    targetID: undefined,
    disabled: false,
  });

  const createRules = (): CreateCategoryRules => ({
    name: [(v: string) => !!v || "El nombre es requerido"],
    slug: [(v: string) => !!v || "El slug es requerido"],
    excerpt: [(v: string) => !!v || "El extracto es requerido"],
    description: [(v: string) => !!v || "La descripción es requerida"],
    tags: [(v: Array<string>) => !!v.length || "Los tags son requeridos"],
  });

  const validateTargetVsTargetID = (category: CategoriesInterface): boolean => {
    const target = (category.target || "").trim();
    const targetID = (category.targetID || "").trim();

    if (target && targetID) {
      throw new Error(
        "La categoría no puede tener targetID y target al mismo tiempo"
      );
    }
    if (!target && !targetID) {
      throw new Error(
        "La categoría debe tener un target (estático) o targetID (dinámico) definido"
      );
    }

    const isStatic = !!target;
    const isMongoId = /^[a-f\d]{24}$/i.test(targetID);
    if (!isStatic && targetID && !isMongoId) {
      throw new Error("El targetID debe ser un ID válido de MongoDB");
    }
    if (isStatic) {
      if (!target.startsWith("category") && !target.startsWith("category::")) {
        throw new Error(
          "El target debe ser uno de los valores válidos: category::..."
        );
      }
    }

    return isStatic;
  };

  const prepareCategoryForSave = (
    category: CategoriesInterface,
    isStatic: boolean,
    clearStrategy: ClearStrategy = "delete"
  ) => {
    const base: any = { ...category };

    if (isStatic) {
      if (clearStrategy === "delete") {
        delete base.targetID;
      } else {
        base.targetID = null;
      }
    } else if (clearStrategy === "delete") {
      delete base.target;
    } else {
      base.target = null;
    }

    return base;
  };


  const setParentCategorySelected = (
    selected: any,
    categories: Array<CategoriesInterface>,
    category: CategoriesInterface
  ): string | CategoriesInterface => {
    const findCategory = categories.find(
      (cat: any) => cat._id === selected[0]
    );

    if (selected.length > 0) {
      category.parentID = (findCategory as any)?._id || null;
      category.parentTarget = null;
      return findCategory || "";
    }

    category.parentID = null;
    category.parentTarget = "categoryGlobal";
    return "";
  };

  const updateSlug = (category: CategoriesInterface) => {
    category.slug = toSlug(category.name.toLowerCase());
  };

  return {
    createDefaultCategory,
    createRules,
    prepareCategoryForSave,
    setParentCategorySelected,
    updateSlug,
    validateTargetVsTargetID,
  };
};
