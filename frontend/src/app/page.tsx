'use client';

import { useState, useEffect, useMemo } from 'react';

// 動画データの型定義
interface Video {
  id: number;
  url: string;
  title: string;
  video_id: string; 
  created_at: string;
}

export default function YouTubeManager() {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingTitle, setFetchingTitle] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // 検索ワードの状態

  // --- 1. 動画一覧を取得する関数 ---
  const fetchVideos = async () => {
    try {
      const res = await fetch('https://video-arc-backend.hisao52321983.workers.dev/api/videos');
      const data = await res.json();
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

  useEffect(() => {
    fetchVideos();
  }, []);

  // --- 2. YouTubeからタイトルを自動取得する関数 ---
  const fetchYouTubeTitle = async (inputUrl: string) => {
    if (inputUrl.includes("youtube.com/") || inputUrl.includes("youtu.be/")) {
      setFetchingTitle(true);
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(inputUrl)}&format=json`);
        if (response.ok) {
          const data = await response.json();
          if (data.title) {
            setTitle(data.title);
          }
        }
      } catch (err) {
        console.error('タイトル取得失敗:', err);
      } finally {
        setFetchingTitle(false);
      }
    }
  };

  // --- 3. URL入力時のハンドラ ---
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    fetchYouTubeTitle(newUrl);
  };

  // --- 4. 検索フィルタリングロジック ---
  const filteredVideos = useMemo(() => {
    return videos.filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [videos, searchQuery]);

  // --- 5. 登録・削除処理（ロジックは変更なし） ---
  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('https://video-arc-backend.hisao52321983.workers.dev/api/videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, title }),
      });
      if (res.ok) {
        setUrl('');
        setTitle('');
        fetchVideos();
      }
    } catch (err) {
      alert('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('この動画を削除してもよろしいですか？')) return;
    try {
      const res = await fetch(`https://video-arc-backend.hisao52321983.workers.dev/api/videos/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) fetchVideos();
    } catch (err) {
      console.error('削除エラー:', err);
    }
  };

  return (
    /* 【全体レイアウト】背景色とフォント、最小高さの設定 */
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col">
      <div className="grow max-w-7xl mx-auto w-full py-12 px-4 sm:px-6 lg:px-8">
        
        {/* 【ページヘッダー】タイトルロゴと合計動画数の表示。検索バーを右側に配置 */}
        <header className="border-b-4 border-black pb-6 mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tighter text-black uppercase">
              Performance <span className="font-light text-slate-500">Archive</span>
            </h1>
          </div>

          {/* 【検索フィルター機能】タイトルで動画を絞り込むための入力フィールド */}
          <div className="relative w-full md:w-80">
            <label className="block text-[10px] font-mono uppercase text-slate-500 mb-1">Search Filter</label>
            <div className="relative">
              <input
                type="text"
                placeholder="FILTER BY TITLE..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border-2 border-slate-400 p-2 pl-9 text-sm focus:border-black focus:ring-0 rounded-none font-mono"
              />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute left-3 top-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="text-sm font-mono bg-black text-white px-3 py-1 rounded-sm hidden md:block">
            Total: {videos.length} Videos
          </div>
        </header>

        {/* 【メインコンテンツ領域】左側に登録フォーム、右側に動画リストの2カラム構成 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* 【左カラム：登録フォーム】YouTube URLを入力し、動画をデータベースへ登録するブロック */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit} className="bg-white p-8 border border-slate-300 rounded-sm shadow-inner space-y-6 sticky top-8">
              <h2 className="text-xl font-bold uppercase tracking-tight border-l-4 border-black pl-3 mb-6 text-black">
                Add New Training
              </h2>
              
              {/* URL入力フィールド：入力時にタイトル自動取得をトリガーする */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-600 mb-1">YouTube URL</label>
                <input
                  type="url"
                  value={url}
                  onChange={handleUrlChange}
                  className="block w-full rounded-none border-2 border-slate-400 p-3 text-black focus:border-black focus:ring-0 placeholder-slate-400 font-medium"
                  placeholder="https://youtu.be/..."
                  required
                />
              </div>

              {/* タイトル入力フィールド：自動取得結果が反映される。手動修正も可能 */}
              <div>
                <label className="block text-xs font-mono uppercase text-slate-600 mb-1">
                  Title {fetchingTitle && <span className="text-blue-600 normal-case animate-pulse ml-2">(Fetching...)</span>}
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-none border-2 border-slate-400 p-3 text-black focus:border-black focus:ring-0 placeholder-slate-400 font-medium" 
                  placeholder={fetchingTitle ? "Waiting for YouTube..." : "EX: CORE TRAINING"}
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !title}
                className="w-full py-4 bg-black text-white font-bold uppercase tracking-widest rounded-none hover:bg-slate-800 transition disabled:bg-slate-400 text-sm"
              >
                {loading ? 'Processing...' : 'Register Video'}
              </button>
            </form>
          </div>

          {/* 【右カラム：動画グリッド】登録された動画を表示・管理するメインリスト */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredVideos.length === 0 ? (
                /* 検索結果がゼロ、またはデータがない場合のプレースホルダー */
                <div className="col-span-full border-2 border-dashed border-slate-400 text-center text-slate-500 py-16 bg-white font-mono text-sm rounded-sm">
                  {searchQuery ? "NO MATCHING VIDEOS FOUND." : "NO DATA AVAILABLE. ANY TRAININGS."}
                </div>
              ) : (
                /* フィルタリングされた動画データをループしてカード表示 */
                filteredVideos.map((video) => (
                  <div key={video.id} className="relative border border-slate-300 rounded-none overflow-hidden shadow-sm bg-white group hover:border-slate-500 transition-colors">
                    
                    {/* カード内：削除ボタン（ホバー時に表示） */}
                    <button
                      onClick={() => handleDelete(video.id)}
                      className="absolute top-2 right-2 z-10 bg-slate-200 text-slate-600 p-1.5 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 hover:text-white shadow"
                      title="DELETE VIDEO"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>

                    {/* カード内：YouTube動画プレイヤー埋め込み部分 */}
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
                          ERROR: INVALID VIDEO ID.
                        </div>
                      )}
                    </div>
                    
                    {/* カード内：動画タイトルとメタ情報のテキストエリア */}
                    <div className="p-5">
                      <h3 className="font-extrabold text-black text-lg truncate mb-1 uppercase tracking-tight">
                        {video.title}
                      </h3>
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

      {/* 【ページフッター】コピーライトと独自ドメインの表示 */}
      <footer className="w-full bg-black text-slate-400 py-6 mt-16 border-t-2 border-slate-700">
        <div className="max-w-7xl mx-auto px-4 text-center font-mono text-xs tracking-wider">
          &copy; {new Date().getFullYear()} <span className="text-white">GO-PRO-WORLD.NET</span> | Since 2025 | All Rights Reserved.
        </div>
      </footer>
    </div>
  );
}
