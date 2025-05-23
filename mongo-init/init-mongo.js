// 初始化 MongoDB 資料庫和集合
db = db.getSiblingDB('arena');

// 創建使用者集合
db.createCollection('users');

// 創建對話線程集合
db.createCollection('threads');

// 創建模型集合
db.createCollection('models');

// 插入一些測試模型
db.models.insertMany([
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

// 創建管理員用戶
db.users.createIndex({ discordId: 1 }, { unique: true });
