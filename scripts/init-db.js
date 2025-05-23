require('dotenv').config();

const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'arena';

async function initializeDatabase() {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully to database');

    const db = client.db(dbName);

    // 創建使用者集合
    // await db.createCollection('users');

    // 創建對話線程集合
    // await db.createCollection('threads');

    // 創建模型集合
    await db.dropCollection('models');
    await db.createCollection('models');

    // 插入一些測試模型
    await db.collection('models').insertMany([
      {
        model: 'o4-mini',
        baseURL: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
      },
      {
        model: 'gemini-1.5-flash',
        baseURL: 'https://generativelanguage.googleapis.com/v1beta',
        apiKey: process.env.GEMINI_API_KEY || 'your-gemini-api-key'
      },
    ]);

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.close();
    console.log('Database connection closed');
  }
}

initializeDatabase();
