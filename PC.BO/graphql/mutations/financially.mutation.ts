import { gql } from "graphql-tag";

export const CREATE_FINANCIALLY = gql`
  mutation CreateFinancially($createFinanciallyDto: CreateFinanciallyDto!) {
    createFinancially(CreateFinanciallyDto: $createFinanciallyDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_FINANCIALLY = gql`
  mutation UpdateFinancially($updateFinanciallyDto: UpdateFinanciallyDto!) {
    updateFinancially(UpdateFinanciallyDto: $updateFinanciallyDto) {
      _id
      updatedAt
    }
  }
`;

export const REMOVE_FINANCIALLY = gql`
  mutation RemoveFinancially($financiallyId: String!) {
    removeFinancially(FinanciallyID: $financiallyId) {
      _id
      deletedAt
    }
  }
`;

export const TOGGLE_FINANCIALLY_PIN = gql`
  mutation ToggleFinanciallyPin($financiallyId: String!) {
    toggleFinanciallyPin(FinanciallyID: $financiallyId) {
      _id
      pinnedAt
    }
  }
`;

export const CLONE_FINANCIALLY = gql`
  mutation CloneFinancially($financiallyId: String!) {
    cloneFinancially(FinanciallyID: $financiallyId) {
      createdAt
    }
  }
`;

export const PUBLISH_FINANCIALLY = gql`
  mutation PublishFinancially($financiallyId: String!) {
    publishFinancially(FinanciallyID: $financiallyId) {
      updatedAt
    }
  }
`;

export const DRAFT_FINANCIALLY = gql`
  mutation DraftFinancially($financiallyId: String!) {
    draftFinancially(FinanciallyID: $financiallyId) {
      updatedAt
    }
  }
`;
