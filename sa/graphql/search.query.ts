import { gql } from "graphql-tag";

export const GET_SEARCH_BY_PARAMS = gql`
  query Search($search: String!) {
    search(Search: $search) {
      _id
      collection
      data
      text
    }
  }
`;
