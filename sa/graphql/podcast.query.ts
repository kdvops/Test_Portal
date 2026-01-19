import { gql } from "graphql-tag";

export const GET_EPISODES_BY_SEASON_ID = gql`
  query FindCategoryById($seasonId: String!) {
    findEpisodePodcastBySeason(seasonID: $seasonId) {
      _id
      cover
      coverImageDetail{
        _id
        image
        altText
      }
      description
      disabled
      link
      season
      title
      createdAt
      updatedAt
    }
  }
`;
