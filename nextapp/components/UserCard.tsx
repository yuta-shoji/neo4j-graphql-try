'use client'

import { useMutation } from '@apollo/client'
import { DELETE_USER, GET_USERS } from '@/lib/graphql/queries/users'

interface User {
  id: string
  name: string
  email: string
  createdAt: string
  friendsCount: number
}

interface UserCardProps {
  user: User
  onSelect?: (user: User) => void
  isSelected?: boolean
}

export function UserCard({ user, onSelect, isSelected = false }: UserCardProps) {
  const [deleteUser, { loading: deleting }] = useMutation(DELETE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    onError: (error) => {
      console.error('ユーザー削除エラー:', error)
      alert('ユーザーの削除に失敗しました: ' + error.message)
    }
  })

  const handleDelete = async () => {
    if (!confirm(`「${user.name}」を削除しますか？この操作は取り消せません。`)) {
      return
    }

    try {
      await deleteUser({
        variables: { id: user.id }
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

  return (
    <div 
      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
        isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
      }`}
      onClick={() => onSelect?.(user)}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
          <p className="text-sm text-gray-600">{user.email}</p>
          <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
            <span>作成日: {formatDate(user.createdAt)}</span>
            <span>友達: {user.friendsCount}人</span>
          </div>
        </div>
        
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete()
          }}
          disabled={deleting}
          className="ml-3 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
          title="ユーザーを削除"
        >
          {deleting ? (
            <span className="text-xs">削除中...</span>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>
    </div>
  )
} 