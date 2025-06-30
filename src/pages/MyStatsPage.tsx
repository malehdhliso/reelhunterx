import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { BarChart3, TrendingUp, TrendingDown, Users, Clock, DollarSign, Target, Star, MessageSquare, Award, AlertTriangle, CheckCircle, X, Send, RefreshCw, Lightbulb, Shield, Eye, EyeOff } from 'lucide-react'

interface RecruiterStats {
  totalReviews: number
  avgCommunication: number
  avgProfessionalism: number
  avgRoleAccuracy: number
  overallRating: number
  positiveReviews: number
  negativeReviews: number
  monthlyTrend: number
  placementSuccess: number
  responseTime: number
  candidateNPS: number
}

interface Review {
  id: string
  candidateName: string
  jobTitle: string
  rating: number
  feedback: string
  date: string
  communicationRating: number
  professionalismRating: number
  roleAccuracyRating: number
  isPublic: boolean
  disputed: boolean
}

interface AIInsight {
  type: 'improvement' | 'strength' | 'warning'
  category: string
  title: string
  description: string
  actionItems: string[]
  priority: 'high' | 'medium' | 'low'
}

const MyStatsPage: React.FC = () => {
  const [stats, setStats] = useState<RecruiterStats>({
    totalReviews: 47,
    avgCommunication: 4.6,
    avgProfessionalism: 4.8,
    avgRoleAccuracy: 4.4,
    overallRating: 4.6,
    positiveReviews: 42,
    negativeReviews: 2,
    monthlyTrend: 0.3,
    placementSuccess: 85,
    responseTime: 2.4,
    candidateNPS: 72
  })

  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      candidateName: 'Anonymous Candidate',
      jobTitle: 'Senior React Developer',
      rating: 5,
      feedback: 'Excellent communication throughout the process. Very professional and transparent about the role requirements. The interview process was well-structured and respectful of my time.',
      date: '2024-01-10',
      communicationRating: 5,
      professionalismRating: 5,
      roleAccuracyRating: 4,
      isPublic: true,
      disputed: false
    },
    {
      id: '2',
      candidateName: 'Anonymous Candidate',
      jobTitle: 'Full Stack Developer',
      rating: 2,
      feedback: 'Role description did not match actual requirements. Poor communication after initial contact. Felt like my time was wasted.',
      date: '2024-01-08',
      communicationRating: 2,
      professionalismRating: 3,
      roleAccuracyRating: 1,
      isPublic: true,
      disputed: false
    },
    {
      id: '3',
      candidateName: 'Anonymous Candidate',
      jobTitle: 'DevOps Engineer',
      rating: 4,
      feedback: 'Good overall experience. Clear communication and professional approach. Could improve on providing more detailed feedback after interviews.',
      date: '2024-01-05',
      communicationRating: 4,
      professionalismRating: 5,
      roleAccuracyRating: 4,
      isPublic: true,
      disputed: false
    }
  ])

  const [aiInsights, setAiInsights] = useState<AIInsight[]>([
    {
      type: 'improvement',
      category: 'Communication',
      title: 'Enhance Post-Interview Feedback',
      description: 'Recent reviews suggest candidates want more detailed feedback after interviews, especially for unsuccessful applications.',
      actionItems: [
        'Provide specific feedback within 48 hours of interviews',
        'Include constructive suggestions for improvement',
        'Use standardized feedback templates for consistency'
      ],
      priority: 'high'
    },
    {
      type: 'strength',
      category: 'Professionalism',
      title: 'Excellent Professional Standards',
      description: 'Your professionalism rating of 4.8/5 is exceptional. Candidates consistently praise your respectful and organized approach.',
      actionItems: [
        'Continue maintaining high professional standards',
        'Share best practices with team members',
        'Document successful interaction patterns'
      ],
      priority: 'low'
    },
    {
      type: 'warning',
      category: 'Role Accuracy',
      title: 'Role Description Alignment',
      description: 'Some candidates report misalignment between job descriptions and actual role requirements. This affects your role accuracy score.',
      actionItems: [
        'Review job descriptions with hiring managers before posting',
        'Clarify role requirements during initial candidate screening',
        'Update job descriptions based on feedback from placed candidates'
      ],
      priority: 'medium'
    }
  ])

  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [disputeModalOpen, setDisputeModalOpen] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeDetails, setDisputeDetails] = useState('')
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-primary-400'
    if (rating >= 4.0) return 'text-primary-400'
    if (rating >= 3.5) return 'text-text-primary'
    if (rating >= 3.0) return 'text-text-secondary'
    return 'text-text-muted'
  }

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-4 h-4 text-primary-400" />
    if (trend < 0) return <TrendingDown className="w-4 h-4 text-text-muted" />
    return <div className="w-4 h-4" />
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

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <Lightbulb className="w-5 h-5 text-text-primary" />
      case 'strength': return <CheckCircle className="w-5 h-5 text-primary-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-text-secondary" />
      default: return <Lightbulb className="w-5 h-5 text-text-primary" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'bg-background-card border-gray-600'
      case 'strength': return 'bg-primary-500/10 border-primary-500/20'
      case 'warning': return 'bg-background-card border-gray-600'
      default: return 'bg-background-card border-gray-600'
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <span className="px-2 py-1 bg-background-card text-text-primary text-xs font-semibold rounded-full border border-gray-600">HIGH</span>
      case 'medium': return <span className="px-2 py-1 bg-background-card text-text-secondary text-xs font-semibold rounded-full border border-gray-600">MEDIUM</span>
      case 'low': return <span className="px-2 py-1 bg-background-card text-text-muted text-xs font-semibold rounded-full border border-gray-600">LOW</span>
      default: return null
    }
  }

  const handleDisputeReview = (review: Review) => {
    setSelectedReview(review)
    setDisputeModalOpen(true)
  }

  const submitDispute = async () => {
    if (!selectedReview || !disputeReason.trim()) return

    setIsSubmittingDispute(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update review as disputed
      setReviews(prev => prev.map(review => 
        review.id === selectedReview.id 
          ? { ...review, disputed: true }
          : review
      ))
      
      // Close modal and reset
      setDisputeModalOpen(false)
      setDisputeReason('')
      setDisputeDetails('')
      setSelectedReview(null)
      
      // Show success notification
      showNotification('Dispute Submitted', 'Your dispute has been submitted for review. We will investigate and respond within 3-5 business days.')
      
    } catch (error) {
      console.error('Failed to submit dispute:', error)
      showNotification('Dispute Failed', 'Failed to submit dispute. Please try again.')
    } finally {
      setIsSubmittingDispute(false)
    }
  }

  const showNotification = (title: string, message: string) => {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-primary-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
    notification.innerHTML = `
      <div class="flex items-center space-x-3">
        <div class="flex-shrink-0">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
          </svg>
        </div>
        <div>
          <p class="font-semibold">${title}</p>
          <p class="text-sm opacity-90">${message}</p>
        </div>
      </div>
    `
    document.body.appendChild(notification)
    setTimeout(() => notification.remove(), 5000)
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">My ReelHunting Stats & Reviews</h1>
            <p className="text-lg text-text-secondary">Track your performance and manage your professional reputation</p>
          </div>
          <div className="flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-background-panel border border-gray-600 rounded-xl text-text-secondary hover:text-text-primary transition-colors duration-200">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh Data</span>
            </button>
          </div>
        </div>

        {/* Overall Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Star className="w-6 h-6 text-primary-400" />
              </div>
              {getTrendIcon(stats.monthlyTrend)}
            </div>
            <div>
              <p className={`text-3xl font-bold ${getRatingColor(stats.overallRating)} mb-1`}>
                {stats.overallRating.toFixed(1)}
              </p>
              <p className="text-sm text-text-muted mb-2">Overall Rating</p>
              <p className="text-sm font-medium text-primary-400">
                +{stats.monthlyTrend.toFixed(1)} this month
              </p>
            </div>
          </div>

          <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Users className="w-6 h-6 text-primary-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-text-primary mb-1">{stats.totalReviews}</p>
              <p className="text-sm text-text-muted mb-2">Total Reviews</p>
              <p className="text-sm text-primary-400">
                {Math.round((stats.positiveReviews / stats.totalReviews) * 100)}% positive
              </p>
            </div>
          </div>

          <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Target className="w-6 h-6 text-primary-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-400 mb-1">{stats.placementSuccess}%</p>
              <p className="text-sm text-text-muted mb-2">Placement Success</p>
              <p className="text-sm text-primary-400">Above industry average</p>
            </div>
          </div>

          <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary-500/10 rounded-lg">
                <Clock className="w-6 h-6 text-primary-400" />
              </div>
            </div>
            <div>
              <p className="text-3xl font-bold text-primary-400 mb-1">{stats.responseTime}h</p>
              <p className="text-sm text-text-muted mb-2">Avg Response Time</p>
              <p className="text-sm text-primary-400">Excellent responsiveness</p>
            </div>
          </div>
        </div>

        {/* Detailed Rating Breakdown */}
        <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-6">Rating Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-background-card rounded-lg border border-gray-600">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <MessageSquare className="w-5 h-5 text-primary-400" />
                <span className="font-medium text-text-primary">Communication</span>
              </div>
              <div className={`text-2xl font-bold ${getRatingColor(stats.avgCommunication)} mb-2`}>
                {stats.avgCommunication.toFixed(1)}
              </div>
              <div className="flex items-center justify-center space-x-1">
                {renderStars(stats.avgCommunication)}
              </div>
            </div>
            
            <div className="text-center p-4 bg-background-card rounded-lg border border-gray-600">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Award className="w-5 h-5 text-primary-400" />
                <span className="font-medium text-text-primary">Professionalism</span>
              </div>
              <div className={`text-2xl font-bold ${getRatingColor(stats.avgProfessionalism)} mb-2`}>
                {stats.avgProfessionalism.toFixed(1)}
              </div>
              <div className="flex items-center justify-center space-x-1">
                {renderStars(stats.avgProfessionalism)}
              </div>
            </div>
            
            <div className="text-center p-4 bg-background-card rounded-lg border border-gray-600">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <Target className="w-5 h-5 text-primary-400" />
                <span className="font-medium text-text-primary">Role Accuracy</span>
              </div>
              <div className={`text-2xl font-bold ${getRatingColor(stats.avgRoleAccuracy)} mb-2`}>
                {stats.avgRoleAccuracy.toFixed(1)}
              </div>
              <div className="flex items-center justify-center space-x-1">
                {renderStars(stats.avgRoleAccuracy)}
              </div>
            </div>
          </div>
        </div>

        {/* AI-Powered Insights */}
        <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-6">
            <Lightbulb className="w-6 h-6 text-primary-400" />
            <h3 className="text-xl font-semibold text-text-primary">AI-Powered Insights & Recommendations</h3>
          </div>
          <div className="space-y-4">
            {aiInsights.map((insight, index) => (
              <div key={index} className={`border rounded-xl p-6 ${getInsightColor(insight.type)}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getInsightIcon(insight.type)}
                    <div>
                      <h4 className="font-semibold text-text-primary">{insight.title}</h4>
                      <p className="text-sm text-text-muted">{insight.category}</p>
                    </div>
                  </div>
                  {getPriorityBadge(insight.priority)}
                </div>
                <p className="text-text-secondary mb-4">{insight.description}</p>
                <div>
                  <h5 className="font-medium text-text-primary mb-2">Recommended Actions:</h5>
                  <ul className="space-y-1">
                    {insight.actionItems.map((action, actionIndex) => (
                      <li key={actionIndex} className="flex items-start space-x-2 text-sm text-text-secondary">
                        <div className="w-1.5 h-1.5 bg-primary-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span>{action}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-text-primary mb-6">Recent Reviews</h3>
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="bg-background-card rounded-xl border border-gray-600 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {review.candidateName.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium text-text-primary">{review.candidateName}</h4>
                      <p className="text-sm text-text-muted">{review.jobTitle}</p>
                      <p className="text-xs text-text-muted">{new Date(review.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                    <div className="flex items-center space-x-2">
                      {review.isPublic ? (
                        <Eye className="w-4 h-4 text-primary-400" title="Public review" />
                      ) : (
                        <EyeOff className="w-4 h-4 text-text-muted" title="Private review" />
                      )}
                      {review.disputed && (
                        <Shield className="w-4 h-4 text-text-secondary" title="Under dispute" />
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-text-secondary mb-4 italic">"{review.feedback}"</p>
                
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-xs text-text-muted mb-1">Communication</p>
                    <p className={`font-semibold ${getRatingColor(review.communicationRating)}`}>
                      {review.communicationRating}/5
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted mb-1">Professionalism</p>
                    <p className={`font-semibold ${getRatingColor(review.professionalismRating)}`}>
                      {review.professionalismRating}/5
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-text-muted mb-1">Role Accuracy</p>
                    <p className={`font-semibold ${getRatingColor(review.roleAccuracyRating)}`}>
                      {review.roleAccuracyRating}/5
                    </p>
                  </div>
                </div>
                
                {!review.disputed && review.rating <= 3 && (
                  <div className="flex justify-end">
                    <button
                      onClick={() => handleDisputeReview(review)}
                      className="flex items-center space-x-2 px-4 py-2 bg-background-panel text-text-secondary rounded-lg hover:bg-gray-600 hover:text-text-primary transition-colors duration-200 border border-gray-600"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      <span>Dispute Review</span>
                    </button>
                  </div>
                )}
                
                {review.disputed && (
                  <div className="bg-background-panel border border-gray-600 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-text-secondary" />
                      <span className="text-text-secondary font-medium text-sm">Under Review</span>
                    </div>
                    <p className="text-text-muted text-xs mt-1">
                      This review is being investigated. We will update you within 3-5 business days.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Dispute Modal */}
        {disputeModalOpen && selectedReview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setDisputeModalOpen(false)} />
            <div className="relative bg-background-panel border border-gray-600 rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-background-card rounded-lg border border-gray-600">
                    <AlertTriangle className="w-6 h-6 text-text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold text-text-primary">Dispute Review</h2>
                    <p className="text-text-muted">Submit a dispute for this review</p>
                  </div>
                </div>
                <button
                  onClick={() => setDisputeModalOpen(false)}
                  className="text-text-muted hover:text-text-primary p-2 hover:bg-background-card rounded-lg transition-colors duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Review Summary */}
              <div className="bg-background-card border border-gray-600 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-text-primary">{selectedReview.candidateName}</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(selectedReview.rating)}
                  </div>
                </div>
                <p className="text-text-secondary text-sm italic">"{selectedReview.feedback}"</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); submitDispute(); }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Reason for Dispute *
                  </label>
                  <select
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  >
                    <option value="">Select a reason</option>
                    <option value="factual_inaccuracy">Factual Inaccuracy</option>
                    <option value="inappropriate_content">Inappropriate Content</option>
                    <option value="misrepresentation">Misrepresentation of Events</option>
                    <option value="violation_guidelines">Violation of Review Guidelines</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Additional Details
                  </label>
                  <textarea
                    value={disputeDetails}
                    onChange={(e) => setDisputeDetails(e.target.value)}
                    placeholder="Please provide specific details about why you believe this review should be investigated..."
                    rows={4}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>

                <div className="bg-primary-500/10 border border-primary-500/20 rounded-xl p-4">
                  <h4 className="font-medium text-primary-400 mb-2">Dispute Process</h4>
                  <ul className="text-text-secondary text-sm space-y-1">
                    <li>• Our team will review your dispute within 3-5 business days</li>
                    <li>• We may contact you for additional information</li>
                    <li>• If the dispute is valid, the review may be removed or modified</li>
                    <li>• You will be notified of the outcome via email</li>
                  </ul>
                </div>

                <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-600">
                  <button
                    type="button"
                    onClick={() => setDisputeModalOpen(false)}
                    disabled={isSubmittingDispute}
                    className="px-6 py-3 text-text-secondary hover:text-text-primary transition-colors duration-200 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!disputeReason.trim() || isSubmittingDispute}
                    className="bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    {isSubmittingDispute ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Dispute</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

export default MyStatsPage