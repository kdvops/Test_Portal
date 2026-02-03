import { gql } from "graphql-tag";

export const GET_PROMOTIONS_BY_MONTH = gql`
query FindPromotionsByMonth($searchArgs: SearchArgs!) {
  findPromotionsByMonth(SearchArgs: $searchArgs, FindAll: true) {
    promotions {
      _id
      status
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
    }
    createdAt
  }
}
`;

export const GET_PROMOTION = gql`
  query FindPromotionById($promotionId: String!) {
    findPromotionById(promotionID: $promotionId) {
      _id
      status
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

export const GET_PROMOTION_BY_DATE = gql`
  query FindPromotionByDate($target: String!) {
    findPromotionByDate(target: $target, FindAll: true) {
      _id
      status
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


export const GET_PROMOTIONS_BY_DATE = gql`
  query FindPromotionByDate($paramsByDate: ParamsByDate!) {
    findPromotionByDate(ParamsByDate: $paramsByDate, FindAll: true) {
      _id
      status
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
