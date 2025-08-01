import gql from 'graphql-tag'

export const typeDefs = gql`
  # ユーザー型定義
  type User {
    id: ID!
    name: String!
    email: String!
    createdAt: String!
    friends: [User!]!
    friendsCount: Int!
  }

  # 関係性型定義
  type Relationship {
    id: ID!
    type: String!
    from: User!
    to: User!
    createdAt: String!
  }

  # 入力型定義
  input CreateUserInput {
    name: String!
    email: String!
  }

  input CreateRelationshipInput {
    fromUserId: ID!
    toUserId: ID!
    type: String!
  }

  # クエリ定義
  type Query {
    # 全ユーザー取得
    users: [User!]!
    
    # 特定ユーザー取得
    user(id: ID!): User
    
    # ユーザーの友達リスト取得
    userFriends(userId: ID!): [User!]!
    
    # 全関係性取得
    relationships: [Relationship!]!
    
    # ユーザー間の関係性チェック
    relationshipExists(fromUserId: ID!, toUserId: ID!): Boolean!
  }

  # ミューテーション定義
  type Mutation {
    # ユーザー作成
    createUser(input: CreateUserInput!): User!
    
    # ユーザー削除
    deleteUser(id: ID!): Boolean!
    
    # 関係性作成
    createRelationship(input: CreateRelationshipInput!): Relationship!
    
    # 関係性削除
    deleteRelationship(fromUserId: ID!, toUserId: ID!): Boolean!
  }
` 