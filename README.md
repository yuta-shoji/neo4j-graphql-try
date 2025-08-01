# Next.js × Neo4j × GraphQL アプリケーション

DenoとNext.js 15、Neo4j、GraphQLを使ったモダンなユーザー関係性管理アプリケーション

## 🚀 特徴

- **Next.js 15** - App RouterとServer Componentsを活用
- **Neo4j** - グラフデータベースによる関係性管理
- **GraphQL** - Apollo ServerとApollo Clientによる型安全なAPI
- **Deno** - モダンなJavaScript/TypeScriptランタイム
- **TypeScript** - 完全な型安全性
- **Tailwind CSS** - モダンでレスポンシブなUI

## 📋 前提条件

1. **Deno** (v1.40以上)
   ```bash
   curl -fsSL https://deno.land/install.sh | sh
   ```

2. **Docker & Docker Compose** (推奨)
   - Docker Desktopをインストール

## 🛠 セットアップ

### 1. Neo4jデータベースを起動

```bash
# プロジェクトルートでNeo4jを起動
docker-compose up -d

# ログを確認
docker-compose logs -f neo4j

# Neo4jが起動完了するまで待機（約30秒〜1分）
```

### 2. 環境変数を設定

```bash
cd nextapp
cp .env.example .env.local
```

`.env.local`の内容を必要に応じて編集してください。デフォルト設定で動作します。

### 3. 依存関係をインストールしてアプリケーションを起動

```bash
cd nextapp

# 依存関係をインストール
deno task install

# 開発サーバーを起動
deno task dev
```

### 4. Neo4j接続確認

ブラウザで `http://localhost:7474` にアクセスし、以下の認証情報でログインできることを確認：

- **URI:** bolt://localhost:7687
- **ユーザー名:** neo4j
- **パスワード:** password

## 🎯 使用方法

1. **ブラウザでアクセス**
   ```
   http://localhost:3000
   ```

2. **機能を試す**
   - **ユーザー管理タブ**: ユーザーの作成、表示、削除
   - **関係性管理タブ**: ユーザー間の関係性の作成、表示、削除

3. **GraphQL Playgroundを使用**
   ```
   http://localhost:3000/api/graphql
   ```

## 📁 プロジェクト構造

```
nextapp/
├── app/                          # Next.js App Router
│   ├── api/graphql/             # GraphQL API エンドポイント
│   ├── layout.tsx               # ルートレイアウト
│   ├── page.tsx                 # メインページ
│   └── providers.tsx            # Apollo Client プロバイダー
├── components/                   # Reactコンポーネント
│   ├── UserCard.tsx             # ユーザー表示カード
│   ├── UserForm.tsx             # ユーザー作成フォーム
│   ├── RelationshipForm.tsx     # 関係性作成フォーム
│   └── RelationshipList.tsx     # 関係性一覧表示
├── lib/                         # ライブラリとユーティリティ
│   ├── apollo-client.ts         # Apollo Client設定
│   ├── neo4j.ts                # Neo4j接続管理
│   ├── types.ts                # TypeScript型定義
│   └── graphql/                # GraphQL関連
│       ├── schema.ts           # GraphQLスキーマ定義
│       ├── resolvers.ts        # GraphQLリゾルバー
│       ├── server.ts           # Apollo Server設定
│       └── queries/            # GraphQLクエリ定義
│           ├── users.ts        # ユーザー関連クエリ
│           └── relationships.ts # 関係性関連クエリ
├── codegen.ts                   # GraphQL Code Generator設定
├── deno.json                    # Deno設定ファイル
└── .env.example                 # 環境変数テンプレート
```

## 🔧 主要なGraphQLスキーマ

### ユーザー型

```graphql
type User {
  id: ID!
  name: String!
  email: String!
  createdAt: String!
  friends: [User!]!
  friendsCount: Int!
}
```

### 関係性型

```graphql
type Relationship {
  id: ID!
  type: String!
  from: User!
  to: User!
  createdAt: String!
}
```

