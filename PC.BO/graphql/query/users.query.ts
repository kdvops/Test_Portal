import { gql } from 'graphql-tag'

export const GET_USERS = gql`
  query Users($fetchUsersArgsDto: FetchUsersArgsDto!) {
  users(FetchUsersArgsDto: $fetchUsersArgsDto) {
    _id
    firstName
    lastName
    email
    displayName
    avatar
    country
    phone
    rate
    password
    roles
    createdAt
    updatedAt
    deletedAt
  }
}
`
export const GET_USER_BY_ID = gql`
  query FindUserById($userId: String!) {
    findUserById(userID: $userId) {
      _id
      firstName
      lastName
      email
      displayName
      avatar
      country
      phone
      rate
      roles
      createdAt
    }
  }
`
