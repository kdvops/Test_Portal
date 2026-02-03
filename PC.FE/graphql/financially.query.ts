import { gql } from "graphql-tag";

export const GET_FINANCIALLY_BY_ID = gql`
  query FindFinanciallyById($financiallyId: String!) {
    findFinanciallyById(FinanciallyID: $financiallyId) {
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
      file
      type
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

export const GET_FINANCIALLY = gql`
  query FindFinancially($argsFinancially: ArgsFinancially!) {
    findFinancially(ArgsFinancially: $argsFinancially) {
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
      file
      type
      createdAt
      pinnedAt
    }
  }
`;

export const GET_FINANCIALLY_BY_SLUG = gql`
  query FindFinanciallyBySlug($slug: String!) {
    findFinanciallyBySlug(Slug: $slug) {
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
      file
      type
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
        grids {
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

export const GET_FINANCIALLY_PAGINATED = gql`
  query getFinanciallyPaginated($argsFinancially: ArgsFinancially!) {
    getFinanciallyPaginated(ArgsFinancially: $argsFinancially) {
      currentPage
      totalItems
      itemsPerPage
      items {
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
        file
        type
        createdAt
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

export const GET_FINANCIALLY_RELATED = gql`
  query GetFinanciallyRelated($financiallyId: String!) {
    getFinanciallyRelated(FinanciallyID: $financiallyId) {
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
      file
      type
      createdAt
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
`;

export const GET_FINANCIALLY_RECENT = gql`
  query GetFinanciallyRecent($financiallyId: String!) {
    getFinanciallyRecent(FinanciallyID: $financiallyId) {
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
      file
      type
      createdAt
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
`;
