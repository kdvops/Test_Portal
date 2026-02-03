import { gql } from "graphql-tag";

export const CREATE_CHANNEL = gql`
  mutation CreateChannel($createChannelDto: CreateChannelDto!) {
    createChannel(CreateChannelDto: $createChannelDto) {
      _id
      createdAt
    }
  }
`;

export const UPDATE_CHANNEL = gql`
  mutation UpdateChannel($updateChannelDto: UpdateChannelDto!) {
    updateChannel(UpdateChannelDto: $updateChannelDto) {
      _id
      updatedAt
    }
  }
`;

export const CLONE_CHANNEL = gql`
  mutation CloneChannel($channelId: String!) {
    cloneChannel(ChannelID: $channelId) {
      deletedAt
    }
  }
`;

export const REMOVE_CHANNEL = gql`
  mutation RemoveChannel($channelId: String!) {
    removeChannel(ChannelID: $channelId) {
      _id
      deletedAt
    }
  }
`;


export const PUBLISH_CHANNEL = gql`
  mutation PublishChannel($channelId: String!) {
    publishChannel(ChannelID: $channelId) {
      updatedAt
    }
  }
`;

export const DRAFT_CHANNEL = gql`
  mutation DraftChannel($channelId: String!) {
    draftChannel(ChannelID: $channelId) {
      updatedAt
    }
  }
`;
