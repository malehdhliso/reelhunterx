import React, { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import LoginModal from '../modals/LoginModal'

const LoginManager: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [showLogin, setShowLogin] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      setShowLogin(false)
      return
    }

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (target && target.closest('button')) {
        setShowLogin(true)
      }
    }

    window.addEventListener('click', clickHandler, true)
    return () => {
      window.removeEventListener('click', clickHandler, true)
    }
  }, [isAuthenticated])

  if (!showLogin) return null

  return <LoginModal onClose={() => setShowLogin(false)} />
}

export default LoginManager 