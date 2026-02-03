import { gql } from "graphql-tag";

export const CREATE_PROFITS = gql`
  mutation CreateProfit($createProfitDto: CreateProfitDto!) {
    createProfit(CreateProfitDto: $createProfitDto) {
      createdAt
    }
  }
`;

export const UPDATE_PROFITS = gql`
  mutation UpdateProfits($updateProfitsDto: UpdateProfitsDto!) {
    updateProfits(UpdateProfitsDto: $updateProfitsDto) {
      createdAt
    }
  }
`;

export const CLONE_PROFITS = gql`
  mutation CloneProfits($profitId: String!) {
    cloneProfits(ProfitID: $profitId) {
      updatedAt
    }
  }
`;

export const REMOVE_PROFITS = gql`
  mutation RemoveProfits($profitId: String!) {
    removeProfits(ProfitID: $profitId) {
      updatedAt
    }
  }
`;

export const PUBLISH_PROFITS = gql`
  mutation PublishProfits($profitId: String!) {
    publishProfits(ProfitID: $profitId) {
      updatedAt
    }
  }
`;

export const DRAFT_PROFITS = gql`
  mutation DraftProfits($profitId: String!) {
    draftProfits(ProfitID: $profitId) {
      updatedAt
    }
  }
`;
