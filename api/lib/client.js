const FetchQL = require("fetchql");
const fetch = require("node-fetch");
global.fetch = fetch;
var client = new FetchQL({
  url: process.env.HASURA_ENDPOINT,
  headers: { "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET },
});

module.exports = client;
