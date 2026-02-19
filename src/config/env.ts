import dotenv from 'dotenv';

dotenv.config();

export const config = {
  node_env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  api_base_url: process.env.API_BASE_URL || 'http://localhost:3000',

  // Database
  database_url: process.env.DATABASE_URL,

  // Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: 0,
  },

  // External APIs
  openweathermap_api_key: process.env.OPENWEATHERMAP_API_KEY,
  weather_api_cache_ttl: parseInt(process.env.WEATHER_API_CACHE_TTL || '600', 10),

  // Rate Limiting
  rate_limit: {
    window_ms: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    max_requests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },

  // Cron Job
  cron_job_interval: parseInt(process.env.CRON_JOB_INTERVAL || '15', 10),

  // Logging
  log_level: process.env.LOG_LEVEL || 'info',

  // Feature flags
  is_production: process.env.NODE_ENV === 'production',
  is_development: process.env.NODE_ENV === 'development',
};

export default config;
