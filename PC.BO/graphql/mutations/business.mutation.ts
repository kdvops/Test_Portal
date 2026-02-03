import { gql } from "graphql-tag";

export const CREATE_BUSINESS = gql`
  mutation CreateBusiness($createBusinessDto: CreateBusinessDto!) {
    createBusiness(CreateBusinessDto: $createBusinessDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_BUSINESS = gql`
  mutation UpdateBusiness($updateBusinessDto: UpdateBusinessDto!) {
    updateBusiness(UpdateBusinessDto: $updateBusinessDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_BUSINESS = gql`
  mutation CloneBusiness($businessId: String!) {
    cloneBusiness(BusinessID: $businessId) {
      deletedAt
    }
  }
`;

export const REMOVE_BUSINESS = gql`
  mutation RemoveBusiness($businessId: String!) {
    removeBusiness(BusinessID: $businessId) {
      _id
      deletedAt
    }
  }
`;

export const PUBLISH_BUSINESS = gql`
  mutation PublishBusiness($businessId: String!) {
    publishBusiness(BusinessID: $businessId) {
      updatedAt
    }
  }
`;

export const DRAFT_BUSINESS = gql`
  mutation DraftBusiness($businessId: String!) {
    draftBusiness(BusinessID: $businessId) {
      updatedAt
    }
  }
`;
