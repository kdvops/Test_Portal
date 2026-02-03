import { gql } from "graphql-tag";

export const CREATE_PROMOTION = gql`
  mutation CreatePromotion($createPromotionDto: CreatePromotionDto!) {
    createPromotion(CreatePromotionDto: $createPromotionDto) {
      createdAt
    }
  }
`;

export const UPDATE_PROMOTIONS = gql`
  mutation UpdatePromotions($updatePromotionDto: UpdatePromotionDto!) {
    updatePromotions(UpdatePromotionDto: $updatePromotionDto) {
      createdAt
    }
  }
`;

export const UPDATE_PROMOTION = gql`
  mutation UpdatePromotion($updatePromotionDto: UpdatePromotionDto!) {
    updatePromotion(UpdatePromotionDto: $updatePromotionDto) {
      createdAt
    }
  }
`;

export const REMOVE_PROMOTIONS = gql`
  mutation RemovePromotions($removePromotionsDto: RemovePromotionsDto!) {
    removePromotions(RemovePromotionsDto: $removePromotionsDto) {
      deletedAt
    }
  }
`;

export const CLONE_PROMOTION = gql`
  mutation ClonePromotion($promotionId: String!) {
    clonePromotion(PromotionID: $promotionId) {
      createdAt
    }
  }
`;

export const REMOVE_PROMOTION = gql`
  mutation RemovePromotion($promotionId: String!) {
    removePromotion(PromotionID: $promotionId) {
      deletedAt
    }
  }
`;

export const PUBLISH_PROMOTION = gql`
  mutation PublishPromotion($promotionId: String!) {
    publishPromotion(PromotionID: $promotionId) {
      updatedAt
    }
  }
`;

export const DRAFT_PROMOTION = gql`
  mutation DraftPromotion($promotionId: String!) {
    draftPromotion(PromotionID: $promotionId) {
      updatedAt
    }
  }
`;