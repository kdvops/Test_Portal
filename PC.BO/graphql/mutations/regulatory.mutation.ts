import { gql } from "graphql-tag";

export const CREATE_REGULATORY = gql`
  mutation CreateRegulatory($createRegulatoryDto: CreateRegulatoryDto!) {
    createRegulatory(CreateRegulatoryDto: $createRegulatoryDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_REGULATORY = gql`
  mutation UpdateRegulatory($updateRegulatoryDto: UpdateRegulatoryDto!) {
    updateRegulatory(UpdateRegulatoryDto: $updateRegulatoryDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_REGULATORY = gql`
 mutation CloneRegulatory($regulatoryId: String!) {
  cloneRegulatory(RegulatoryID: $regulatoryId) {
    createdAt
  }
}
`

export const REMOVE_REGULATORY = gql`
  mutation RemoveRegulatory($regulatoryId: String!) {
    removeRegulatory(RegulatoryID: $regulatoryId) {
      _id
      deletedAt
    }
  }
`;

export const PUBLISH_REGULATORY = gql`
  mutation PublishRegulatory($regulatoryId: String!) {
    publishRegulatory(RegulatoryID: $regulatoryId) {
      updatedAt
    }
  }
`;

export const DRAFT_REGULATORY = gql`
  mutation DraftRegulatory($regulatoryId: String!) {
    draftRegulatory(RegulatoryID: $regulatoryId) {
      updatedAt
    }
  }
`;