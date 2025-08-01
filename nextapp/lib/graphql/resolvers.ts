import { runCypher } from '../neo4j'
import type { CreateUserInput, CreateRelationshipInput, User, Relationship } from '../types'

// ユーザー関連のリゾルバー
const userResolvers = {
  // ユーザーの友達リストを取得
  friends: async (parent: User) => {
    const cypher = `
      MATCH (u:User {id: $userId})-[:FRIEND]-(friend:User)
      RETURN friend.id as id, friend.name as name, friend.email as email, friend.createdAt as createdAt
      ORDER BY friend.name
    `
    const results = await runCypher(cypher, { userId: parent.id })
    return results
  },

  // 友達の数を取得
  friendsCount: async (parent: User) => {
    const cypher = `
      MATCH (u:User {id: $userId})-[:FRIEND]-(friend:User)
      RETURN count(friend) as count
    `
    const results = await runCypher(cypher, { userId: parent.id })
    return results[0]?.count || 0
  }
}

// クエリリゾルバー
const queryResolvers = {
  // 全ユーザー取得
  users: async () => {
    const cypher = `
      MATCH (u:User)
      RETURN u.id as id, u.name as name, u.email as email, u.createdAt as createdAt
      ORDER BY u.name
    `
    return await runCypher(cypher)
  },

  // 特定ユーザー取得
  user: async (_: any, { id }: { id: string }) => {
    const cypher = `
      MATCH (u:User {id: $id})
      RETURN u.id as id, u.name as name, u.email as email, u.createdAt as createdAt
    `
    const results = await runCypher(cypher, { id })
    return results[0] || null
  },

  // ユーザーの友達リスト取得
  userFriends: async (_: any, { userId }: { userId: string }) => {
    const cypher = `
      MATCH (u:User {id: $userId})-[:FRIEND]-(friend:User)
      RETURN friend.id as id, friend.name as name, friend.email as email, friend.createdAt as createdAt
      ORDER BY friend.name
    `
    return await runCypher(cypher, { userId })
  },

  // 全関係性取得
  relationships: async () => {
    const cypher = `
      MATCH (from:User)-[r:FRIEND]->(to:User)
      RETURN r.id as id, r.type as type, from.id as fromUserId, to.id as toUserId, r.createdAt as createdAt
      ORDER BY r.createdAt DESC
    `
    const results = await runCypher(cypher)
    
    // 関係性の詳細情報を取得
    const enrichedResults = []
    for (const rel of results) {
      const fromUserCypher = `MATCH (u:User {id: $fromUserId}) RETURN u.id as id, u.name as name, u.email as email, u.createdAt as createdAt`
      const toUserCypher = `MATCH (u:User {id: $toUserId}) RETURN u.id as id, u.name as name, u.email as email, u.createdAt as createdAt`
      
      const [fromUser] = await runCypher(fromUserCypher, { fromUserId: rel.fromUserId })
      const [toUser] = await runCypher(toUserCypher, { toUserId: rel.toUserId })
      
      enrichedResults.push({
        ...rel,
        from: fromUser,
        to: toUser
      })
    }
    
    return enrichedResults
  },

  // 関係性の存在チェック
  relationshipExists: async (_: any, { fromUserId, toUserId }: { fromUserId: string, toUserId: string }) => {
    const cypher = `
      MATCH (from:User {id: $fromUserId})-[:FRIEND]-(to:User {id: $toUserId})
      RETURN count(*) > 0 as exists
    `
    const results = await runCypher(cypher, { fromUserId, toUserId })
    return results[0]?.exists || false
  }
}

// ミューテーションリゾルバー
const mutationResolvers = {
  // ユーザー作成
  createUser: async (_: any, { input }: { input: CreateUserInput }) => {
    // まずメールアドレスの重複チェック
    const checkCypher = `
      MATCH (u:User {email: $email})
      RETURN count(u) as count
    `
    const existingUsers = await runCypher(checkCypher, { email: input.email })
    
    if (existingUsers[0]?.count > 0) {
      throw new Error('このメールアドレスは既に使用されています')
    }

    const cypher = `
      CREATE (u:User {
        id: randomUUID(),
        name: $name,
        email: $email,
        createdAt: toString(datetime().epochSeconds)
      })
      RETURN u.id as id, u.name as name, u.email as email, u.createdAt as createdAt
    `
    const results = await runCypher(cypher, input)
    return results[0]
  },

  // ユーザー削除
  deleteUser: async (_: any, { id }: { id: string }) => {
    // ユーザーの存在確認
    const checkCypher = `MATCH (u:User {id: $id}) RETURN count(u) as count`
    const existingUsers = await runCypher(checkCypher, { id })
    
    if (existingUsers[0]?.count === 0) {
      throw new Error('ユーザーが見つかりません')
    }

    // 関係性とユーザーを削除
    const cypher = `
      MATCH (u:User {id: $id})
      DETACH DELETE u
      RETURN true as success
    `
    await runCypher(cypher, { id })
    return true
  },

  // 関係性作成
  createRelationship: async (_: any, { input }: { input: CreateRelationshipInput }) => {
    const { fromUserId, toUserId, type } = input

    // 自分自身との関係性はNG
    if (fromUserId === toUserId) {
      throw new Error('自分自身との関係性は作成できません')
    }

    // 既存の関係性チェック
    const checkCypher = `
      MATCH (from:User {id: $fromUserId})-[:FRIEND]-(to:User {id: $toUserId})
      RETURN count(*) as count
    `
    const existing = await runCypher(checkCypher, { fromUserId, toUserId })
    
    if (existing[0]?.count > 0) {
      throw new Error('この関係性は既に存在しています')
    }

    // 双方向の関係性を作成
    const cypher = `
      MATCH (from:User {id: $fromUserId}), (to:User {id: $toUserId})
      CREATE (from)-[r1:FRIEND {
        id: randomUUID(),
        type: $type,
        createdAt: toString(datetime().epochSeconds)
      }]->(to)
      CREATE (to)-[r2:FRIEND {
        id: randomUUID(),
        type: $type,
        createdAt: toString(datetime().epochSeconds)
      }]->(from)
      RETURN r1.id as id, r1.type as type, from.id as fromUserId, to.id as toUserId, r1.createdAt as createdAt
    `
    const results = await runCypher(cypher, { fromUserId, toUserId, type })
    
    // from と to のユーザー情報を取得
    const fromUserCypher = `MATCH (u:User {id: $fromUserId}) RETURN u.id as id, u.name as name, u.email as email, u.createdAt as createdAt`
    const toUserCypher = `MATCH (u:User {id: $toUserId}) RETURN u.id as id, u.name as name, u.email as email, u.createdAt as createdAt`
    
    const [fromUser] = await runCypher(fromUserCypher, { fromUserId })
    const [toUser] = await runCypher(toUserCypher, { toUserId })
    
    return {
      ...results[0],
      from: fromUser,
      to: toUser
    }
  },

  // 関係性削除
  deleteRelationship: async (_: any, { fromUserId, toUserId }: { fromUserId: string, toUserId: string }) => {
    // 双方向の関係性を削除
    const cypher = `
      MATCH (from:User {id: $fromUserId})-[r:FRIEND]-(to:User {id: $toUserId})
      DELETE r
      RETURN count(r) as deletedCount
    `
    const results = await runCypher(cypher, { fromUserId, toUserId })
    return results[0]?.deletedCount > 0
  }
}

// 全てのリゾルバーをまとめる
export const resolvers = {
  User: userResolvers,
  Query: queryResolvers,
  Mutation: mutationResolvers
} 