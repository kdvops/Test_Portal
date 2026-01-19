export const GET_SHORTCUTS_BY_TARGET = gql`
  query FindShortcutsByTarget($target: String!) {
    findShortcutsByTarget(Target: $target) {
      _id
      background
      color
      icon
      name
      target
      type
      cards {
        _id
        align
        background
        icon
        picture
        pictureImageDetail{
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
        pictureImageDetail{
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
