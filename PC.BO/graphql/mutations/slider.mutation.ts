import { gql } from "graphql-tag";

export const CREATE_SLIDER = gql`
  mutation CreateSlider($createSliderDto: CreateSliderDto!) {
    createSlider(CreateSliderDto: $createSliderDto) {
      createdAt
    }
  }
`;

export const UPDATE_SLIDER = gql`
  mutation UpdateSlider($updateSliderDto: UpdateSlider!) {
    updateSlider(UpdateSlider: $updateSliderDto) {
      createdAt
    }
  }
`;

export const REMOVE_SLIDER = gql`
  mutation RemoveSlider($sliderId: String!) {
    removeSlider(sliderID: $sliderId) {
      deletedAt
    }
  }
`;

export const UPDATE_SLIDERS_POSITIONS = gql`
  mutation UpdateSlidersPositions(
    $updatePositionsSliderDto: UpdatePositionsSliderDto!
  ) {
    updateSlidersPositions(
      UpdatePositionsSliderDto: $updatePositionsSliderDto
    ) {
      _id
      position
      updatedAt
    }
  }
`;
