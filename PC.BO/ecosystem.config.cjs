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
        NUXT_SESSION_PASSWORD: "#{NUXT_SESSION_PASSWORD}#",
        API_BASE_URL: "https://#{ServerApi}#:3050/graphql",
        VITE_GMAP_KEY: "#{_API_KEY_GOOGLE_MAP}#",
        GOOGLE_API_KEY_MAPS: "#{_API_KEY_GOOGLE_MAP}#",
        APP_VERSION: process.env.version
      },
      env_production: {
        NODE_ENV: "production",
        LOG_LEVEL: "info",
        PORT: #{node_port}#,
        API_BASE_URL: "https://#{ServerApi}#:3050/graphql",
        GOOGLE_API_KEY_MAPS: "#{_API_KEY_GOOGLE_MAP}#",
        APP_VERSION: process.env.version
      }
    }
  ]
};
