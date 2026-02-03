import { gql } from "graphql-tag";

export const GET_EPISODES_GROUP_BY_SEASON = gql`
  query EpisodePodcastGroupBySeason {
    episodePodcastGroupBySeason(FindAll: true) {
      season {
        name
        pictures {
          banner
        }
      }
      episodes {
        _id
        status
        title
        cover
        coverImageDetail{
          _id
          image
          altText
        }
        link
        disabled
      }
    }
  }
`;

export const GET_EPISODE_BY_ID = gql`
  query FindEpisodePodcastById($episodeId: String!) {
    findEpisodePodcastById(episodeID: $episodeId) {
      _id
      status
      title
      slug
      description
      season
      cover
      coverImageDetail{
        _id
        image
        altText
      }
      link
      disabled
    }
  }
`;

export const GET_EPISODES_BY_SEASON_ID = gql`
  query FindCategoryById($seasonId: String!) {
    findEpisodePodcastBySeason(seasonID: $seasonId) {
      _id
      status
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
      updatedAt
    }
  }
`;

