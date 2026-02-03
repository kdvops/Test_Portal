import type { CategoriesInterface } from "~/interfaces/categories.interface";

/**
 * Suggested validations (NOT wired into runtime).
 * Use these only if you want stricter saves in the future.
 */

const isNonEmptyString = (value?: string | null) =>
  typeof value === "string" && value.trim().length > 0;

const assertNonEmpty = (value: string | undefined, message: string) => {
  if (!isNonEmptyString(value)) {
    throw new Error(message);
  }
};

const assertTags = (tags?: string[]) => {
  if (!Array.isArray(tags) || tags.length === 0) {
    throw new Error("Los tags son requeridos");
  }
  const hasInvalid = tags.some((tag) => !isNonEmptyString(tag));
  if (hasInvalid) {
    throw new Error("Los tags deben contener valores válidos");
  }
};

const assertPicturesShape = (category: CategoriesInterface) => {
  if (!category.pictures) {
    throw new Error("Las imágenes son requeridas");
  }

  const hasLegacyUrls =
    typeof category.pictures.banner === "string" &&
    typeof category.pictures.thumbnail === "string" &&
    typeof category.pictures.responsive === "string";

  const hasImageDetails =
    !!category.pictures.bannerImageDetail ||
    !!category.pictures.thumbnailImageDetail ||
    !!category.pictures.responsiveImageDetail;

  if (!hasLegacyUrls && !hasImageDetails) {
    throw new TypeError("Al menos una imagen es requerida");
  }
};

export const validateCategoryPayload = (category: CategoriesInterface) => {
  assertNonEmpty(category.name, "El nombre es requerido");
  assertNonEmpty(category.slug, "El slug es requerido");
  assertNonEmpty(category.excerpt, "El extracto es requerido");
  assertNonEmpty(category.description, "La descripción es requerida");
  assertTags(category.tags);
  assertPicturesShape(category);
};
