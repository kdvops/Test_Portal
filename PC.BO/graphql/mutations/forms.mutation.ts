import { gql } from "graphql-tag";

export const CREATE_FORM_BSC = gql`
  mutation CreateForms($createFormsDto: CreateFormsDto!) {
    createForms(CreateFormsDto: $createFormsDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_FORM_BSC = gql`
  mutation UpdateForms($updateFormsDto: UpdateFormsDto!) {
    updateForms(UpdateFormsDto: $updateFormsDto) {
      _id
      updatedAt
    }
  }
`;

export const REMOVE_FORMS_BSC = gql`
   mutation RemoveForms($formsId: String!) {
    removeForms(FormsID: $formsId) {
      _id
      deletedAt
    }
  }
`;

export const CLONE_FORM = gql`
  mutation CloneForms($formsId: String!) {
    cloneForms(FormsID: $formsId) {
      createdAt
    }
  }
`;

export const PUBLISH_FORM = gql`
  mutation PublishForm($formId: String!) {
    publishForm(FormID: $formId) {
      updatedAt
    }
  }
`;

export const DRAFT_FORM = gql`
  mutation DraftForm($formId: String!) {
    draftForm(FormID: $formId) {
      updatedAt
    }
  }
`;