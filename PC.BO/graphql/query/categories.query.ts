import { gql } from "graphql-tag";

export const GET_CATEGORIES_BY_TARGET = gql`
  query FindCategoryByTarget($target: String!) {
    findCategoryByTarget(Target: $target, FindAll: true) {
      _id
      status
      name
      slug
      pictures {
        responsive
        banner
        thumbnail
        responsiveImageDetail {
          _id
          image
          altText
        }
        bannerImageDetail {
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

export const GET_CATEGORIES_BY_TARGET_ID = gql`
  query FindCategoriesByTargetId($targetId: String!) {
    findCategoriesByTargetId(targetID: $targetId, FindAll: true) {
      _id
      status
      name
      slug
      pictures {
        responsive
        banner
        thumbnail
        responsiveImageDetail {
          _id
          image
          altText
        }
        bannerImageDetail {
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
        }
      }
      disabled
      target
      targetID
      parentTarget
    }
  }
`;

export const GET_CATEGORIES_BY_PARENT_KEY = gql`
  query FindCategoriesByParents($parentTarget: String!) {
    findCategoriesByParents(parentTarget: $parentTarget) {
      parent
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
        disabled
        status
        target
        targetID
        parentTarget
      }
    }
  }
`;

export const GET_CATEGORIES_BY_TARGET_AND_PARENT_KEY = gql`
  query FindCategoryByParentAndTarget(
    $parentAndTargetDto: ParentAndTargetDto!
  ) {
    findCategoryByParentAndTarget(
      ParentAndTargetDto: $parentAndTargetDto
      FindAll: true
    ) {
      _id
      status
      name
      slug
      parentID
      pictures {
        responsive
        banner
        thumbnail
        responsiveImageDetail {
          _id
          image
          altText
        }
        bannerImageDetail {
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
      targetID
      parentTarget
    }
  }
`;

export const GET_CATEGORY_BY_ID = gql`
  query FindCategoryById($categoryId: String!) {
    findCategoryById(CategoryID: $categoryId) {
      _id
      status
      name
      slug
      excerpt
      description
      tags
      parentID

      altTextBanner
      altTextThumbnail
      altTextResponsive
      metaTitle
      metaDescription
      focusKeyword
      keywords
      canonicalUrl
      ogImage
      twitterImage
      socialTitle
      socialDescription
      altText
      language
      structuredType
      robotsDirectives
      schemaMarkup
      relatedCategories
      relatedTargets
      isFeatured
      slugHistory

      subcategories {
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
      }
      pictures {
        responsive
        banner
        thumbnail
        responsiveImageDetail {
          _id
          image
          altText
        }
        bannerImageDetail {
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
      targetID
      parentTarget
    }
  }
`;
