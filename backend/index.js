// expressモジュールを読み込む
const express = require('express');

// Expressアプリのインスタンスを作成
const app = express();

// サーバーが待ち受けるポート番号
const PORT = 3000;

// ルーティング：URLの「/（ルート）」にGETリクエストが来た時の処理
app.get('/', (req, res) => {
  res.send('<h1>Hello Express!</h1><p>サーバーが正常に動作しています。</p>');
});

// ルーティング：別のページ「/about」の例
app.get('/about', (req, res) => {
  res.json({
    message: "これはAboutページです",
    status: "success"
  });
});

// サーバーを起動して、リクエストを待ち受ける状態にする
app.listen(PORT, () => {
  console.log(`サーバーが起動しました！アクセスはこちら: http://localhost:${PORT}`);
});
