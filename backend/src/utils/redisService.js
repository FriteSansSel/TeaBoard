import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL);

export const getOrder = async (id) => {
  const data = await redis.get(`order:${id}`);
  return data ? JSON.parse(data) : null;
}

export const saveOrder = async (order) => {
  await redis.set(`order:${order.id}`, JSON.stringify(order));
  await redis.sadd("orders:ids", order.id);
};

export const getAllOrders = async () => {
  const ids = await redis.smembers("orders:ids");
  const values = await Promise.all(ids.map((id) => redis.get(`order:${id}`)));
  return values
    .filter(Boolean)
    .map((v) => JSON.parse(v));
};


export const deleteOrder = async (id) => {
  await redis.del(`order:${id}`);
  await redis.srem("orders:ids", id);
};

export const clearAllOrders = async () => {
  const ids = await redis.smembers("orders:ids");
  if (ids.length > 0) {
    const keys = ids.map((id) => `order:${id}`);
    await redis.del(...keys);
    await redis.del("orders:ids");
  }
};
