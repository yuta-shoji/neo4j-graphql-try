'use client'

import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_USER, GET_USERS } from '@/lib/graphql/queries/users'

interface UserFormProps {
  onSuccess?: () => void
}

export function UserForm({ onSuccess }: UserFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [createUser, { loading, error }] = useMutation(CREATE_USER, {
    refetchQueries: [{ query: GET_USERS }],
    onCompleted: () => {
      setName('')
      setEmail('')
      onSuccess?.()
    },
    onError: (error) => {
      console.error('ユーザー作成エラー:', error)
    }
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return

    setIsSubmitting(true)
    try {
      await createUser({
        variables: {
          input: {
            name: name.trim(),
            email: email.trim()
          }
        }
      })
    } catch (err) {
      console.error('送信エラー:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-900">新しいユーザーを作成</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">
            エラー: {error.message}
          </p>
        </div>
      )}

      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          名前
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="例: 田中太郎"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          メールアドレス
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="例: tanaka@example.com"
        />
      </div>

      <button
        type="submit"
        disabled={loading || isSubmitting || !name.trim() || !email.trim()}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading || isSubmitting ? '作成中...' : 'ユーザーを作成'}
      </button>
    </form>
  )
} 