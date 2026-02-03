import { gql } from "graphql-tag";

export const CREATE_INSURANCE = gql`
  mutation CreateInsurance($createInsuranceDto: CreateInsuranceDto!) {
    createInsurance(CreateInsuranceDto: $createInsuranceDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_INSURANCE = gql`
  mutation UpdateInsurance($updateInsuranceDto: UpdateInsuranceDto!) {
    updateInsurance(UpdateInsuranceDto: $updateInsuranceDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_INSURANCE = gql`
  mutation CloneInsurance($insuranceId: String!) {
  cloneInsurance(InsuranceID: $insuranceId) {
      deletedAt
    }
  }
`;

export const REMOVE_INSURANCE = gql`
  mutation RemoveInsurance($insuranceId: String!) {
    removeInsurance(InsuranceID: $insuranceId) {
      _id
      deletedAt
    }
  }
`;

export const PUBLISH_INSURANCE = gql`
  mutation PublishInsurance($insuranceId: String!) {
    publishInsurance(InsuranceID: $insuranceId) {
      updatedAt
    }
  }
`;

export const DRAFT_INSURANCE = gql`
  mutation DraftInsurance($insuranceId: String!) {
    draftInsurance(InsuranceID: $insuranceId) {
      updatedAt
    }
  }
`;
