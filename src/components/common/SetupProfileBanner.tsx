import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface SetupProfileBannerProps {
  className?: string
}

const SetupProfileBanner: React.FC<SetupProfileBannerProps> = ({ className = '' }) => {
  const { user, isAuthenticated } = useAuth()
  
  // Don't show for non-authenticated users
  if (!isAuthenticated || !user) {
    return null
  }
  
  return (
    <div className={`bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 ${className}`}>
      <div className="flex items-center space-x-3">
        <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-400">Complete Your Profile</h3>
          <p className="text-yellow-300 text-sm">
            Your profile needs to be completed to be discoverable by recruiters.
          </p>
        </div>
        <Link
          to="/setup-profile"
          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 whitespace-nowrap"
        >
          Setup Profile
        </Link>
      </div>
    </div>
  )
}

export default SetupProfileBanner