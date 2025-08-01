'use client'

import { useState } from 'react'
import { useQuery } from '@apollo/client'
import { UserForm } from '@/components/UserForm'
import { UserCard } from '@/components/UserCard'
import { RelationshipForm } from '@/components/RelationshipForm'
import { RelationshipList } from '@/components/RelationshipList'
import { GET_USERS } from '@/lib/graphql/queries/users'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'users' | 'relationships'>('users')
  const [selectedUser, setSelectedUser] = useState<any>(null)

  const { data: usersData, loading: usersLoading, error: usersError } = useQuery(GET_USERS)

  const users = usersData?.users || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Neo4j × GraphQL × Next.js
          </h1>
          <p className="mt-2 text-gray-600">
            ユーザー関係性管理アプリケーション
          </p>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ユーザー管理
            </button>
            <button
              onClick={() => setActiveTab('relationships')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'relationships'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              関係性管理
            </button>
          </nav>
        </div>

        {/* コンテンツエリア */}
        <div className="mt-6">
          {activeTab === 'users' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ユーザー作成フォーム */}
              <div>
                <UserForm onSuccess={() => setSelectedUser(null)} />
              </div>

              {/* ユーザー一覧 */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  ユーザー一覧 ({users.length}人)
                </h3>
                
                {usersLoading && (
                  <div className="flex items-center justify-center p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-600">読み込み中...</span>
                  </div>
                )}

                {usersError && (
                  <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600">エラーが発生しました: {usersError.message}</p>
                  </div>
                )}

                {!usersLoading && !usersError && users.length === 0 && (
                  <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
                    <p className="text-gray-600">まだユーザーが作成されていません。</p>
                    <p className="text-sm text-gray-500 mt-1">左側のフォームから新しいユーザーを作成してください。</p>
                  </div>
                )}

                {!usersLoading && !usersError && users.length > 0 && (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {users.map((user: any) => (
                      <UserCard
                        key={user.id}
                        user={user}
                        onSelect={setSelectedUser}
                        isSelected={selectedUser?.id === user.id}
                      />
                    ))}
                  </div>
                )}

                {/* 選択されたユーザーの詳細 */}
                {selectedUser && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-medium text-blue-900">選択中のユーザー</h4>
                    <p className="text-sm text-blue-700">
                      {selectedUser.name} ({selectedUser.email})
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      友達: {selectedUser.friendsCount}人
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'relationships' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 関係性作成フォーム */}
              <div>
                <RelationshipForm />
              </div>

              {/* 関係性一覧 */}
              <div>
                <RelationshipList />
              </div>
            </div>
          )}
        </div>

        {/* GraphQLエンドポイント情報 */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">開発者向け情報</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>GraphQLエンドポイント: <code className="bg-gray-200 px-1 rounded">/api/graphql</code></p>
            <p>Apollo Studio: <a href="/api/graphql" target="_blank" className="text-blue-600 hover:underline">GraphQL Playgroundを開く</a></p>
            <p>Neo4j Browser: <a href="http://localhost:7474" target="_blank" className="text-blue-600 hover:underline">Neo4j ブラウザを開く</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}
