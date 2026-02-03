import { gql } from "graphql-tag";

export const GET_SHORTCUTS = gql`
  query FindShortcuts {
    findShortcuts {
      _id
      icon
      name
      target
      targetID
    }
  }
`;

export const GET_SHORTCUTS_GROUP_BY_TARGET = gql`
  query FindShortcutsGroupByTarget {
    findShortcutsGroupByTarget {
      target
      shortcuts {
        _id
        icon
        name
        target
        targetID
      }
    }
  }
`;

export const GET_SHORTCUTS_BY_TARGET_ID = gql`
  query FindShortcutsByTargetId($targetId: String!) {
    findShortcutsByTargetId(targetId: $targetId) {
      _id
      background
      color
      icon
      name
      targetID
      type
      cards {
        _id
        align
        background
        icon
        picture
        pictureImageDetail {
          _id
          image
          altText
        }
        style
        button {
          background
          color
          enabled
          link
          text
        }
        description {
          color
          text
        }
        title {
          color
          text
        }
      }
    }
  }
`;


export const GET_SHORTCUTS_GROUP_BY_TARGET_ID = gql`
  query FindShortcutsByTargetId($targetId: String!) {
    findShortcutsByTargetId(targetID: $targetId) {
      targetID
      shortcuts {
        _id
        icon
        name
      }
    }
  }
`;

export const GET_SHORTCUT = gql`
  query FindShortcutById($shortcutId: String!) {
    findShortcutById(ShortcutID: $shortcutId) {
      _id
      background
      color
      icon
      name
      target
      type
      targetID
      cards {
        _id
        align
        background
        icon
        picture
        pictureImageDetail {
          _id
          image
          altText
        }
        style
        button {
          background
          color
          enabled
          link
          text
        }
        description {
          color
          text
        }
        title {
          color
          text
        }
      }
    }
  }
`;
