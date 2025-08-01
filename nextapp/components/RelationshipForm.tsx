'use client'

import { useState } from 'react'
import { useQuery, useMutation } from '@apollo/client'
import { CREATE_RELATIONSHIP, GET_RELATIONSHIPS } from '@/lib/graphql/queries/relationships'
import { GET_USERS } from '@/lib/graphql/queries/users'

interface RelationshipFormProps {
  onSuccess?: () => void
}

export function RelationshipForm({ onSuccess }: RelationshipFormProps) {
  const [fromUserId, setFromUserId] = useState('')
  const [toUserId, setToUserId] = useState('')
  const [type, setType] = useState('友達')

  const { data: usersData, loading: usersLoading } = useQuery(GET_USERS)
  
  const [createRelationship, { loading, error }] = useMutation(CREATE_RELATIONSHIP, {
    refetchQueries: [
      { query: GET_RELATIONSHIPS },
      { query: GET_USERS }
    ],
    onCompleted: () => {
      setFromUserId('')
      setToUserId('')
      setType('友達')
      onSuccess?.()
    },
    onError: (error) => {
      console.error('関係性作成エラー:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!fromUserId || !toUserId || fromUserId === toUserId) return

    try {
      await createRelationship({
        variables: {
          input: {
            fromUserId,
            toUserId,
            type
          }
        }
      })
    } catch (err) {
      console.error('送信エラー:', err)
    }
  }

  const users = usersData?.users || []

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">新しい関係性を作成</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            エラー: {error.message}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="fromUser" className="block text-sm font-medium text-gray-700">
          ユーザー1
        </label>
        <select
          id="fromUser"
          value={fromUserId}
          onChange={(e) => setFromUserId(e.target.value)}
          required
          disabled={usersLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">ユーザーを選択してください</option>
          {users.map((user: any) => (
            <option key={user.id} value={user.id}>
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="toUser" className="block text-sm font-medium text-gray-700">
          ユーザー2
        </label>
        <select
          id="toUser"
          value={toUserId}
          onChange={(e) => setToUserId(e.target.value)}
          required
          disabled={usersLoading}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">ユーザーを選択してください</option>
          {users.map((user: any) => (
            <option 
              key={user.id} 
              value={user.id}
              disabled={user.id === fromUserId}
            >
              {user.name} ({user.email})
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          関係性の種類
        </label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="友達">友達</option>
          <option value="同僚">同僚</option>
          <option value="家族">家族</option>
          <option value="知人">知人</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading || !fromUserId || !toUserId || fromUserId === toUserId}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? '作成中...' : '関係性を作成'}
      </button>

      {users.length < 2 && (
        <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
          関係性を作成するには、最低2人のユーザーが必要です。
        </p>
      )}
    </form>
  )
} 