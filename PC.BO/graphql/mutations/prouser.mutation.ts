import { gql } from "graphql-tag";

export const CREATE_PROUSER_POST = gql`
  mutation CreateProuser($createProuserDto: CreateProuserDto!) {
    createProuser(CreateProuserDto: $createProuserDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_PROUSER_POST = gql`
  mutation UpdateProuser($updateProuserDto: UpdateProuserDto!) {
    updateProuser(UpdateProuserDto: $updateProuserDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_PROUSER_POST = gql`
  mutation CloneProuser($prouserId: String!) {
  cloneProuser(ProuserID: $prouserId) {
    deletedAt
  }
}
`;

export const REMOVE_PROUSER_POST = gql`
  mutation RemoveProuser($prouserId: String!) {
    removeProuser(ProuserID: $prouserId) {
      _id
      deletedAt
    }
  }
`;

export const PUBLISH_PROUSER_POST = gql`
  mutation PublishProuser($prouserId: String!) {
    publishProuser(ProuserID: $prouserId) {
      updatedAt
    }
  }
`;

export const DRAFT_PROUSER_POST = gql`
  mutation DraftProuser($prouserId: String!) {
    draftProuser(ProuserID: $prouserId) {
      updatedAt
    }
  }
`;