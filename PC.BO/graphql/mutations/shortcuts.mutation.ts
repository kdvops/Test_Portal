export const CREATE_SHORTCUT = gql`
  mutation CreateShortcuts($createShortcutsDto: CreateShortcutsDto!) {
    createShortcuts(CreateShortcutsDto: $createShortcutsDto) {
      createdAt
    }
  }
`;

export const UPDATE_SHORTCUT = gql`
  mutation UpdateShortcuts($updateShortcutsDto: UpdateShortcutsDto!) {
    updateShortcuts(UpdateShortcutsDto: $updateShortcutsDto) {
      updatedAt
    }
  }
`;

export const REMOVE_SHORTCUT = gql`
  mutation RemoveShortcuts($shortcutsId: String!) {
    removeShortcuts(ShortcutsID: $shortcutsId) {
      deletedAt
    }
  }
`;
