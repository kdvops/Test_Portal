import { gql } from "graphql-tag";

export const GET_PRODUCTS_POSTS = gql`
  query FindProductsPosts($targetId: String!) {
    findTargetPosts(targetId: $targetId, FindAll: true) {
      _id
      title
      slug
      subtitle
      link
      excerpt
      description
      banner
      responsive
      thumbnail
      status
      disabled
      category {
        _id
        name
        slug
      }
      target {
        _id
        name
        slug
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCTS_POST_GROUP_BY_CATEGORY = gql`
  query FindProductsPostsGroupByCategory($targetId: String!) {
    findPostsGroupByCategory(TargetId: $targetId, FindAll: true) {
      category {
        _id
        name
        slug
        description
      }
      posts {
        _id
        title
        slug
        subtitle
        link
        excerpt
        description
        banner
        responsive
        thumbnail
        status
        disabled
      }
    }
  }
`;

export const GET_PRODUCTS_POST_BY_ID = gql`
  query FindProductsPostById($postId: String!) {
    findPostById(PostId: $postId) {
      _id
      title
      slug
      subtitle
      link
      excerpt
      description
      banner
      responsive
      thumbnail
      status
      disabled

      metaTitle
      metaDescription
      keywords
      canonicalUrl
      tags
      ogImage
      twitterImage
      socialTitle
      socialDescription
      altText
      robotsDirectives
      language
      structuredType
      schemaMarkup
      isFeatured
      altTextBanner
      altTextThumbnail
      altTextResponsive
      focusKeyword

      category {
        _id
        name
        slug
        description
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
        cards {
          _id
          name
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
        }
        grids {
          _id
          columns
          rows
          style
          rowHeight
          color
          border
          breakLine
          layouts {
            _id
            i
            x
            y
            w
            h
            type
            image
            button {
              href
              text
              color
              icon
              picture
            }
            text {
              text
              color
            }
            style
            list
          }
        }
        gallery {
          items {
            _id
            image
            icon
            title
            video
          }
        }
        accordion {
          items {
            _id
            title
            content
          }
        }
      }
    }
  }
`;
