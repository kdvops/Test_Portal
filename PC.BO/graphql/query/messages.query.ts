import { gql } from "graphql-tag";

export const DOWNLOAD_MESSAGES_FORM = gql`
  query FindMessagesAndDownloadFile($argsMessages: ArgsMessages!) {
    findMessagesAndDownloadFile(ArgsMessages: $argsMessages) {
      _id
      createdAt
      deletedAt
      form {
        _id
        banner
        createdAt
        deletedAt
        description
        disabled
        crm {
          isFormCrm
          url
        }
        inputs {
          _id
          id
          value
          hidden
          radios
          placeholder
          name
          label
          icon
          checkbox
          selects
          type
        }
        termsAndCondition {
          enabled
          accept
          text
        }
        updatedAt
        subtitle
        title
      }
      values {
        name
        inputID
        valueInput
        valuesInput
        type
      }
      updatedAt
    }
  }
`;

export const GET_MESSAGES_FORMS = gql`
  query FindMessages($argsMessages: ArgsMessages!) {
    findMessages(ArgsMessages: $argsMessages) {
      _id
      createdAt
      deletedAt
      form {
        _id
        title
        crm {
          isFormCrm
          url
        }
        inputs {
          _id
          id
          value
          hidden
          name
          type
          radios
          checkbox
          selects
        }
      }
      values {
        name
        type
        inputID
        valueInput
        valuesInput
      }
    }
  }
`;
