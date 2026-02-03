import { gql } from "graphql-tag";

export const GET_POST_BY_SLUG = gql`
  query FindPostsBySlug($slug: String!) {
    findPostsBySlug(Slug: $slug) {
      _id
      title
      slug
      subtitle
      excerpt
      description
      banner
      responsive
      thumbnail
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
      thumbnailImageDetail {
        _id
        image
        altText
      }
      link

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
      relatedPosts
      isFeatured

      category {
        _id
        name
        pictures {
          responsive
          responsiveImageDetail {
            _id
            image
            altText
          }
        }
        target
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
          link
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

export const GET_POSTS_BY_CATEGORY = gql`
  query FindPostsByCategory($categoryId: String!) {
    findPostsByCategory(CategoryID: $categoryId) {
      _id
      title
      slug
      subtitle
      excerpt
      description
      banner
      responsive
      thumbnail
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
      thumbnailImageDetail {
        _id
        image
        altText
      }
      link
      category {
        _id
        name
        pictures {
          responsive
          responsiveImageDetail {
            _id
            image
            altText
          }
        }
        target
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
          link
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
