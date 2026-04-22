# ベースとなるNode.jsのイメージを指定
FROM node:22-slim

# コンテナ内での作業ディレクトリを作成
WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# アプリのソースコードをコピー
COPY . .

# サーバーを起動
CMD ["npx", "nodemon", "index.js"]
