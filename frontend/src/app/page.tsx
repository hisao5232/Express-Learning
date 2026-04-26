'use client';

import { useState, useEffect } from 'react';

// 動画データの型定義
interface Video {
  id: number;
  url: string;
  title: string;
  video_id: string; // YouTubeの動画ID
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
      // ネットワーク不安定時のための対策（localhost -> 127.0.0.1）
      const res = await fetch('http://127.0.0.1:8787/api/videos');
      const data = await res.json();
      
      // データが配列であることを確認してからセットする
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        setVideos([]);
      }
    } catch (err) {
      console.error('データの取得に失敗しました', err);
      setVideos([]);
    }
  };

  // 画面が表示された時に一覧を取得
  useEffect(() => {
    fetchVideos();
  }, []);

  // --- 2. 登録ボタンを押した時の処理 ---
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault(); // ページのリロードを防ぐ
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8787/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title }),
      });

      if (res.ok) {
        setUrl('');   // 入力欄を空にする
        setTitle('');
        fetchVideos(); // 一覧を再更新
      } else {
        const errorData = await res.json();
        alert(`エラー: ${errorData.error}`);
      }
    } catch (err) {
      alert('サーバーに接続できませんでした');
    } finally {
      setLoading(false);
    }
  };

  // --- 3. 削除ボタンを押した時の処理 ---
  const handleDelete = async (id: number) => {
    if (!confirm('この動画を削除してもよろしいですか？（この操作は取り消せません）')) return;

    try {
      const res = await fetch(`http://127.0.0.1:8787/api/videos/${id}`, {
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
    // 全体の背景をコンクリート風の薄いグレーに (bg-slate-100)
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      {/* メインコンテンツエリア */}
      <div className="grow max-w-7xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
        
        {/* ヘッダー：無機質なスチール風のデザイン */}
        <header className="border-b-4 border-black pb-6 mb-12 flex items-center justify-between">
          <h1 className="text-4xl font-extrabold tracking-tighter text-black uppercase">
            Performance <span className="font-light text-slate-500">Archive</span>
          </h1>
          <div className="text-sm font-mono bg-black text-white px-3 py-1 rounded-sm">
            Total: {videos.length} Videos
          </div>
        </header>

        {/* 2カラムレイアウト（フォームとリスト） */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 左側：登録フォーム（無機質なボックス） */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white p-8 border border-slate-300 rounded-sm shadow-inner space-y-6 sticky top-8">
              <h2 className="text-xl font-bold uppercase tracking-tight border-l-4 border-black pl-3 mb-6 text-black">
                Add New Training
              </h2>
              
              <div>
                <label className="block text-xs font-mono uppercase text-slate-600 mb-1">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  // 入力欄を角張らせ、ボーダーを強調 (rounded-none border-slate-400)
                  className="block w-full rounded-none border-2 border-slate-400 p-3 text-black focus:border-black focus:ring-0 placeholder-slate-400 font-medium" 
                  placeholder="EX: CORE TRAINING"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-mono uppercase text-slate-600 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="block w-full rounded-none border-2 border-slate-400 p-3 text-black focus:border-black focus:ring-0 placeholder-slate-400 font-medium"
                  placeholder="https://youtu.be/..."
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                // ボタンを真黒、角張らせる (bg-black rounded-none)
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest rounded-none hover:bg-slate-800 transition disabled:bg-slate-400 text-sm"
              >
                {loading ? 'Processing...' : 'Register Video'}
              </button>
            </form>
          </div>

          {/* 右側：動画グリッド表示（2列） */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {videos.length === 0 ? (
                <div className="col-span-full border-2 border-dashed border-slate-400 text-center text-slate-500 py-16 bg-white font-mono text-sm rounded-sm">
                  NO DATA AVAILABLE. ANY TRAININGS.
                </div>
              ) : (
                videos.map((video) => (
                  // カード：白背景、角張ったデザイン (bg-white rounded-none border)
                  <div key={video.id} className="relative border border-slate-300 rounded-none overflow-hidden shadow-sm bg-white group hover:border-slate-500 transition-colors">
                    
                    {/* 削除ボタン：無機質なグレーのゴミ箱、ホバーで赤く (bg-slate-200 text-slate-600) */}
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="absolute top-2 right-2 z-10 bg-slate-200 text-slate-600 p-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white shadow"
                      title="DELETE VIDEO"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* 埋め込みプレイヤー */}
                    <div className="aspect-video bg-black border-b border-slate-300">
                      {video.video_id ? (
                        <iframe
                          className="w-full h-full"
                          src={`https://www.youtube.com/embed/${video.video_id}`}
                          title={video.title}
                          allowFullScreen
                        ></iframe>
                      ) : (
                        <div className="flex items-center justify-center h-full text-slate-500 text-xs p-4 text-center font-mono bg-slate-200">
                          ERROR: INVALID VIDEO ID. PLEASE RE-REGISTER.
                        </div>
                      )}
                    </div>
                    
                    <div className="p-5">
                      {/* タイトル：太字、黒 (text-black font-extrabold) */}
                      <h3 className="font-extrabold text-black text-lg truncate mb-1 uppercase tracking-tight">
                        {video.title}
                      </h3>
                      {/* URL：細字、グレー (text-slate-500 font-light) */}
                      <p className="text-xs text-slate-500 truncate font-light font-mono">
                        ID: {video.video_id || 'N/A'} | {video.url}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* フッター：go-pro-world.net since 2025 を追加 */}
      <footer className="w-full bg-black text-slate-400 py-6 mt-16 border-t-2 border-slate-700">
        <div className="max-w-7xl mx-auto px-4 text-center font-mono text-xs tracking-wider">
          &copy; {new Date().getFullYear()} <span className="text-white">GO-PRO-WORLD.NET</span> | Since 2025 | All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
