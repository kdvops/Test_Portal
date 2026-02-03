import { gql } from "graphql-tag";

export const GET_PRODUCTS_BY_PARENTS_CATEGORY = gql`
  query FindProductsByParentTargetCategory($parentTarget: String!) {
    findProductsByParentTargetCategory(ParentTarget: $parentTarget, FindAll: true) {
      _id
      status
      name
      description
      slug
      banner
      responsive
      thumbnail
      bannerImageDetail{
        _id
        image
        altText
      }
      responsiveImageDetail{
        _id
        image
        altText
      }
      thumbnailImageDetail{
        _id
        image
        altText
      }
      category {
        _id
        name
        parentTarget
      }
      sections {
        _id
        name
        description
        position
        type
        style
        color
        video
        text
        table {
          headers
          columns {
            name
            value
          }
        }
        image {
          _id
          url
        }
        imageDetail {
          _id
          image
          altText
        }
        cards {
          name
          picture
          pictureImageDetail {
            _id
            image
            altText
          }
        }
        attachments {
          name
          file
        }
        banner {
          picture
          pictureImageDetail {
            _id
            image
            altText
          }
        }
         grids{
          _id
          columns
          rows
          style
          rowHeight
          color
          border
          breakLine
          layouts{
            _id
            i
            x
            y
            w
            h
            type
            image
            button{
              href
              text
              color
              icon
              picture
            }
            text{
              text
              color
            }
            style
            list
         }
        }
        gallery{
          items{
            _id
            image
            icon
            imageDetail {
              _id
              image
              altText
            }
            iconImageDetail {
              _id
              image
              altText
            }
            title
            video
          }
        }
        accordion{
          items{
            _id
            title
            content
          }
        }
      }
    }
  }
`;

export const GET_PRODUCT_BY_ID = gql`
  query FindProductById($productId: String!) {
    findProductById(ProductID: $productId) {
      _id
      status
      name
      description
      slug
      banner
      responsive
      thumbnail
      bannerImageDetail{
        _id
        image
        altText
      }
      responsiveImageDetail{
        _id
        image
        altText
      }
      thumbnailImageDetail{
        _id
        image
        altText
      }
      category {
        _id
        name
        parentTarget
      }
      sections {
        _id
        name
        description
        position
        type
        style
        color
        video
        text
        table {
          headers
          columns {
            name
            value
          }
        }
        image {
          _id
          url
        }
        imageDetail {
          _id
          image
          altText
        }
        cards {
          _id
          name
          description
          picture
          pictureImageDetail {
            _id
            image
            altText
          }
        }
        attachments {
          _id
          name
          description
          file
        }
        banner {
          _id
          picture
          pictureImageDetail {
            _id
            image
            altText
          }
          background
          title {
            text
            color
          }
          description {
            text
            color
          }
          button {
            text
            color
            background
            link
            enabled
          }
        }
         grids{
          _id
          columns
          rows
          style
          rowHeight
          color
          border
          breakLine
          layouts{
            _id
            i
            x
            y
            w
            h
            type
            image
            button{
              href
              text
              color
              icon
              picture
            }
            text{
              text
              color
            }
            style
            list
         }
        }
        gallery{
          items{
            _id
            image
            icon
            imageDetail {
              _id
              image
              altText
            }
            iconImageDetail {
              _id
              image
              altText
            }
            title
            video
          }
        }
        accordion{
          items{
            _id
            title
            content
          }
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY_ID = gql`
  query FindProductsByCategory($categoryId: String!) {
    findProductsByCategory(CategoryID: $categoryId) {
      _id
      status
      name
      slug
      description
      banner
      responsive
      thumbnail
      bannerImageDetail{
        _id
        image
        altText
      }
      responsiveImageDetail{
        _id
        image
        altText
      }
      thumbnailImageDetail{
        _id
        image
        altText
      }
      category
      sections
    }
  }
`;