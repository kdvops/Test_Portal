import { gql } from 'graphql-tag'

export const CREATE_PRODUCT_ADJUDICATED = gql`
  mutation CreateAdjudicated($createAdjudicatedDto: CreateAdjudicatedDto!) {
  createAdjudicated(CreateAdjudicatedDto: $createAdjudicatedDto) {
    _id
    category
    createdAt
  }
}
`

export const UPDATE_PRODUCT_ADJUDICATED = gql`
 mutation UpdateAdjudicated($updateAdjudicatedDto: UpdateAdjudicatedDto!) {
  updateAdjudicated(UpdateAdjudicatedDto: $updateAdjudicatedDto) {
    _id
    category
    updatedAt
  }
}
`

export const CLONE_PRODUCT_ADJUDICATED = gql`
 mutation CloneAdjudicated($adjudicatedId: String!) {
  cloneAdjudicated(AdjudicatedID: $adjudicatedId) {
    createdAt
  }
}
`

export const REMOVE_PRODUCT_ADJUDICATED = gql`
 mutation RemoveAdjudicated($adjudicatedId: String!) {
  removeAdjudicated(AdjudicatedID: $adjudicatedId) {
    _id
    category
    deletedAt
  }
}
`

export const PUBLISH_ADJUDICATED = gql`
  mutation PublishAdjudicated($adjudicatedId: String!) {
    publishAdjudicated(AdjudicatedID: $adjudicatedId) {
      updatedAt
    }
  }
`;

export const DRAFT_ADJUDICATED = gql`
  mutation DraftAdjudicated($adjudicatedId: String!) {
    draftAdjudicated(AdjudicatedID: $adjudicatedId) {
      updatedAt
    }
  }
`;
