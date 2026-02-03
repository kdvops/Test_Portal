import { gql } from "graphql-tag";

export const GET_COINS = gql`
  query Coins {
    coins {
      _id
      createdAt
      deletedAt
      logo
      logoImageDetail{
        _id
        image
        altText
      }
      name
      prefix
      price {
        buy
        sell
      }
      updatedAt
    }
  }
`;
