export const CREATE_COINS = gql`
  mutation CreateCoin($createCoinDto: CreateCoinDto!) {
    createCoin(CreateCoinDto: $createCoinDto) {
      createdAt
    }
  }
`;

export const UPDATE_COINS = gql`
  mutation UpdateCoin($updateCoinDto: UpdateCoinDto!) {
    updateCoin(UpdateCoinDto: $updateCoinDto) {
      updatedAt
    }
  }
`;

export const REMOVE_COINS = gql`
  mutation RemoveCoin($coinId: String!) {
    removeCoin(CoinID: $coinId) {
      deletedAt
    }
  }
`;
