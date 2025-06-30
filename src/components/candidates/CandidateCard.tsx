import React from 'react'
import { Shield, CheckCircle, Clock, MapPin, DollarSign, Star, Calendar, Video, Award } from 'lucide-react'
import { CandidateSearchResult } from '../../services/candidateService'

interface CandidateCardProps {
  candidate: CandidateSearchResult
  onSelect?: (candidate: CandidateSearchResult) => void
  onAddToPipeline?: (candidate: CandidateSearchResult) => void
}

const CandidateCard: React.FC<CandidateCardProps> = ({ 
  candidate, 
  onSelect, 
  onAddToPipeline 
}) => {
  const currencies = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$',
    'ZAR': 'R',
    'INR': '₹',
    'SGD': 'S$',
    'JPY': '¥',
    'CHF': 'CHF'
  }

  const getVerificationBadge = () => {
    switch (candidate.verificationStatus) {
      case 'verified':
        return (
          <div className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold">
            <Shield className="w-4 h-4" />
            <span>ReelPass Verified</span>
          </div>
        )
      case 'partial':
        return (
          <div className="inline-flex items-center space-x-1 bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full text-sm font-semibold">
            <Shield className="w-4 h-4" />
            <span>Partially Verified</span>
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center space-x-1 bg-gray-500/20 text-gray-400 px-3 py-1 rounded-full text-sm">
            <Shield className="w-4 h-4" />
            <span>Unverified</span>
          </div>
        )
    }
  }

  const getAvailabilityBadge = () => {
    switch (candidate.availabilityStatus) {
      case 'available':
        return (
          <div className="inline-flex items-center space-x-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Available Now</span>
          </div>
        )
      case 'open':
        return (
          <div className="inline-flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-xs font-medium">
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
            <span>Open to Opportunities</span>
          </div>
        )
      default:
        return (
          <div className="inline-flex items-center space-x-1 bg-gray-500/20 text-gray-400 px-2 py-1 rounded-full text-xs">
            <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
            <span>Not Looking</span>
          </div>
        )
    }
  }

  const formatSalaryRange = () => {
    if (candidate.salaryExpectationMin && candidate.salaryExpectationMax) {
      const currencySymbol = currencies[candidate.currency as keyof typeof currencies] || '$'
      return `${currencySymbol}${candidate.salaryExpectationMin.toLocaleString()} - ${currencySymbol}${candidate.salaryExpectationMax.toLocaleString()}`
    }
    return null
  }

  return (
    <div className="bg-background-panel border border-gray-600 rounded-xl p-6 hover:border-primary-500 transition-all duration-200 cursor-pointer group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {candidate.firstName[0]}{candidate.lastName[0]}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary-400 transition-colors duration-200">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <p className="text-text-muted text-sm">{candidate.headline}</p>
            </div>
          </div>
          
          {/* Verification and Availability Badges */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {getVerificationBadge()}
            {getAvailabilityBadge()}
          </div>
        </div>
        
        {/* ReelPass Score */}
        <div className="text-center">
          <div className="text-2xl font-bold text-primary-400">{candidate.reelpassScore}</div>
          <div className="text-xs text-text-muted">ReelPass Score</div>
        </div>
      </div>

      {/* Availability Details */}
      {(candidate.availableFrom || candidate.noticePeriodDays || formatSalaryRange()) && (
        <div className="bg-background-card rounded-lg p-3 mb-4 space-y-2">
          {candidate.availableFrom && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Calendar className="w-4 h-4 text-primary-400" />
              <span>Available from {new Date(candidate.availableFrom).toLocaleDateString()}</span>
            </div>
          )}
          {candidate.noticePeriodDays && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <Clock className="w-4 h-4 text-yellow-400" />
              <span>{candidate.noticePeriodDays} days notice period</span>
            </div>
          )}
          {formatSalaryRange() && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span>{formatSalaryRange()}</span>
            </div>
          )}
          {candidate.preferredWorkType && (
            <div className="flex items-center space-x-2 text-sm text-text-secondary">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span className="capitalize">{candidate.preferredWorkType} work</span>
            </div>
          )}
        </div>
      )}

      {/* Skills */}
      <div className="mb-4">
        <div className="flex flex-wrap gap-2">
          {candidate.skills.slice(0, 4).map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
          {candidate.skills.length > 4 && (
            <span className="px-3 py-1 bg-background-card text-text-muted rounded-full text-sm">
              +{candidate.skills.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Location Preferences */}
      {candidate.locationPreferences && candidate.locationPreferences.length > 0 && (
        <div className="mb-4">
          <div className="flex items-center space-x-2 text-sm text-text-muted">
            <MapPin className="w-4 h-4" />
            <span>Prefers: {candidate.locationPreferences.join(', ')}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-600">
        <div className="text-xs text-text-muted">
          Last active: {new Date(candidate.lastActive).toLocaleDateString()}
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onSelect?.(candidate)}
            className="text-primary-400 hover:text-primary-300 font-medium text-sm transition-colors duration-200"
          >
            View Profile
          </button>
          <button
            onClick={() => onAddToPipeline?.(candidate)}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Add to Pipeline
          </button>
        </div>
      </div>
    </div>
  )
}

export default CandidateCard