// ユーザーの型定義
export interface User {
  id: string
  name: string
  email: string
  createdAt: number
}

// 関係性の型定義
export interface Relationship {
  id: string
  type: string
  fromUserId: string
  toUserId: string
  createdAt: number
}

// GraphQL入力型
export interface CreateUserInput {
  name: string
  email: string
}

export interface CreateRelationshipInput {
  fromUserId: string
  toUserId: string
  type: string
}

// GraphQLクエリの結果型
export interface UserWithRelationships extends User {
  friends: User[]
  friendsCount: number
}

// レスポンス型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
} 