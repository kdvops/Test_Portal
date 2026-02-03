export const CREATE_SEO_PAGES = gql`
  mutation CreateSeoPages($createSeoPagesDto: CreateSeoPagesDto!) {
    createSeoPages(CreateSeoPagesDto: $createSeoPagesDto) {
      createdAt
    }
  }
`;

export const CREATE_SEO_PAGE = gql`
  mutation CreateSeoPage($createSeoPageDto: CreateSeoPageDto!) {
    createSeoPage(CreateSeoPageDto: $createSeoPageDto) {
      createdAt
    }
  }
`;

export const UPDATE_SEO_PAGE = gql`
  mutation UpdateSeoPage($updateSeoPageDto: UpdateSeoPageDto!) {
    updateSeoPage(UpdateSeoPageDto: $updateSeoPageDto) {
      updatedAt
    }
  }
`;

export const REMOVE_SEO_PAGE = gql`
  mutation RemoveSeoPage($seoPageId: String!) {
    removeSeoPage(SeoPageId: $seoPageId) {
      deletedAt
    }
  }
`;
