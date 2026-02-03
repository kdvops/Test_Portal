import { gql } from "graphql-tag";

export const CREATE_PRODUCTS_POST = gql`
  mutation CreateProductsPost($createPostDto: CreatePostDto!) {
    createPost(CreatePostDto: $createPostDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_PRODUCTS_POST = gql`
  mutation UpdateProductsPost($updatePostDto: UpdatePostDto!) {
    updatePost(UpdatePostDto: $updatePostDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_PRODUCTS_POST = gql`
  mutation CloneProductsPost($postId: String!) {
    clonePost(PostID: $postId) {
      _id
      createdAt
    }
  }
`;

export const REMOVE_PRODUCTS_POST = gql`
  mutation RemoveProductsPost($postId: String!) {
    removePost(PostID: $postId) {
      _id
      deletedAt
    }
  }
`;

export const PUBLISH_PRODUCTS_POST = gql`
  mutation PublishProductsPost($postId: String!) {
    publishPost(PostID: $postId) {
      _id
      status
      updatedAt
    }
  }
`;

export const DRAFT_PRODUCTS_POST = gql`
  mutation DraftProductsPost($postId: String!) {
    draftPost(PostID: $postId) {
      _id
      status
      updatedAt
    }
  }
`;
