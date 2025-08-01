'use client'

import { useQuery, useMutation } from '@apollo/client'
import { GET_RELATIONSHIPS, DELETE_RELATIONSHIP } from '@/lib/graphql/queries/relationships'

interface Relationship {
  id: string
  type: string
  createdAt: string
  from: {
    id: string
    name: string
    email: string
  }
  to: {
    id: string
    name: string
    email: string
  }
}

export function RelationshipList() {
  const { data, loading, error } = useQuery(GET_RELATIONSHIPS)
  const [deleteRelationship] = useMutation(DELETE_RELATIONSHIP, {
    refetchQueries: [{ query: GET_RELATIONSHIPS }],
    onError: (error) => {
      console.error('関係性削除エラー:', error)
      alert('関係性の削除に失敗しました: ' + error.message)
    }
  })

  const handleDelete = async (relationship: Relationship) => {
    if (!confirm(`「${relationship.from.name}」と「${relationship.to.name}」の関係性を削除しますか？`)) {
      return
    }

    try {
      await deleteRelationship({
        variables: {
          fromUserId: relationship.from.id,
          toUserId: relationship.to.id
        }
      })
    } catch (error) {
      console.error('削除処理エラー:', error)
    }
  }

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000)
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">読み込み中...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">エラーが発生しました: {error.message}</p>
      </div>
    )
  }

  const relationships = data?.relationships || []

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">関係性一覧 ({relationships.length}件)</h3>
      
      {relationships.length === 0 ? (
        <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg text-center">
          <p className="text-gray-600">まだ関係性が作成されていません。</p>
          <p className="text-sm text-gray-500 mt-1">上記のフォームから新しい関係性を作成してください。</p>
        </div>
      ) : (
        <div className="space-y-3">
          {relationships.map((relationship: Relationship) => (
            <div
              key={relationship.id}
              className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">{relationship.from.name}</span>
                      <span className="text-gray-500 mx-2">←→</span>
                      <span className="font-medium text-gray-900">{relationship.to.name}</span>
                    </div>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      {relationship.type}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <div>{relationship.from.email} ←→ {relationship.to.email}</div>
                    <div className="mt-1">作成日: {formatDate(relationship.createdAt)}</div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleDelete(relationship)}
                  className="ml-3 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                  title="関係性を削除"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 