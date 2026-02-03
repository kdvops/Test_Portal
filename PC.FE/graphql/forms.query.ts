export const GET_FORM_BSC_BY_ID = gql`
  query FindFormsById($formsId: String!) {
    findFormsById(FormsID: $formsId) {
      _id
      title
      subtitle
      description
      banner
      bannerImageDetail {
        _id
        image
        altText
      }
      disabled
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

export const GET_FORM_BSC_BY_SLUG = gql`
  query FindFormsBySlug($slug: String!) {
    findFormsBySlug(Slug: $slug) {
      _id
      title
      subtitle
      description
      banner
      bannerImageDetail {
        _id
        image
        altText
      }
      disabled
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
