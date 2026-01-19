import gql from "graphql-tag";

export const GET_COINS = gql`
  query GetCoins {
    coins {
      _id
      createdAt
      deletedAt
      logo
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
