import neo4j, { Driver, Session } from 'neo4j-driver'

class Neo4jDatabase {
  private driver: Driver | null = null

  async connect(): Promise<Driver> {
    if (this.driver) {
      return this.driver
    }

    const uri = process.env.NEO4J_URI || 'bolt://localhost:7687'
    const username = process.env.NEO4J_USERNAME || 'neo4j'
    const password = process.env.NEO4J_PASSWORD || 'password'

    try {
      this.driver = neo4j.driver(uri, neo4j.auth.basic(username, password))
      
      // 接続テスト
      const serverInfo = await this.driver.getServerInfo()
      console.log('Neo4j connection established:', serverInfo.address)
      
      return this.driver
    } catch (error) {
      console.error('Failed to connect to Neo4j:', error)
      throw error
    }
  }

  async getSession(): Promise<Session> {
    const driver = await this.connect()
    return driver.session()
  }

  async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close()
      this.driver = null
    }
  }

  // クエリ実行用のヘルパーメソッド
  async runQuery(cypher: string, parameters: Record<string, any> = {}): Promise<any[]> {
    const session = await this.getSession()
    try {
      const result = await session.run(cypher, parameters)
      return result.records.map(record => record.toObject())
    } finally {
      await session.close()
    }
  }
}

// シングルトンインスタンス
export const neo4jDB = new Neo4jDatabase()

// エクスポートする関数群
export async function connectToNeo4j(): Promise<Driver> {
  return await neo4jDB.connect()
}

export async function runCypher(cypher: string, parameters: Record<string, any> = {}): Promise<any[]> {
  return await neo4jDB.runQuery(cypher, parameters)
}

export async function closeNeo4j(): Promise<void> {
  await neo4jDB.close()
} 