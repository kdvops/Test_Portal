import { gql } from 'graphql-tag'

export const UPDATE_USER = gql`
  mutation UpdateUser($updateUserDto: UpdateUserDto!) {
    updateUser(UpdateUserDto: $updateUserDto) {
      _id
      firstName
      lastName
      email
      displayName
      banner
      avatar
      country
      phone
      rate
      roles
      createdAt
    }
  }
`
