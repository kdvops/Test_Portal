import { gql } from 'graphql-tag'

export const GET_ADJUDICATED_BY_GROUP_CATEGORY = gql`
 query FindAdjudicatedProductsGroupByCategory {
  findAdjudicatedProductsGroupByCategory(FindAll: true) {
    category {
      _id
      name
      pictures {
        thumbnail
      }
    }
    products {
      _id
      name
      price
      status
      item_status
      pictures {
        _id
        image
        isCover
      }
      picturesImageDetail {
        _id
        image
        altText
        isCover
      }
    }
  }
}

`
export const GET_PRODUCT_ADJUDICATED_BY_ID = gql`
 query FindAdjudicatedById($adjudicatedId: String!) {
  findAdjudicatedById(AdjudicatedID: $adjudicatedId) {
    _id
    address
    category
    description
    disabled
    excerpt
    province
    name
    link
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
    item_status
  }
}
`

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
