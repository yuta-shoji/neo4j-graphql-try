import { gql } from '@apollo/client'

// 全関係性取得クエリ
export const GET_RELATIONSHIPS = gql`
  query GetRelationships {
    relationships {
      id
      type
      createdAt
      from {
        id
        name
        email
      }
      to {
        id
        name
        email
      }
    }
  }
`

// 関係性存在チェッククエリ
export const CHECK_RELATIONSHIP_EXISTS = gql`
  query CheckRelationshipExists($fromUserId: ID!, $toUserId: ID!) {
    relationshipExists(fromUserId: $fromUserId, toUserId: $toUserId)
  }
`

// 関係性作成ミューテーション
export const CREATE_RELATIONSHIP = gql`
  mutation CreateRelationship($input: CreateRelationshipInput!) {
    createRelationship(input: $input) {
      id
      type
      createdAt
      from {
        id
        name
        email
      }
      to {
        id
        name
        email
      }
    }
  }
`

// 関係性削除ミューテーション
export const DELETE_RELATIONSHIP = gql`
  mutation DeleteRelationship($fromUserId: ID!, $toUserId: ID!) {
    deleteRelationship(fromUserId: $fromUserId, toUserId: $toUserId)
  }
` 