import { gql } from "graphql-tag";

export const GET_PROUSER_GROUP_TYPE_POST = gql`
  query FindProuserGroupByType {
    findProuserGroupByType(FindAll: true) {
      category {
        _id
        name
        slug
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
      prouser {
        _id
        status
        title
        slug
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

export const GET_PROUSER_BY_ID = gql`
  query FindProuserById($prouserId: String!) {
    findProuserById(ProuserID: $prouserId) {
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
