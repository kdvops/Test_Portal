import { gql } from 'graphql-tag'

export const ME = gql`
  query Me {
    me {
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
    }
  }
`
