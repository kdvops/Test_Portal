import { gql } from "graphql-tag";

export const CREATE_PODCAST_EPISODE = gql`
  mutation CreatePodcastEpisode(
    $createEpisodePodcastDto: CreateEpisodePodcastDto!
  ) {
    createPodcastEpisode(CreateEpisodePodcastDto: $createEpisodePodcastDto) {
      _id
      season
      createdAt
    }
  }
`;

export const UPDATE_PODCAST_EPISODE = gql`
  mutation UpdatePodcastEpisode(
    $updatePodcastEpisodeDto: UpdatePodcastEpisodeDto!
  ) {
    updatePodcastEpisode(UpdatePodcastEpisodeDto: $updatePodcastEpisodeDto) {
      _id
      season
      updatedAt
    }
  }
`;

export const CLONE_PODCAST_EPISODE = gql`
  mutation ClonePodcast($episodeId: String!) {
    clonePodcast(episodeID: $episodeId) {
      deletedAt
    }
  }
`;

export const REMOVE_PODCAST_EPISODE = gql`
  mutation RemovePodcast($episodeId: String!) {
    removePodcast(episodeID: $episodeId) {
      _id
      season
      deletedAt
    }
  }
`;

export const PUBLISH_PODCAST_EPISODE = gql`
  mutation PublishPodcast($episodeId: String!) {
    publishPodcast(episodeID: $episodeId) {
      updatedAt
    }
  }
`;

export const DRAFT_PODCAST_EPISODE = gql`
  mutation DraftPodcast($episodeId: String!) {
    draftPodcast(episodeID: $episodeId) {
      updatedAt
    }
  }
`;
