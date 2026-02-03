import { gql } from 'graphql-tag'

export const LOGIN_MUTATION = gql`
  mutation Login($loginDto: LoginDto!) {
    login(LoginDto: $loginDto) {
      token {
        access_token
        expired_in
        token_type
      }
    }
  }
`

export const LOGOUT_MUTATION = gql`
  mutation LogOutMutation {
    logOut
  }
`
