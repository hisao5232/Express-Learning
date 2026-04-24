const express = require('express');
const cors = require('cors');
const pool = require('./db'); // DB接続設定（Pool）を読み込み

const app = express();

// --- ミドルウェアの設定 ---
app.use(cors()); // 異なるポート（Next.js:3001など）からのアクセスを許可
app.use(express.json()); // リクエストのボディ（JSON）を解析して req.body で使えるようにする

// --- データベースの初期化 ---
const initDB = async () => {
  try {
    // 動画情報を保存するテーブルを作成（存在しない場合のみ）
    await pool.query(`
      CREATE TABLE IF NOT EXISTS videos (
        id SERIAL PRIMARY KEY,            -- 自動で増えるID
        url TEXT NOT NULL,                -- YouTubeのURL（必須）
        title TEXT,                       -- 動画のタイトル
        video_id TEXT,                    -- 【追加】埋め込み表示用に動画IDを個別に持つと便利
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- 登録日時
      );
    `);
    console.log("✅ Database table is ready.");
  } catch (err) {
    console.error("❌ Error creating table:", err);
  }
};
initDB();

// --- APIエンドポイント ---

// 1. 動画を登録するAPI (CREATE)
app.post('/api/videos', async (req, res) => {
  const { url, title } = req.body;

  // 簡単なバリデーション（URLがない場合はエラーを返す）
  if (!url) {
    return res.status(400).json({ error: "URLは必須です" });
  }

  try {
    // $1, $2 を使うことで「SQLインジェクション」という攻撃を防ぐ（安全な書き方）
    const result = await pool.query(
      'INSERT INTO videos (url, title) VALUES ($1, $2) RETURNING *',
      [url, title]
    );
    
    // 登録されたデータをクライアント（Next.js）に返す
    res.status(201).json(result.rows[0]); 
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "サーバー側で保存に失敗しました" });
  }
});

// 2. 動画一覧を取得するAPI (READ)
app.get('/api/videos', async (req, res) => {
  try {
    // 作成日時の新しい順（DESC）で取得
    const result = await pool.query('SELECT * FROM videos ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "データ取得に失敗しました" });
  }
});

// --- サーバーの起動 ---
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
