import {MongoClient} from 'mongodb';

const getMongoClient = async () => {
  const uri = process.env.MONGO_URI

  if (!uri) {
    throw new Error("MONGO_URI not set")
  }

  const client = await MongoClient.connect(uri, {maxIdleTimeMS: 30000});
  await client.connect();

  return client;
};

export default getMongoClient;
