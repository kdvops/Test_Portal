import { gql } from 'graphql-tag'

export const GET_PRODUCTS_ADJUDICATED = gql`
 query FindAdjudicated($argsAdjudicated: ArgsAdjudicated!) {
  findAdjudicated(ArgsAdjudicated: $argsAdjudicated) {
    _id
    address
    category
    description
    disabled
    excerpt
    link
    province
    name
    phone
    pictures {
      isCover
      image
      _id
    }
    picturesImageDetail {
      _id
      image
      altText
      isCover
    }
    price
    status
  }
}
`
