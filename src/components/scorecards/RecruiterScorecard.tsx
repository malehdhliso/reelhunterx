import React, { useState, useEffect } from 'react'
import { Star, MessageSquare, Award, Target, TrendingUp, Users, Filter, Search, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { getRecruiterRatings, type RecruiterRating } from '../../services/recruiterService'

const RecruiterScorecard: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'recent'>('rating')
  const [recruiters, setRecruiters] = useState<RecruiterRating[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      loadRecruiterRatings()
    }
  }, [isAuthenticated])

  const loadRecruiterRatings = async () => {
    try {
      setIsLoading(true)
      const ratings = await getRecruiterRatings()
      setRecruiters(ratings)
    } catch (error) {
      console.error('Failed to load recruiter ratings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRatingLevel = (rating: number) => {
    if (rating >= 4.5) return { text: 'Excellent', class: 'bg-primary-500/20 text-primary-400 border-primary-500/30' }
    if (rating >= 4.0) return { text: 'Very Good', class: 'bg-background-card text-text-primary border-gray-600' }
    if (rating >= 3.5) return { text: 'Good', class: 'bg-background-card text-text-secondary border-gray-600' }
    if (rating >= 3.0) return { text: 'Fair', class: 'bg-background-card text-text-muted border-gray-600' }
    return { text: 'Poor', class: 'bg-background-card text-text-muted border-gray-600' }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-primary-400 fill-current'
            : i < rating
            ? 'text-primary-400 fill-current opacity-50'
            : 'text-gray-600'
        }`}
      />
    ))
  }

  const filteredRecruiters = recruiters
    .filter(recruiter =>
      recruiter.recruiterName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recruiter.recruiterEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.overallRating - a.overallRating
        case 'reviews':
          return b.totalReviews - a.totalReviews
        case 'recent':
          return new Date(b.recentFeedback[0]?.date || 0).getTime() - new Date(a.recentFeedback[0]?.date || 0).getTime()
        default:
          return 0
      }
    })

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 mb-6">
            <div className="p-4 bg-primary-500/10 rounded-2xl">
              <Award className="w-10 h-10 text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary">Recruiter Scorecard</h1>
          </div>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Please log in to view recruiter ratings and reviews
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-text-muted">Loading recruiter scorecards...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 mb-6">
          <div className="p-4 bg-primary-500/10 rounded-2xl">
            <Award className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-4xl font-bold text-text-primary">Recruiter Scorecard</h1>
        </div>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
          Public ratings and reviews from candidates ensure recruiter accountability and transparency
        </p>
      </div>

      {/* Search and Filters */}
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
            <input
              type="text"
              placeholder="Search recruiters by name or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-background-panel border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-3 bg-background-panel border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="rating">Sort by Rating</option>
            <option value="reviews">Sort by Review Count</option>
            <option value="recent">Sort by Recent Activity</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredRecruiters.length === 0 && (
        <div className="max-w-4xl mx-auto text-center py-12">
          <Award className="w-16 h-16 text-text-muted mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-text-primary mb-2">No recruiter reviews yet</h3>
          <p className="text-text-muted mb-6">
            {searchQuery ? 'No recruiters match your search criteria.' : 'Be the first to rate a recruiter and help build transparency in the hiring process.'}
          </p>
          {!searchQuery && (
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200">
              Submit a Review
            </button>
          )}
        </div>
      )}

      {/* Recruiter Cards */}
      {filteredRecruiters.length > 0 && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {filteredRecruiters.map(recruiter => {
            const ratingLevel = getRatingLevel(recruiter.overallRating)
            
            return (
              <div key={recruiter.id} className="bg-background-panel border border-gray-600 rounded-xl p-6">
                {/* Recruiter Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-xl">
                        {recruiter.recruiterName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary">{recruiter.recruiterName}</h3>
                      <p className="text-text-muted text-sm">{recruiter.recruiterEmail}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${ratingLevel.class}`}>
                          {ratingLevel.text}
                        </span>
                        <span className="text-text-muted text-sm">• {recruiter.totalReviews} reviews</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Overall Rating */}
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary-400">
                      {recruiter.overallRating.toFixed(1)}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      {renderStars(recruiter.overallRating)}
                    </div>
                  </div>
                </div>

                {/* Rating Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-background-card rounded-lg border border-gray-600">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <MessageSquare className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-text-primary">Communication</span>
                    </div>
                    <div className="text-lg font-bold text-text-primary">
                      {recruiter.avgCommunication.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-background-card rounded-lg border border-gray-600">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Award className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-text-primary">Professionalism</span>
                    </div>
                    <div className="text-lg font-bold text-text-primary">
                      {recruiter.avgProfessionalism.toFixed(1)}
                    </div>
                  </div>
                  
                  <div className="text-center p-3 bg-background-card rounded-lg border border-gray-600">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Target className="w-4 h-4 text-primary-400" />
                      <span className="text-sm font-medium text-text-primary">Role Accuracy</span>
                    </div>
                    <div className="text-lg font-bold text-text-primary">
                      {recruiter.avgRoleAccuracy.toFixed(1)}
                    </div>
                  </div>
                </div>

                {/* Review Summary */}
                <div className="flex items-center justify-between mb-4 p-3 bg-background-card rounded-lg border border-gray-600">
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-400">{recruiter.positiveReviews}</div>
                      <div className="text-xs text-text-muted">Positive</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-text-muted">{recruiter.negativeReviews}</div>
                      <div className="text-xs text-text-muted">Negative</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-text-primary">
                      {recruiter.totalReviews > 0 ? Math.round((recruiter.positiveReviews / recruiter.totalReviews) * 100) : 0}% Positive
                    </div>
                    <div className="text-xs text-text-muted">Recommendation Rate</div>
                  </div>
                </div>

                {/* Recent Feedback */}
                {recruiter.recentFeedback.length > 0 && (
                  <div className="border-t border-gray-600 pt-4">
                    <h4 className="text-sm font-semibold text-text-primary mb-3">Recent Feedback</h4>
                    {recruiter.recentFeedback.slice(0, 1).map((feedback, index) => (
                      <div key={index} className="bg-background-card rounded-lg p-4 border border-gray-600">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-text-primary">{feedback.candidateName}</span>
                            <span className="text-xs text-text-muted">• {feedback.jobTitle}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            {renderStars(feedback.rating)}
                          </div>
                        </div>
                        <p className="text-sm text-text-secondary italic">"{feedback.feedback}"</p>
                        <div className="text-xs text-text-muted mt-2">
                          {new Date(feedback.date).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Call to Action */}
      <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-8 text-center">
        <h3 className="text-2xl font-semibold text-text-primary mb-4">Rate Your Recruiter Experience</h3>
        <p className="text-text-secondary mb-6 text-lg leading-relaxed">
          Help other candidates by sharing your experience with recruiters. Your feedback drives accountability and improves the hiring process for everyone.
        </p>
        <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
          Submit a Review
        </button>
      </div>
    </div>
  )
}

export default RecruiterScorecard