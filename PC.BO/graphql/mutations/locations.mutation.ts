export const CREATE_LOCATIONS = gql`
  mutation CreateLocation($createLocationDto: CreateLocationDto!) {
    createLocation(CreateLocationDto: $createLocationDto) {
      createdAt
    }
  }
`;

export const UPDATE_LOCATIONS = gql`
  mutation UpdateLocation($updateLocationDto: UpdateLocationDto!) {
    updateLocation(UpdateLocationDto: $updateLocationDto) {
      updatedAt
    }
  }
`;

export const REMOVE_LOCATIONS = gql`
  mutation RemoveLocation($locationId: String!) {
    removeLocation(LocationID: $locationId) {
      deletedAt
    }
  }
`;
