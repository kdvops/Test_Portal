import { CREATE_CATEGORY, UPDATE_CATEGORY } from "~/graphql/mutations/categories.mutation";
import {
  GET_CATEGORIES_BY_PARENT_KEY,
  GET_CATEGORIES_BY_TARGET,
  GET_CATEGORIES_BY_TARGET_ID,
  GET_CATEGORY_BY_ID,
} from "~/graphql/query/categories.query";
import { GET_TARGET_BY_ID } from "~/graphql/query/targets.query";
import { mapToCreateCategoryDto, mapToUpdateCategoryDto } from "~/interfaceMap/categories.dto.mapping";
import type { CategoriesInterface } from "~/interfaces/categories.interface";

type CategoryStatus = "publish" | "draft";

export const createCategory = async (
  apollo: any,
  category: CategoriesInterface,
  status: CategoryStatus
) =>
  apollo.mutate({
    mutation: CREATE_CATEGORY,
    variables: {
      createCategoryDto: mapToCreateCategoryDto({ ...category, status }),
    },
  });

export const updateCategory = async (
  apollo: any,
  category: CategoriesInterface,
  status: CategoryStatus
) =>
  apollo.mutate({
    mutation: UPDATE_CATEGORY,
    variables: {
      updateCategoryDto: mapToUpdateCategoryDto({ ...category, status }),
    },
  });

export const fetchCategoryById = async (apollo: any, categoryId: string) =>
  apollo.query({
    query: GET_CATEGORY_BY_ID,
    variables: {
      categoryId,
    },
    fetchPolicy: "no-cache",
  });

export const fetchCategoriesByTarget = async (apollo: any, target: string) =>
  apollo.query({
    query: GET_CATEGORIES_BY_TARGET,
    variables: {
      target,
    },
    fetchPolicy: "no-cache",
  });

export const fetchCategoriesByTargetId = async (
  apollo: any,
  targetId: string
) =>
  apollo.query({
    query: GET_CATEGORIES_BY_TARGET_ID,
    variables: {
      targetId,
    },
    fetchPolicy: "no-cache",
  });

export const fetchCategoriesByParentKey = async (
  apollo: any,
  parentTarget: string
) =>
  apollo.query({
    query: GET_CATEGORIES_BY_PARENT_KEY,
    variables: {
      parentTarget,
    },
    fetchPolicy: "no-cache",
  });

export const fetchTargetById = async (apollo: any, targetId: string) =>
  apollo.query({
    query: GET_TARGET_BY_ID,
    variables: {
      targetId,
    },
    fetchPolicy: "no-cache",
  });
