export const GET_SEO_PAGES = gql`
  query GetSeoPages {
    seoPages {
      _id
      path
      meta {
        title
        description
      }
    }
  }
`;
