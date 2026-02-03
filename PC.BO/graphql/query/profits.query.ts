import { gql } from "graphql-tag";

export const GET_PROFITS_BY_CATEGORY = gql`
  query ProfitsGroupByCategory($categoryId: String!) {
    findProfitsByCategory(categoryID: $categoryId, FindAll: true) {
      _id
      status
      name
      color
      percent
      devolution
      condition
      category
      disabled
      picture
      pictureImageDetail{
        _id
        image
        altText
      }
      description {
        text
        enabled
      }
      date {
        start
        end
      }
    }
  }
`;

export const GET_PROFITS_GROUP_BY_CATEGORY = gql`
  query ProfitsGroupByCategory {
    profitsGroupByCategory(FindAll: true) {
      category {
        _id
        name
        pictures {
          thumbnail
        }
      }
      profits {
        _id
        status
        name
        color
        percent
        devolution
        condition
        disabled
        picture
        pictureImageDetail{
          _id
          image
          altText
        }
        date {
          start
          end
        }
      }
    }
  }
`;
