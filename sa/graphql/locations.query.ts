import { gql } from "@apollo/client/core";

export const GET_LOCATIONS = gql`
  query Query {
    locations {
      _id
      address
      city
      hours {
        day
        end
        start
      }
      label
      latitude
      longitude
      type
    }
  }
`;
