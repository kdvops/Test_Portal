import { gql } from "graphql-tag";

export const GET_CATEGORIES_BY_TARGET = gql`
  query FindCategoryByTarget($target: String!) {
    findCategoryByTarget(Target: $target) {
      _id
      name
      slug
      excerpt
      description
      subcategories {
        _id
        name
        target
      }
      pictures {
        responsive
        banner
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
      disabled
      target
    }
  }
`;

export const GET_CATEGORIES_BY_TARGET_ID = gql`
  query FindCategoriesByTargetId($targetId: String!) {
    findCategoriesByTargetId(targetID: $targetId) {
      _id
      status
      name
      slug
      pictures {
        responsive
        banner
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
      parentID
      subcategories {
        _id
        name
        parentID
        pictures {
          responsive
          responsiveImageDetail {
            _id
            image
            altText
          }
        }
      }
      disabled
      target
      targetID
      parentTarget
    }
  }
`;

export const GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY = gql`
  query FindCategoryByParentAndTarget(
    $parentAndTargetDto: ParentAndTargetDto!
  ) {
    findCategoryByParentAndTarget(ParentAndTargetDto: $parentAndTargetDto) {
      _id
      name
      excerpt
      slug
      description
      pictures {
        responsive
        responsiveImageDetail {
          _id
          image
          altText
        }
      }
      disabled
      target
      parentTarget
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query FindCategoryById($categoryId: String!) {
    findCategoryById(CategoryID: $categoryId) {
      _id
      name
      tags
      description
      excerpt
      slug
      pictures {
        responsive
        banner
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
      }
      disabled
      target
    }
  }
`;

export const GET_CATEGORY_BY_SLUG = gql`
  query FindCategoryBySlug($slug: String!) {
    findCategoryBySlug(Slug: $slug) {
      _id
      name
      tags
      description
      excerpt
      slug
      pictures {
        responsive
        banner
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
      }
      disabled
      target
    }
  }
`;
