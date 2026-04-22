# Express Learning App

JavaScript 初心者のための Express 学習用ウェブアプリ開発プロジェクトです。
Docker Compose を使用して、バックエンド（Express）とデータベース（PostgreSQL）の環境を簡単に構築できます。

## 概要

このプロジェクトは、Node.js の軽量フレームワークである **Express** を使用したサーバー開発の基礎を学ぶためのものです。将来的にフロントエンド（React/Next.js 等）との連携も想定したディレクトリ構成になっています。

## 技術スタック

- **Backend:** Node.js, Express
- **Database:** PostgreSQL 16
- **Infrastructure:** Docker, Docker Compose

## ディレクトリ構成

```text
express-learning/
├── backend/            # Express アプリケーション本体
│   ├── index.js        # サーバーのエントリーポイント
│   ├── Dockerfile      # バックエンド用 Docker 設計図
│   └── package.json    # プロジェクト設定・依存ライブラリ管理
├── docker-compose.yml  # 全コンテナの実行設定
└── .gitignore          # Git 管理除外設定
```

## セットアップと起動方法
前提条件
- Docker Desktop がインストールされていること

手順
- このリポジトリをクローンします。

- プロジェクトのルートディレクトリで以下のコマンドを実行します。

```Bash
docker compose up -d
```
以下の URL にアクセスして動作を確認します。

- http://localhost:3000 (Hello Express!)

- http://localhost:3000/about (JSON レスポンス)

## 今後の学習予定
- [ ] REST API の実装（GET, POST, PUT, DELETE）

- [ ] PostgreSQL との連携（CRUD 操作）

- [ ] Frontend（React 等）の追加と API 通信

- [ ] ユーザー認証の実装
