import { gql } from "graphql-tag";

export const GET_FINANCIALLY_GROUP_TYPE_POST = gql`
  query FindFinanciallyGroupByType {
    findFinanciallyGroupByType {
      type
      financially {
        _id
        status
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
        file
        type
        pinnedAt
        authors {
          _id
          name
          position
          image {
            _id
            image
            altText
          }
        }
      }
    }
  }
`;

export const GET_FINANCIALLY_BY_ID = gql`
  query FindFinanciallyById($financiallyId: String!) {
    findFinanciallyById(FinanciallyID: $financiallyId) {
      _id
      status
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
      file
      type

      metaTitle
      metaDescription
      focusKeyword
      canonicalUrl
      socialTitle
      socialDescription
      keywords
      tags
      ogImage
      twitterImage
      robotsDirectives
      language
      structuredType
      altText
      schemaMarkup
      altTextBanner
      altTextThumbnail
      altTextResponsive
      isFeatured

      authors {
        _id
        name
        position
        image {
          _id
          image
          altText
        }
        biography
        socials {
          x
          facebook
          linkedin
          instagram
        }
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
