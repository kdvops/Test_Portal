import { gql } from "graphql-tag";

export const GET_SLIDERS_BY_TARGET = gql`
  query Query($target: String!) {
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
      target
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
      position
      picture
      pictureImageDetail {
        _id
        image
        altText
      }
      responsive
      disabled
      target
      targetID
      createdAt
      updatedAt
      deletedAt
    }
  }
`;
