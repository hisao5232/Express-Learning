import { Hono } from 'hono'
import { cors } from 'hono/cors'

// --- 型定義セクション ---
// Cloudflare Workers の環境変数やリソース（D1など）の名前を定義します。
// これにより、コード内で「DB」という名前でデータベースを安全に扱えるようになります。
type Bindings = {
  DB: D1Database
  DISCORD_WEBHOOK_URL: string
}

// Hono のインスタンスを作成。上記で定義した Bindings を渡すことで、
// データベース操作時に型補完（入力候補）が効くようになります。
const app = new Hono<{ Bindings: Bindings }>()

// --- ミドルウェアセクション ---
// CORS（Cross-Origin Resource Sharing）を許可します。
// これがないと、フロントエンドから
// このバックエンドへの通信がブラウザによってブロックされてしまいます。
app.use('/api/*', cors())

// --- ヘルパー関数 ---
// 入力された長いYouTube URLから、動画固有の11桁のID（例：dQw4w9WgXcQ）
// だけを抜き出すための「抽出器」です。正規表現という技術を使っています。
function extractVideoId(url: string): string | null {
  const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[7].length === 11) ? match[7] : null;
}

// Discord通知用の関数
async function sendDiscordNotification(env: Bindings) {
  const webhookUrl = env.DISCORD_WEBHOOK_URL;
  const message = {
    content: "📢 今日のトレーニング動画をチェックしましょう！\nhttps://video-log.go-pro-world.net"
  };

  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message),
  });
}

// --- API ルート定義 ---

/**
 * 1. 動画一覧取得 (GET)
 * 画面を開いた時に、保存されているすべての動画を新しい順に取得します。
 */
app.get('/api/videos', async (c) => {
  try {
    // c.env.DB は Cloudflare D1 への接続窓口です。
    // SQL（データベース操作言語）を使ってデータを取得します。
    const { results } = await c.env.DB.prepare(
      'SELECT * FROM videos ORDER BY created_at DESC'
    ).all();
    
    // 成功したら取得結果を JSON 形式でフロントエンドに返します。
    return c.json(results);
  } catch (e) {
    // データベースが故障しているなどの異常事態には 500 番エラーを返します。
    return c.json({ error: 'Database error' }, 500);
  }
})

/**
 * 2. 動画登録 (POST)
 * フロントエンドから送られてきた URL とタイトルをデータベースに保存します。
 */
app.post('/api/videos', async (c) => {
  // フロントエンドから届いた JSON データを受け取ります。
  const { url, title } = await c.req.json<{ url: string; title: string }>();
  
  // URL から動画 ID を抽出します。
  const videoId = extractVideoId(url);

  // URL が空だったり、ID がうまく抜けない（不正なURL）場合は 400 番エラーで返します。
  if (!url || !videoId) {
    return c.json({ error: 'Invalid URL' }, 400);
  }

  try {
    // INSERT 文でデータを追加します。
    // 「?」を使うことで、外部からの不正な入力を防ぐ安全な書き方（プリペアドステートメント）をしています。
    const result = await c.env.DB.prepare(
      'INSERT INTO videos (url, title, video_id) VALUES (?, ?, ?) RETURNING *'
    )
    .bind(url, title, videoId) // 「?」の部分に実際の値を流し込みます。
    .first(); // 追加したばかりのデータを 1 件取得します。
    
    return c.json(result, 201); // 201 は「作成成功」を意味するステータスコードです。
  } catch (e) {
    return c.json({ error: 'Failed to save' }, 500);
  }
})

/**
 * 3. 動画削除 (DELETE)
 * 指定された ID の動画をデータベースから消去します。
 */
app.delete('/api/videos/:id', async (c) => {
  // URL の末尾にある ID（例: /api/videos/5 の '5'）を読み取ります。
  const id = c.req.param('id');
  
  try {
    // 指定された ID のデータ行を削除します。
    await c.env.DB.prepare('DELETE FROM videos WHERE id = ?').bind(id).run();
    return c.json({ message: 'Deleted' });
  } catch (e) {
    return c.json({ error: 'Failed to delete' }, 500);
  }
})


// この設定を Cloudflare Workers のエントリーポイントとしてエクスポートします。
export default {
  // 通常のAPIリクエスト（HTTP）
  fetch: app.fetch,

  // 定時実行（Cron）
  async scheduled(event: any, env: Bindings, ctx: any) {
    ctx.waitUntil(sendDiscordNotification(env));
  },
};
