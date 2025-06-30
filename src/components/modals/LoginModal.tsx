import React, { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoadingSpinner from '../common/LoadingSpinner'

interface LoginModalProps {
  onClose?: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ onClose }) => {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    try {
      setIsSubmitting(true)
      await signIn(email, password)
      setIsSubmitting(false)
      onClose?.()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Failed to sign in')
      }
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
        <h2 className="mb-4 text-2xl font-semibold text-center">Sign in to ReelHunter</h2>
        {error && (
          <div className="p-2 mb-4 text-sm text-red-600 bg-red-50 rounded-md border border-red-200">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              required
            />
          </div>
          <button
            type="submit"
            className="relative inline-flex items-center justify-center w-full px-4 py-2 font-semibold text-white bg-primary-500 rounded-md disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting && (
              <span className="absolute left-3">
                <LoadingSpinner size="sm" />
              </span>
            )}
            Sign In
          </button>
        </form>
      </div>
    </div>
  )
}

export default LoginModal 