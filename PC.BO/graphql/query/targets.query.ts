import { gql } from "graphql-tag";

export const GET_ALL_TARGETS = gql`
  query FindAllTargets {
    findAllTargets(FindAll: true) {
      _id
      name
      slug
      icon
      color
      description
      status
      featured
      showCategories
      showPosts

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
      relatedTargets
      isFeatured
    }
  }
`;

export const GET_TARGET_BY_ID = gql`
  query FindTargetById($targetId: String!) {
    findTargetById(targetID: $targetId) {
      _id
      name
      slug
      icon
      color
      description
      status
      featured
      showCategories
      showPosts

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
      relatedTargets
      isFeatured

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
