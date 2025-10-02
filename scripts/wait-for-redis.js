import Redis from 'ioredis';

const host = process.env.REDIS_HOST || 'redis';
const port = parseInt(process.env.REDIS_PORT || '6379');

async function waitForRedis() {
  while (true) {
    try {
      const client = new Redis({
        host,
        port,
        username: 'default',
        password: process.env.REDIS_PASSWORD,
      });
      await client.ping();
      client.disconnect();
      console.info('Redis is ready!');
      break;
    } catch (err) {
      console.error('Waiting for Redis...', err);
      await new Promise((res) => setTimeout(res, 500));
    }
  }
}

await waitForRedis();
