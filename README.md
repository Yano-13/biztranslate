# BizTranslate - ビジネス翻訳アプリケーション

外国の社員とのメール・チャットのやり取りを円滑にするための翻訳アプリケーション

## 機能

- ✅ **高品質な翻訳**: DeepL APIを使用したビジネスニュアンスでの翻訳
- ✅ **会話管理**: やり取りをスレッド化して時系列で保存
- ✅ **AI返信提案**: メッセージ内容を分析して適切な返信を提案
- ✅ **形式変換**: Slack/メール形式に適した翻訳出力
- ✅ **履歴検索**: 過去のやり取りを検索・参照
- ✅ **トーン調整**: フォーマル/カジュアルな文体の切り替え

## 技術スタック

### フロントエンド
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Router
- Zustand (状態管理)
- React Query (サーバーデータ管理)

### バックエンド
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- DeepL API

## 必要な環境

- Node.js 18以上
- MongoDB 6.0以上（ローカルまたはMongoDB Atlas）
- DeepL API キー（無料プラン可）

## 🚀 セットアップ手順

### 1. リポジトリのクローン

```bash
cd biztranslate
```

### 2. 依存関係のインストール

```bash
# ルートディレクトリで実行
npm install

# または個別にインストール
npm install --workspace=server
npm install --workspace=client
```

### 3. 環境変数の設定

#### サーバー側（`server/.env`）

```bash
cd server
cp .env.example .env
```

`.env`ファイルを編集：

```env
PORT=5000
NODE_ENV=development

# MongoDB接続URL
MONGODB_URI=mongodb://localhost:27017/biztranslate
# または MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/biztranslate

# DeepL APIキー（https://www.deepl.com/pro-api で取得）
DEEPL_API_KEY=your_deepl_api_key_here

CORS_ORIGIN=http://localhost:5173
```

### 4. MongoDBのセットアップ

#### ローカルMongoDB

```bash
# macOS (Homebrew)
brew install mongodb-community
brew services start mongodb-community

# Ubuntu/Debian
sudo apt-get install mongodb
sudo systemctl start mongodb
```

#### MongoDB Atlas（クラウド）

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)でアカウント作成
2. 無料クラスターを作成
3. データベースユーザーを作成
4. IPアドレスをホワイトリストに追加
5. 接続文字列を`.env`の`MONGODB_URI`に設定

### 5. DeepL APIキーの取得

1. [DeepL API](https://www.deepl.com/pro-api)にアクセス
2. 無料アカウントを作成（月50万文字まで無料）
3. APIキーを取得
4. `.env`の`DEEPL_API_KEY`に設定

### 6. アプリケーションの起動

#### 開発モード（推奨）

```bash
# ルートディレクトリで実行（サーバーとクライアントを同時起動）
npm run dev
```

または個別に起動：

```bash
# ターミナル1: サーバー起動
npm run dev:server

# ターミナル2: クライアント起動
npm run dev:client
```

#### 本番ビルド

```bash
# ビルド
npm run build

# サーバー起動
npm start
```

### 7. アプリケーションにアクセス

- **フロントエンド**: http://localhost:5173
- **バックエンドAPI**: http://localhost:5000
- **APIヘルスチェック**: http://localhost:5000/api/health

## Biztranslateの使い方

### 1. 新しい会話の開始

1. 左サイドバーの「新しい会話」ボタンをクリック
2. プラットフォーム（Slack/Email）を選択
3. 会話のタイトルを入力

### 2. メッセージの翻訳

#### 受信メッセージ（翻訳したい言語→日本語）

1. 外国の社員からの翻訳したいメッセージをコピー
2. チャット画面にペースト
3. プラットフォームを選択（Slack/Email）
4. 自動的に日本語に翻訳され、返信提案も表示されます

#### 送信メッセージ（日本語→翻訳したい言語)

1. 日本語でメッセージを入力
2. トーン（フォーマル/カジュアル）を選択
3. 「送信」ボタンをクリック
4. 翻訳された英語とプラットフォーム形式のテキストが表示されます
5. 「コピー」ボタンでクリップボードにコピー
6. Slack/Emailに貼り付けて送信

### 3. 返信提案の利用

- 受信メッセージには自動的に返信提案が表示されます
- 提案をクリックすると入力欄に自動入力されます
- 必要に応じて編集してから送信できます

### 4. 会話の管理

- 左サイドバーで過去の会話を確認
- 会話をクリックして内容を表示
- アーカイブ機能で古い会話を整理

## 開発

### プロジェクト構造

```
biztranslate/
├── client/                 # フロントエンド
│   ├── src/
│   │   ├── components/    # Reactコンポーネント
│   │   ├── pages/         # ページコンポーネント
│   │   ├── services/      # API通信
│   │   ├── store/         # 状態管理
│   │   └── types/         # TypeScript型定義
│   └── package.json
│
├── server/                 # バックエンド
│   ├── src/
│   │   ├── controllers/   # ビジネスロジック
│   │   ├── models/        # データモデル
│   │   ├── routes/        # APIルート
│   │   ├── services/      # 外部サービス連携
│   │   └── server.ts
│   └── package.json
│
└── package.json           # ルート設定
```

### 利用可能なスクリプト

```bash
# 開発
npm run dev              # サーバー＋クライアント同時起動
npm run dev:server       # サーバーのみ起動
npm run dev:client       # クライアントのみ起動

# ビルド
npm run build            # 全体ビルド
npm run build:server     # サーバービルド
npm run build:client     # クライアントビルド

# 本番起動
npm start                # サーバー起動

# コード品質
npm run lint             # ESLint実行
npm run format           # Prettier実行
```

## セキュリティ

- APIキーは環境変数で管理
- `.env`ファイルは`.gitignore`に含まれています
- 本番環境では必ず環境変数を設定してください

## API エンドポイント

### スレッド管理

- `GET /api/threads` - スレッド一覧取得
- `POST /api/threads` - 新規スレッド作成
- `GET /api/threads/:id` - スレッド詳細取得
- `PUT /api/threads/:id` - スレッド更新
- `DELETE /api/threads/:id` - スレッド削除

### 翻訳

- `POST /api/translations/translate` - テキスト翻訳
- `POST /api/translations/reply` - 返信翻訳
- `POST /api/translations/suggestions` - 返信提案生成
- `GET /api/translations/threads/:threadId/messages` - メッセージ一覧
- `POST /api/translations/messages` - メッセージ作成
- `GET /api/translations/usage` - API使用状況

## トラブルシューティング

### MongoDBに接続できない

```bash
# MongoDBが起動しているか確認
# macOS
brew services list

# Linux
sudo systemctl status mongodb
```

### DeepL APIエラー

- APIキーが正しく設定されているか確認
- 月間文字数制限を超えていないか確認
- [DeepL API使用状況](https://www.deepl.com/pro-account/usage)で確認

### ポートが使用中

```bash
# ポート5000が使用中の場合
lsof -ti:5000 | xargs kill -9

# ポート5173が使用中の場合
lsof -ti:5173 | xargs kill -9
```

## 今後の拡張予定

- [ ] 音声入力機能
- [ ] リアルタイム翻訳（WebSocket）
- [ ] チーム機能（複数ユーザー）
- [ ] Slack/メール直接連携
- [ ] モバイルアプリ
- [ ] 多言語対応（英語以外）

## ライセンス

MIT

## 作成者

Mio Yano (M.yano@ibm.com)

## 関連リンク

- [DeepL](https://www.deepl.com/) - 高品質な翻訳API
- [MongoDB](https://www.mongodb.com/) - データベース
- [React](https://react.dev/) - UIフレームワーク
