export const CREATE_MESSAGES_FORM = gql`
  mutation CreateMessages($createMessagesDto: CreateMessagesDto!) {
    createMessages(CreateMessagesDto: $createMessagesDto) {
      createdAt
    }
  }
`;
