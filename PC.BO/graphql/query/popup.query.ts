import { gql } from "graphql-tag";

export const GET_POPUPS = gql`
  query FindPopups {
    findPopups {
      _id
      title
      subtitle
      description
      excerpt
      color
      image
      background
      orientation
      active
      link
      button {
        background
        color
        text
      }
    }
  }
`;
