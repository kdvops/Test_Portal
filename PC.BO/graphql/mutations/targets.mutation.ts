import { gql } from 'graphql-tag';

export const CREATE_TARGET = gql`
  mutation CreateTarget($createTargetDto: CreateTargetDto!) {
    createTarget(CreateTargetDto: $createTargetDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_TARGET = gql`
  mutation UpdateTarget($updateTargetDto: UpdateTargetDto!) {
    updateTarget(UpdateTargetDto: $updateTargetDto) {
      _id
      updatedAt
    }
  }
`;

export const ENABLE_TARGET = gql` 
  mutation PublishTarget($targetId: String!) {
    publishTarget(TargetID: $targetId) {
      updatedAt
    }
  }
`;

export const DISABLE_TARGET = gql`
  mutation DraftTarget($targetId: String!) {
    draftTarget(TargetID: $targetId) {
      updatedAt
    }
  }
`;
