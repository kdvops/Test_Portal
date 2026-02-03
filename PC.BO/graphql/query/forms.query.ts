import { gql } from "graphql-tag";

export const GET_FORMS_BSC = gql`
  query FindForms {
    findForms {
      _id
      title
      slug
      subtitle
      description
      banner
      bannerImageDetail{
        _id
        image
        altText
      }
      disabled
      status
      crm {
        isFormCrm
        url
      }
      termsAndCondition {
        accept
        enabled
        text
      }
      inputs {
        _id
        id
        name
        label
        icon
        placeholder
        radios
        checkbox
        selects
        type
        value
        hidden
      }
    }
  }
`;

export const GET_FORM_BSC_BY_ID = gql`
  query FindFormsById($formsId: String!) {
    findFormsById(FormsID: $formsId) {
      _id
      title
      slug
      subtitle
      description
      banner
      bannerImageDetail{
        _id
        image
        altText
      }
      disabled
      status
      crm {
        isFormCrm
        url
      }
      termsAndCondition {
        accept
        enabled
        text
      }
      inputs {
        _id
        id
        name
        label
        icon
        placeholder
        radios
        checkbox
        selects
        type
        value
        hidden
      }
    }
  }
`;
