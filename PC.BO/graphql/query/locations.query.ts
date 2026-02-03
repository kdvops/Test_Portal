import { gql } from "graphql-tag";

export const GET_LOCATIONS = gql`
  query Locations {
    locations {
      _id
      address
      city
      hours {
        day
        start
        end
      }
      label
      latitude
      longitude
      type
    }
  }
`;
