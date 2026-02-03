import { gql } from "graphql-tag";

export const CREATE_ENTERPRISE = gql`
  mutation CreateEnterprise($createEnterpriseDto: CreateEnterpriseDto!) {
    createEnterprise(CreateEnterpriseDto: $createEnterpriseDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_ENTERPRISE = gql`
  mutation UpdateEnterprise($updateEnterpriseDto: UpdateEnterpriseDto!) {
    updateEnterprise(UpdateEnterpriseDto: $updateEnterpriseDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_ENTERPRISE = gql`
  mutation CloneEnterprise($enterpriseId: String!) {
    cloneEnterprise(EnterpriseID: $enterpriseId) {
      deletedAt
    }
  }
`;

export const REMOVE_ENTERPRISE = gql`
  mutation RemoveEnterprise($enterpriseId: String!) {
    removeEnterprise(EnterpriseID: $enterpriseId) {
      _id
      deletedAt
    }
  }
`;


export const PUBLISH_ENTERPRISE = gql`
  mutation PublishEnterprise($enterpriseId: String!) {
    publishEnterprise(EnterpriseID: $enterpriseId) {
      updatedAt
    }
  }
`;

export const DRAFT_ENTERPRISE = gql`
  mutation DraftEnterprise($enterpriseId: String!) {
    draftEnterprise(EnterpriseID: $enterpriseId) {
      updatedAt
    }
  }
`;
