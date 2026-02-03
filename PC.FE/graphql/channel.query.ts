import { gql } from "graphql-tag";

export const GET_CHANNELS_POST = gql`
  query FindChannelsPostPublic {
    findChannelsPostPublic(FindAll: true) {
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
      status
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

export const GET_CHANNEL_POST_BY_ID = gql`
  query FindChannelById($channelId: String!) {
    findChannelById(ChannelID: $channelId) {
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
      status
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

export const GET_CHANNEL_POST_BY_SLUG = gql`
  query FindChannelsBySlug($slug: String!) {
    findChannelsBySlug(Slug: $slug) {
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
      status
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
