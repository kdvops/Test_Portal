import { gql } from "graphql-tag";
export const CREATE_CATEGORY = gql`
  mutation CreateCategory($createCategoryDto: CreateCategoryDto!) {
    createCategory(CreateCategoryDto: $createCategoryDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategories($updateCategoryDto: UpdateCategoryDto!) {
    updateCategories(UpdateCategoryDto: $updateCategoryDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_CATEGORY = gql`
  mutation CloneCategories($categoryId: String!) {
    cloneCategories(CategoryID: $categoryId) {
      createdAt
    }
  }
`;

export const PUBLISH_CATEGORY = gql`
  mutation PublishCategory($categoryId: String!) {
    publishCategory(CategoryID: $categoryId) {
      updatedAt
    }
  }
`;

export const DRAFT_CATEGORY = gql`
  mutation DraftCategory($categoryId: String!) {
    draftCategory(CategoryID: $categoryId) {
      updatedAt
    }
  }
`;

export const REMOVE_CATEGORY = gql`
  mutation RemoveCategory($categoryId: String!) {
    removeCategory(CategoryID: $categoryId) {
      deletedAt
    }
  }
`;
