'use client';

import { useState, useEffect } from 'react';

// 動画データの型定義
// バックエンドから返ってくるデータの構造に合わせて定義
interface Video {
  id: number;
  url: string;
  title: string;
  video_id: string; // YouTubeの動画ID（埋め込み用）
  created_at: string;
}

export default function YouTubeManager() {
  // 入力フォームの状態管理
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  // 取得した動画リストの状態管理
  const [videos, setVideos] = useState<Video[]>([]);
  // 送信中の状態管理（連打防止）
  const [loading, setLoading] = useState(false);

  // --- 1. 動画一覧を取得する関数 ---
  const fetchVideos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/videos');
      const data = await res.json();
      
      // データが配列であることを確認してからセットする（エラー防止）
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        console.error('期待した配列データではありませんでした:', data);
        setVideos([]);
      }
    } catch (err) {
      console.error('データの取得に失敗しました', err);
      setVideos([]);
    }
  };

  // 画面が表示された時（初回マウント時）に一度だけ実行
  useEffect(() => {
    fetchVideos();
  }, []);

  // --- 2. 登録ボタンを押した時の処理 ---
  // FormEvent ではなく、フォームの送信イベントであることを明示的に指定
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // ブラウザのデフォルトのページリロードを阻止
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title }),
      });

      if (res.ok) {
        setUrl('');   // 成功したら入力欄を空にする
        setTitle('');
        fetchVideos(); // リストを再取得して最新の状態にする
      } else {
        const errorData = await res.json();
        alert(`エラー: ${errorData.error}`);
      }
    } catch (err) {
      alert('サーバーに接続できませんでした');
    } finally {
      setLoading(false); // 処理が終わったらボタンを有効に戻す
    }
  };

  // --- 3. 削除ボタンを押した時の処理 (追加) ---
  const handleDelete = async (id: number) => {
    if (!confirm('この動画を削除してもよろしいですか？')) return;

    try {
      const res = await fetch(`http://localhost:3000/api/videos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchVideos(); // リストを更新して画面から消す
      } else {
        alert('削除に失敗しました');
      }
    } catch (err) {
      console.error('削除エラー:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-black text-black mb-8 text-center">
          📺 My YouTube Library
        </h1>

        {/* 登録フォーム */}
        <form onSubmit={handleSubmit} className="space-y-6 mb-12 bg-gray-50 p-6 rounded-xl">
          <div>
            {/* text-black を指定して文字をはっきりさせる */}
            <label className="block text-sm font-bold text-black mb-1">動画タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="block w-full rounded-lg border-2 border-gray-300 p-3 text-black focus:border-indigo-600 focus:outline-none placeholder-gray-400" 
              placeholder="動画の名前を入力"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-black mb-1">YouTube URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="block w-full rounded-lg border-2 border-gray-300 p-3 text-black focus:border-indigo-600 focus:outline-none placeholder-gray-400"
              placeholder="https://youtu.be/..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-black text-white font-bold rounded-lg hover:bg-gray-800 transition disabled:bg-gray-400"
          >
            {loading ? '登録中...' : '登録する'}
          </button>
        </form>

        {/* 動画グリッド表示 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((video) => (
            <div key={video.id} className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white group">
              {/* 削除ボタン (右上に配置) */}
              <button
                onClick={() => handleDelete(video.id)}
                className="absolute top-2 right-2 z-10 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 shadow-lg"
                title="削除"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>

              {/* 埋め込みプレイヤー */}
              <div className="aspect-video bg-black">
                {video.video_id ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${video.video_id}`}
                    title={video.title}
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="flex items-center justify-center h-full text-white text-sm p-4 text-center">
                    古いデータのため再生できません。一度削除して登録し直してください。
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-bold text-lg truncate mb-1">{video.title}</h3>
                <p className="text-sm text-gray-600 truncate">{video.url}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
