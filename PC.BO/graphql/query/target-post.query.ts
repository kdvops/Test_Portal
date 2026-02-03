import { gql } from "graphql-tag";

export const GET_TARGET_POSTS = gql`
  query FindTargetPosts($targetId: String!) {
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
      thumbnailImageDetail {
        _id
        image
        altText
      }
      bannerImageDetail {
        _id
        image
        altText
      }
      responsiveImageDetail {
        _id
        image
        altText
      }
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

export const GET_TARGET_POST_GROUP_BY_CATEGORY = gql`
  query FindPostsGroupByCategory($targetId: String!) {
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
        thumbnailImageDetail {
          _id
          image
          altText
        }
        bannerImageDetail {
          _id
          image
          altText
        }
        responsiveImageDetail {
          _id
          image
          altText
        }
        status
        disabled
      }
    }
  }
`;

export const GET_POSTS_BY_CATEGORY_ID = gql`
  query FindPostsByCategoryId($categoryId: String!) {
    findPostsByCategoryId(CategoryId: $categoryId, FindAll: true) {
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
      thumbnailImageDetail {
        _id
        image
        altText
      }
      bannerImageDetail {
        _id
        image
        altText
      }
      responsiveImageDetail {
        _id
        image
        altText
      }
      status
      disabled
      targetID {
        _id
        name
        slug
      }
    }
  }
`;

export const GET_POST_BY_ID = gql`
  query FindPostById($postId: String!) {
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
      thumbnailImageDetail {
        _id
        image
        altText
      }
      bannerImageDetail {
        _id
        image
        altText
      }
      responsiveImageDetail {
        _id
        image
        altText
      }
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
