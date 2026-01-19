import { defineApolloClient } from "@nuxtjs/apollo/config";

export default defineApolloClient({
  httpEndpoint: import.meta.env.API_BASE_URL || "https://something:3050/graphql",

  httpLinkOptions: {
    credentials: "same-origin",
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS, DELETE",
      "Access-Control-Allow-Headers": "Content-Type, x-requested-with",
    },
  },

  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  },

  tokenName: "access_token",
});
