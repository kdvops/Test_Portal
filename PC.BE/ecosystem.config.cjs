module.exports = {
  apps: [
    {
      name: '#{RepoAbbr}#',
      port: #{graphql_port}#,
      script: './dist/main.js',
      interpreter: 'node',
      args: 'start',
      watch: false,
      watch_delay: 300000,
      ignore_watch: ["node_modules", "logs"],
      exec_mode: "cluster",
      instances: "1",
      max_memory_restart: "1G",
      restart_delay: 5000,
      env: {
        PORT: #{graphql_port}#,
        AZURE_STORAGE_ACCOUNT_NAME: "#{_ENV_AZURE_STORAGE_ACCOUNT_NAME}#",
        AZURE_STORAGE_SAS_TOKEN: "#{_ENV_AZURE_STORAGE_SAS_TOKEN}#",
        AZURE_STORAGE_CONTAINER_NAME: "#{_ENV_AZURE_STORAGE_CONTAINER_NAME}#",
        CONNECTION_EXTREME_MEDIATOR_SERVICE: "#{_ENV_CONNECTION_EXTREME_MEDIATOR_SERVICE}#",
        APP_VERSION: process.env.version
      },
      env_production: {
        NODE_ENV: "production",
        LOG_LEVEL: "info",
        PORT: #{graphql_port}#,
        AZURE_STORAGE_ACCOUNT_NAME: "#{_ENV_AZURE_STORAGE_ACCOUNT_NAME}#",
        AZURE_STORAGE_SAS_TOKEN: "#{_ENV_AZURE_STORAGE_SAS_TOKEN}#",
        AZURE_STORAGE_CONTAINER_NAME: "#{_ENV_AZURE_STORAGE_CONTAINER_NAME}#",
        CONNECTION_EXTREME_MEDIATOR_SERVICE: "#{_ENV_CONNECTION_EXTREME_MEDIATOR_SERVICE}#",
        APP_VERSION: process.env.version
      }

    }
  ]
};