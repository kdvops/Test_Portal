export const GET_SEO_PAGE = gql`
  query FindSeoPageByPath($path: String!) {
    findSeoPageByPath(Path: $path) {
      _id
      path
      meta {
        title
        description
      }
    }
  }
`;
