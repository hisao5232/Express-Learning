# Performance Archive

サッカーや筋トレのパフォーマンス向上を目的とした、YouTube動画管理・分析用ウェブアプリケーションです。
旧称 express-learning から進化し、現在は Cloudflare Workers と D1 を活用したフルスタック・サーバーレス構成で運用されています。

## 概要

このプロジェクトは、YouTubeの動画URLを登録し、自分専用のトレーニング・ライブラリを構築するためのツールです。
建設機械修理エンジニアとしての技術力と、趣味のサッカー（ウイング/サイドハーフ）での知見を融合させ、**「無機質でプロフェッショナルなジム」**のようなUI/UXを目指して開発しています。

## 技術スタック

- **frontend:** Next.js (App Router), Tailwind CSS v4
- **Backend:** Hono (TypeScript), Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite-based)
- **Infrastructure:** Cloudflare Pages, Cloudflare Workers

## ディレクトリ構成

```text
performance-archive/
├── frontend/         # Next.js アプリケーション (Cloudflare Pages)
├── backend/          # Hono アプリケーション (Cloudflare Workers)
│   ├── src/index.ts  # API エントリーポイント
│   ├── schema.sql    # D1 データベース設計図
│   └── wrangler.jsonc # Cloudflare デプロイ設定
├── archive/          # 旧 Docker / Express 構成のバックアップ
└── .gitignore        # .wrangler 等の管理除外設定
```

## セットアップと起動方法
前提条件
- Node.js (v18以上)
- Cloudflare アカウント

開発用サーバーの起動
1. バックエンドの起動

```Bash
cd backend
npm run dev
```
(http://localhost:8787 で API が待機します)

2. フロントエンドの起動

```Bash
cd frontend
npm run dev
```
(http://localhost:3000 で管理画面が開きます)

## 主要機能
- [x] YouTube URL からの動画ID自動抽出・埋め込み再生

- [x] Cloudflare D1 によるデータの永続化（CRUD対応）

- [x] スポーツジムをイメージした無機質で高コントラストな UI

- [x] TypeScript による型安全なフルスタック開発

## 運用ドメイン
- go-pro-world.net (Since 2025)
