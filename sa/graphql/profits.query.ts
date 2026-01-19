import { gql } from "graphql-tag";

export const GET_PROFITS_BY_CATEGORY = gql`
  query FindProfitsByCategory($categoryId: String!) {
    findProfitsByCategory(categoryID: $categoryId) {
      _id
      category
      color
      condition
      createdAt
      date {
        end
        start
      }
      deletedAt
      description {
        text
        enabled
      }
      devolution
      disabled
      name
      percent
      picture
      pictureImageDetail{
        _id
        image
        altText
      }
      updatedAt
    }
  }
`;
