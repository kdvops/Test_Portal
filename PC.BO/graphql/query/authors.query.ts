import { gql } from "graphql-tag";

export const GET_AUTHORS_BY_QUERY = gql`
  query FindAuthorsByName($name: String!) {
    findAuthorsByName(name: $name) {
      _id
      name
      position
      image {
        _id
        image
        altText
      }
    }
  }
`;
