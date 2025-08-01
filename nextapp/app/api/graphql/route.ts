import { NextRequest, NextResponse } from 'next/server'
import { createHandler } from '@/lib/graphql/server'

// OPTIONS リクエスト（CORS プリフライト）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    }
  })
}

// GET リクエスト（GraphQL Playground用）
export async function GET(request: NextRequest) {
  return createHandler(request)
}

// POST リクエスト（GraphQLクエリ/ミューテーション用）
export async function POST(request: NextRequest) {
  return createHandler(request)
} 