const { createClient } = require('redis');

let redisClient;

async function getRedisClient() {
  if (!redisClient) {
    redisClient = createClient({ url: 'redis://localhost:6379' });
    redisClient.on('error', (err) => console.error('Redis Client Error:', err));

    // Connect only once
    if (!redisClient.isOpen) {
      await redisClient.connect();
      console.log('✅ Connected to Redis');
    }
  }
  return redisClient;
}

module.exports = { getRedisClient };