### 主要なクエリ

```graphql
# 全ユーザー取得
query GetUsers {
  users {
    id
    name
    email
    friendsCount
  }
}

# 関係性作成
mutation CreateRelationship($input: CreateRelationshipInput!) {
  createRelationship(input: $input) {
    id
    type
    from { name }
    to { name }
  }
}
```

## 🚦 コマンド一覧

### アプリケーション関連

```bash
# 開発サーバー起動
deno task dev

# 本番ビルド
deno task build

# 本番サーバー起動
deno task start

# リンター実行
deno task lint

# 型チェック
deno task type-check

# GraphQLコード生成
deno task codegen

# GraphQLコード生成（監視モード）
deno task codegen:watch
```

### Neo4j（Docker Compose）

```bash
# Neo4jを起動
docker-compose up -d

# Neo4jを停止
docker-compose down

# Neo4jを停止してデータも削除
docker-compose down -v

# ログを表示
docker-compose logs -f neo4j
```

## 🎨 技術的な特徴

### GraphQL統合

- **Apollo Server**: Next.js API routesとの統合
- **Apollo Client**: 型安全なクライアントサイドクエリ
- **Code Generation**: GraphQLスキーマからTypeScript型を自動生成
- **キャッシュ管理**: 効率的なデータキャッシュとリアルタイム更新

### Neo4j統合

- **シングルトンパターン**: 効率的な接続管理
- **Cypherクエリ**: グラフデータベース専用クエリ言語
- **関係性管理**: ユーザー間の双方向関係を自動管理
- **エラーハンドリング**: 接続エラーの適切な処理

### Next.js 15活用

- **App Router**: ファイルベースルーティング
- **Server Components**: サーバーサイドレンダリング
- **Client Components**: インタラクティブなUI
- **API Routes**: RESTful GraphQL エンドポイント

## 🔗 主要なCypherクエリ例

### ユーザー作成

```cypher
CREATE (u:User {
  id: randomUUID(),
  name: $name,
  email: $email,
  createdAt: toString(datetime().epochSeconds)
})
RETURN u
```

### 関係性作成（双方向）

```cypher
MATCH (from:User {id: $fromUserId}), (to:User {id: $toUserId})
CREATE (from)-[:FRIEND {type: $type, createdAt: toString(datetime().epochSeconds)}]->(to)
CREATE (to)-[:FRIEND {type: $type, createdAt: toString(datetime().epochSeconds)}]->(from)
```

### ユーザーと友達の取得

```cypher
MATCH (u:User {id: $userId})
OPTIONAL MATCH (u)-[:FRIEND]-(friend:User)
RETURN u, collect(friend) as friends
```

## 🐛 トラブルシューティング

### Neo4j接続エラー

```
Error: Neo4j connection failed
```

**解決方法:**
1. Neo4jが起動していることを確認: `docker-compose ps`
2. ヘルスチェックを確認: `docker-compose logs neo4j`
3. 接続情報を確認: `.env.local`の設定
4. ポート7687が使用可能か確認

### GraphQLエラー

```
Error: Cannot find module '@apollo/client'
```

**解決方法:**
```bash
# 依存関係を再インストール
deno task install

# キャッシュをクリア
deno cache --reload deno.json
```

### 型エラー

```
Type errors in GraphQL queries
```

**解決方法:**
```bash
# GraphQL型を再生成
deno task codegen
```

## 📈 今後の拡張案

- **グラフ可視化**: D3.js / Vis.jsによる関係性の視覚化
- **リアルタイム更新**: GraphQL Subscriptionsによるライブ更新
- **認証機能**: JWT認証とユーザーセッション管理
- **パス検索**: 最短経路やN次の友達検索
- **データエクスポート**: CSV/JSON形式でのデータエクスポート
- **パフォーマンス最適化**: DataLoaderやクエリ最適化

## 📄 ライセンス

MIT License