import { gql } from "graphql-tag";

export const GET_PROMOTIONS_BY_DATE = gql`
  query FindPromotionByDate($paramsByDate: ParamsByDate!) {
    findPromotionByDate(ParamsByDate: $paramsByDate) {
      _id
      name
      percent
      devolution
      condition
      extract
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
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
