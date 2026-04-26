import { Hono } from 'hono'
import { cors } from 'hono/cors'

// Cloudflare Workers の環境変数の型定義
type Bindings = {
  DB: D1Database
}

const app = new Hono<{ Bindings: Bindings }>()

// CORSの設定
app.use('/api/*', cors())

// YouTube ID抽出ロジック（そのまま移植）
function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// 1. 動画一覧取得 (GET)
app.get('/api/videos', async (c) => {
  try {
    // D1 へのクエリ実行
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM videos ORDER BY created_at DESC'
    ).all();
    return c.json(results);
  } catch (e) {
    return c.json({ error: 'Database error' }, 500);
  }
})

// 2. 動画登録 (POST)
app.post('/api/videos', async (c) => {
  const { url, title } = await c.req.json<{ url: string; title: string }>();
  const videoId = extractVideoId(url);

  if (!url || !videoId) {
    return c.json({ error: 'Invalid URL' }, 400);
  }

  try {
    const result = await c.env.DB.prepare(
      'INSERT INTO videos (url, title, video_id) VALUES (?, ?, ?) RETURNING *'
    )
    .bind(url, title, videoId)
    .first();
    
    return c.json(result, 201);
  } catch (e) {
    return c.json({ error: 'Failed to save' }, 500);
  }
})

// 3. 動画削除 (DELETE)
app.delete('/api/videos/:id', async (c) => {
  const id = c.req.param('id');
  try {
    await c.env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(id).run();
    return c.json({ message: 'Deleted' });
  } catch (e) {
    return c.json({ error: 'Failed to delete' }, 500);
  }
})

export default app
