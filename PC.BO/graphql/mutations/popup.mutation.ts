export const CREATE_POPUP = gql`
  mutation CreatePopup($createPopupDto: CreatePopupDto!) {
    createPopup(CreatePopupDto: $createPopupDto) {
      createdAt
    }
  }
`;

export const UPDATE_POPUP = gql`
  mutation UpdatePopup($updatePopupDto: UpdatePopupDto!) {
    updatePopup(UpdatePopupDto: $updatePopupDto) {
      updatedAt
    }
  }
`;

export const ACTIVE_POPUP = gql`
  mutation ActivePopup($popupId: String!) {
    activePopup(popupID: $popupId) {
      updatedAt
    }
  }
`;

export const REMOVE_POPUP = gql`
  mutation RemovePopup($popupId: String!) {
    removePopup(popupID: $popupId) {
      deletedAt
    }
  }
`;
