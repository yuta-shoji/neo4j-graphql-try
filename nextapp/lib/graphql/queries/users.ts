import { gql } from '@apollo/client'

// 全ユーザー取得クエリ
export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      createdAt
      friendsCount
    }
  }
`

// 特定ユーザー取得クエリ
export const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
      createdAt
      friends {
        id
        name
        email
      }
      friendsCount
    }
  }
`

// ユーザーの友達リスト取得クエリ
export const GET_USER_FRIENDS = gql`
  query GetUserFriends($userId: ID!) {
    userFriends(userId: $userId) {
      id
      name
      email
      createdAt
    }
  }
`

// ユーザー作成ミューテーション
export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      id
      name
      email
      createdAt
    }
  }
`

// ユーザー削除ミューテーション
export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
` 