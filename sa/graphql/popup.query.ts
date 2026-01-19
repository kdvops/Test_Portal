export const GET_POPUP_ACTIVE = gql`
  query FindPopupByActive {
    findPopupByActive {
      _id
      title
      subtitle
      description
      excerpt
      color
      image
      background
      orientation
      active
      link
      button {
        background
        color
        text
      }
    }
  }
`;
