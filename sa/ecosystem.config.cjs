module.exports = {
  apps: [
    {
      name: '#{RepoAbbr}#',
      port: #{node_port}#,
      script: '.output/server/index.mjs',
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
        PORT: #{node_port}#,
        API_BASE_URL: "/graphql",
        GOOGLE_API_KEY_MAPS: "#{_API_KEY_GOOGLE_MAP}#",
        APP_VERSION: process.env.version
      },
      env_production: {
        NODE_ENV: "production",
        LOG_LEVEL: "info",
        PORT: #{node_port}#,
        API_BASE_URL: "/graphql",
        GOOGLE_API_KEY_MAPS: "#{_API_KEY_GOOGLE_MAP}#",
        APP_VERSION: process.env.version
      }
    }
  ]
};
