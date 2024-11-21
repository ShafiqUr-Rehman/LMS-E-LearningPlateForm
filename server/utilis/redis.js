// redis.js
import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));

await redisClient.connect().then(() => {
  console.log('Redis connected successfully');
});

export default redisClient;
