import { gql } from "graphql-tag";

export const CREATE_TARGET_POST = gql`
  mutation CreatePost($createPostDto: CreatePostDto!) {
    createPost(CreatePostDto: $createPostDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_TARGET_POST = gql`
  mutation UpdatePost($updatePostDto: UpdatePostDto!) {
    updatePost(UpdatePostDto: $updatePostDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_TARGET_POST = gql`
  mutation ClonePost($postId: String!) {
    clonePost(PostID: $postId) {
      _id
      createdAt
    }
  }
`;

export const REMOVE_TARGET_POST = gql`
  mutation RemovePost($postId: String!) {
    removePost(PostID: $postId) {
      _id
      deletedAt
    }
  }
`;

export const PUBLISH_TARGET_POST = gql`
  mutation PublishPost($postId: String!) {
    publishPost(PostID: $postId) {
      _id
      status
      updatedAt
    }
  }
`;

export const DRAFT_TARGET_POST = gql`
  mutation DraftPost($postId: String!) {
    draftPost(PostID: $postId) {
      _id
      status
      updatedAt
    }
  }
`;
