const { Pool } = require('pg');

// docker-compose.yml で設定した値を指定します
const pool = new Pool({
  user: 'user',           // POSTGRES_USER
  host: 'db',             // サービス名（Docker内では名前で解決できる）
  database: 'mydatabase', // POSTGRES_DB
  password: 'password',   // POSTGRES_PASSWORD
  port: 5432,
});

module.exports = pool;
