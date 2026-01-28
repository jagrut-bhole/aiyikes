import Redis from "ioredis";

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis(
      process.env.REDIS_URL || "redis://localhost:6379",
      {
        maxRetriesPerRequest: 3,
        retryStrategy(times) {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },

        reconnectOnError(err) {
          const targetError = "READONLY";

          if (err.message.includes(targetError)) {
            return true;
          }
          return false;
        },
      },
    );

    redisInstance.on("error", (err) => {
      console.log("Redis Client Error: ", err);
    });

    redisInstance.on("connect", () => {
      console.log("Redis connected succesfully!!");
    });
  }

  return redisInstance;
}

export const redis = getRedisClient();
