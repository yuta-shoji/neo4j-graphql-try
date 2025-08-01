import { ApolloServer } from '@apollo/server'
import { typeDefs } from './schema'
import { resolvers } from './resolvers'
import { connectToNeo4j } from '../neo4j'
import { NextRequest, NextResponse } from 'next/server'

// Apollo Serverインスタンスを作成
const server = new ApolloServer({
  typeDefs,
  resolvers,
  // 開発環境では詳細なエラー情報を表示
  introspection: process.env.NODE_ENV !== 'production',
  plugins: [
    // サーバー起動時にNeo4j接続を確認
    {
      async serverWillStart() {
        console.log('🚀 Apollo Server starting...')
        try {
          await connectToNeo4j()
          console.log('✅ Neo4j connection verified')
        } catch (error) {
          console.error('❌ Neo4j connection failed:', error)
        }
      }
    }
  ]
})

// サーバーを開始
let isServerStarted = false
async function ensureServerStarted() {
  if (!isServerStarted) {
    await server.start()
    isServerStarted = true
  }
}

// Next.js用のハンドラーを作成
export async function createHandler(request: NextRequest) {
  await ensureServerStarted()

  const body = request.method === 'POST' ? await request.text() : ''
  const url = new URL(request.url)
  
  try {
    // ヘッダーをMapに変換
    const headerMap = new Map<string, string>()
    for (const [key, value] of request.headers.entries()) {
      headerMap.set(key, value)
    }

    const response = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest: {
        method: request.method,
        headers: headerMap as any,
        search: url.searchParams.toString(),
        body: body || undefined
      },
      context: async () => ({ req: request })
    })

    // レスポンスヘッダーを設定
    const responseHeaders = new Headers()
    if (response.headers) {
      for (const [key, value] of Object.entries(response.headers)) {
        if (typeof value === 'string') {
          responseHeaders.set(key, value)
        }
      }
    }

    // Content-Typeを明示的に設定
    if (!responseHeaders.has('content-type')) {
      responseHeaders.set('content-type', 'application/json')
    }

    // CORS ヘッダーを設定
    responseHeaders.set('Access-Control-Allow-Origin', '*')
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    responseHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    // レスポンスボディを取得
    let responseBody = ''
    if (response.body.kind === 'complete') {
      responseBody = response.body.string
    } else {
      // chunked response の場合
      const chunks = []
      for await (const chunk of response.body.asyncIterator) {
        chunks.push(chunk)
      }
      responseBody = chunks.join('')
    }

    return new NextResponse(responseBody, {
      status: response.status || 200,
      headers: responseHeaders
    })
  } catch (error) {
    console.error('GraphQL execution error:', error)
    return new NextResponse(
      JSON.stringify({
        errors: [{ message: 'Internal server error' }]
      }),
      {
        status: 500,
        headers: { 'content-type': 'application/json' }
      }
    )
  }
} 