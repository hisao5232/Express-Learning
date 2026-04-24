'use client';

import { useState, useEffect } from 'react';

// 動画データの型定義
interface Video {
  id: number;
  url: string;
  title: string;
  created_at: string;
}

export default function YouTubeManager() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);

  // 1. 動画一覧を取得する関数
  const fetchVideos = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/videos');
      const data = await res.json();
      
      // データが配列であることを確認してからセットする
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        console.error('期待した配列データではありませんでした:', data);
        setVideos([]); // 配列でない場合は空配列にしてエラーを防ぐ
      }
    } catch (err) {
      console.error('データの取得に失敗しました', err);
      setVideos([]); // 通信エラー時も空配列にする
    }
  };

  // 画面が表示された時に一覧を取得
  useEffect(() => {
    fetchVideos();
  }, []);

  // 2. 登録ボタンを押した時の処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // ページのリロードを防ぐ
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3000/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title }),
      });

      if (res.ok) {
        setUrl('');   // 入力欄を空にする
        setTitle('');
        fetchVideos(); // 一覧を再更新
      }
    } catch (err) {
      alert('登録に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          📺 My YouTube Library
        </h1>

        {/* 登録フォーム */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-12">
          <div>
            <label className="block text-sm font-medium text-gray-700">動画タイトル</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              placeholder="お気に入りの動画"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">YouTube URL</label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border"
              placeholder="https://www.youtube.com/watch?v=..."
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
          >
            {loading ? '登録中...' : '動画を登録する'}
          </button>
        </form>

        {/* 動画一覧表示 */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-800 border-b pb-2">登録済みリスト</h2>
          {videos.length === 0 ? (
            <p className="text-gray-500 italic">まだ動画がありません。</p>
          ) : (
            <ul className="divide-y divide-gray-200">
              {videos.map((video) => (
                <li key={video.id} className="py-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-medium text-indigo-600">{video.title}</span>
                    <a 
                      href={video.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-sm text-gray-500 hover:underline break-all"
                    >
                      {video.url}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
