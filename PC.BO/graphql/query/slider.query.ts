import { gql } from "graphql-tag";

export const GET_SLIDERS = gql`
  query Sliders {
    sliders {
      _id
      target
      targetID
      position
      picture
      responsive
      pictureImageDetail {
        _id
        image
        altText
        }
      responsiveImageDetail {
        _id
        image
        altText
      }
      disabled
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

export const GET_SLIDER = gql`
  query FindSliderById($sliderId: String!) {
    findSliderById(sliderID: $sliderId) {
      _id
      title {
        text
        align
        size
        color
        weight
      }
      subtitle {
        text
        align
        size
        color
        weight
      }
      description {
        text
        align
        size
        color
        weight
      }
      button {
        enabled
        link
        text
        align
        color
        weight
        background
      }
      path
      picture
      responsive
      pictureImageDetail {
        _id
        image
        altText
      }
      responsiveImageDetail {
        _id
        image
        altText
      }
      disabled
      target
      targetID
      position
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
export const GET_SLIDERS_BY_TARGET = gql`
  query FindSliderByTarget($target: String!) {
    findSliderByTarget(target: $target) {
      _id
      title {
        text
        align
        size
        color
        weight
      }
      subtitle {
        text
        align
        size
        color
        weight
      }
      description {
        text
        align
        size
        color
        weight
      }
      button {
        enabled
        link
        text
        align
        color
        weight
        background
      }
      path
      picture
      responsive
      pictureImageDetail {
        _id
        image
        altText
      }
      responsiveImageDetail {
        _id
        image
        altText
      }
      disabled
      target
      targetID
      position
      createdAt
      updatedAt
      deletedAt
    }
  }
`;

// QUERY FOR DYNAMIC TARGET SLIDERS
export const GET_SLIDERS_BY_TARGET_ID = gql`
  query FindSliderByTargetId($targetId: String!) {
    findSliderByTargetId(targetID: $targetId) {
      _id
      title {
        text
        align
        size
        color
        weight
      }
      subtitle {
        text
        align
        size
        color
        weight
      }
      description {
        text
        align
        size
        color
        weight
      }
      button {
        enabled
        link
        text
        align
        color
        weight
        background
      }
      path
      picture
      responsive
      pictureImageDetail {
        _id
        image
        altText
      }
      responsiveImageDetail {
        _id
        image
        altText
      }
      disabled
      target
      targetID
      position
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
