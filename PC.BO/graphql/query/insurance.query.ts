import { gql } from "graphql-tag";

export const GET_INSURANCE_GROUP_TYPE_POST = gql`
  query FindInsuranceGroupByType {
    findInsuranceGroupByType(FindAll: true) {
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
      insurance {
        _id
        status
        title
        subtitle
        link
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
      }
    }
  }
`;

export const GET_INSURANCE_BY_ID = gql`
  query FindInsuranceById($insuranceId: String!) {
    findInsuranceById(InsuranceID: $insuranceId) {
      _id
      status
      title
      slug
      subtitle
      excerpt
      link
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
            imageDetail {
              _id
              image
              altText
            }
            button {
              href
              text
              color
              icon
              picture
              pictureImageDetail {
                _id
                image
                altText
              }
              iconImageDetail {
                _id
                image
                altText
              }
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
