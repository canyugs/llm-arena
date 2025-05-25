#!/bin/bash
set -e

# MongoDB 初始化腳本 - 使用環境變數
echo "開始檢查 arena 資料庫..."

# 使用環境變數，如果未設置則使用預設值
OPENAI_API_KEY="${OPENAI_API_KEY:-your-openai-api-key}"
GEMINI_API_KEY="${GEMINI_API_KEY:-your-gemini-api-key}"
FORCE_RESET="${FORCE_RESET:-false}"

# 檢查是否需要初始化
mongosh <<EOF
// 切換到 arena 資料庫
db = db.getSiblingDB('arena');

// 檢查資料庫是否存在
const dbExists = db.adminCommand('listDatabases').databases.some(d => d.name === 'arena');
if (!dbExists) {
  print("arena 資料庫不存在，將創建新資料庫");
} else {
  print("arena 資料庫已存在");
}

// 檢查是否已有資料
const modelsCount = db.models.countDocuments();
const forceReset = '$FORCE_RESET' === 'true';

if (modelsCount > 0 && !forceReset) {
  print("資料庫已存在 " + modelsCount + " 個模型，跳過初始化");
  print("如需重新初始化，請設置 FORCE_RESET=true");
  quit(0);
}

if (forceReset && modelsCount > 0) {
  print("強制重置模式：清除現有資料...");
  db.users.deleteMany({});
  db.threads.deleteMany({});
  db.models.deleteMany({});
  print("已清除現有資料");
}

print("開始初始化 arena 資料庫...");

// 創建集合和索引
db.createCollection('users');
db.createCollection('threads');
db.createCollection('models');

db.users.createIndex({ "username": 1 }, { unique: true });
db.threads.createIndex({ "userID": 1 });
db.threads.createIndex({ "createdAt": -1 });
db.models.createIndex({ "model": 1 }, { unique: true });

// 插入預設模型 - 使用環境變數
db.models.insertMany([
  {
    model: 'o4-mini',
    baseURL: 'https://api.openai.com/v1',
    apiKey: '$OPENAI_API_KEY'
  },
  {
    model: 'gemini-1.5-flash',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta',
    apiKey: '$GEMINI_API_KEY'
  }
]);

print("Arena 資料庫初始化完成");
EOF

echo "資料庫初始化完成" 