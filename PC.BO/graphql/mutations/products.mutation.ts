import { gql } from "graphql-tag";

export const CREATE_PRODUCT = gql`
  mutation CreateProduct($createProductDto: CreateProductDto!) {
    createProduct(CreateProductDto: $createProductDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($updateProductDto: UpdateProductDto!) {
    updateProduct(UpdateProductDto: $updateProductDto) {
      _id
      createdAt
    }
  }
`;

export const CLONE_PRODUCT = gql`
  mutation CloneProduct($productId: String!) {
    cloneProduct(ProductID: $productId) {
      createdAt
    }
  }
`;

export const REMOVE_PRODUCT = gql`
  mutation RemoveProduct($productId: String!) {
    removeProduct(ProductID: $productId) {
      deletedAt
    }
  }
`;


export const PUBLISH_PRODUCT = gql`
  mutation PublishProduct($productId: String!) {
    publishProduct(ProductID: $productId) {
      updatedAt
    }
  }
`;

export const DRAFT_PRODUCT = gql`
  mutation DraftProduct($productId: String!) {
    draftProduct(ProductID: $productId) {
      updatedAt
    }
  }
`;
