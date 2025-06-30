import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, Clock, AlertTriangle, Award, FileText, Briefcase, GraduationCap, CreditCard, User, RefreshCw } from 'lucide-react'

interface ReelPassStatus {
  profileId: string
  reelpassScore: number
  reelpassStatus: 'verified' | 'partial' | 'unverified'
  verifiedGovernmentChecks: number
  verifiedEducationCount: number
  verifiedEmploymentCount: number
  verifiedLicenseCount: number
  verifiedSkillCount: number
}

interface VerificationItem {
  id: string
  type: 'identity' | 'education' | 'employment' | 'license' | 'skills'
  title: string
  description: string
  status: 'verified' | 'pending' | 'failed' | 'not_started'
  score: number
  icon: React.ReactNode
  action?: () => void
}

const ReelPassDashboard: React.FC = () => {
  const [reelpassStatus, setReelpassStatus] = useState<ReelPassStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchReelPassStatus()
  }, [])

  const fetchReelPassStatus = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement actual API call
      // const response = await fetch('/api/reelpass/status')
      // const data = await response.json()
      
      // Mock data for now
      const mockData: ReelPassStatus = {
        profileId: 'user-123',
        reelpassScore: 75,
        reelpassStatus: 'partial',
        verifiedGovernmentChecks: 1,
        verifiedEducationCount: 1,
        verifiedEmploymentCount: 2,
        verifiedLicenseCount: 0,
        verifiedSkillCount: 5
      }
      
      setReelpassStatus(mockData)
    } catch (error) {
      console.error('Failed to fetch ReelPass status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStatus = async () => {
    setIsRefreshing(true)
    await fetchReelPassStatus()
    setIsRefreshing(false)
  }

  const startVerification = async (verificationType: string) => {
    console.log('Starting verification for:', verificationType)
    // TODO: Implement verification flow
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!reelpassStatus) {
    return (
      <div className="text-center p-8">
        <p className="text-text-muted">Failed to load ReelPass status</p>
      </div>
    )
  }

  const verificationItems: VerificationItem[] = [
    {
      id: 'identity',
      type: 'identity',
      title: 'Government Identity Verification',
      description: 'Verify your identity through Social Security Administration',
      status: reelpassStatus.verifiedGovernmentChecks > 0 ? 'verified' : 'not_started',
      score: 25,
      icon: <User className="w-5 h-5" />,
      action: () => startVerification('identity')
    },
    {
      id: 'education',
      type: 'education',
      title: 'Education Verification',
      description: 'Verify your degrees through National Student Clearinghouse',
      status: reelpassStatus.verifiedEducationCount > 0 ? 'verified' : 'not_started',
      score: 20,
      icon: <GraduationCap className="w-5 h-5" />,
      action: () => startVerification('education')
    },
    {
      id: 'employment',
      type: 'employment',
      title: 'Employment History',
      description: 'Verify your work experience with previous employers',
      status: reelpassStatus.verifiedEmploymentCount > 0 ? 'verified' : 'not_started',
      score: 25,
      icon: <Briefcase className="w-5 h-5" />,
      action: () => startVerification('employment')
    },
    {
      id: 'licenses',
      type: 'license',
      title: 'Professional Licenses',
      description: 'Verify professional certifications and licenses',
      status: reelpassStatus.verifiedLicenseCount > 0 ? 'verified' : 'not_started',
      score: 15,
      icon: <CreditCard className="w-5 h-5" />,
      action: () => startVerification('license')
    },
    {
      id: 'skills',
      type: 'skills',
      title: 'Skill Verification',
      description: 'Demonstrate your skills through video assessments',
      status: reelpassStatus.verifiedSkillCount > 0 ? 'verified' : 'not_started',
      score: 15,
      icon: <Award className="w-5 h-5" />,
      action: () => startVerification('skills')
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'text-green-400'
      case 'pending': return 'text-yellow-400'
      case 'failed': return 'text-red-400'
      default: return 'text-text-muted'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'pending': return <Clock className="w-5 h-5 text-yellow-400" />
      case 'failed': return <AlertTriangle className="w-5 h-5 text-red-400" />
      default: return <div className="w-5 h-5 border-2 border-text-muted rounded-full" />
    }
  }

  const getReelPassBadge = () => {
    const { reelpassStatus: status, reelpassScore } = reelpassStatus
    
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center space-x-3 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <h3 className="text-lg font-semibold text-green-400">ReelPass Verified</h3>
              <p className="text-green-300 text-sm">Score: {reelpassScore}/100</p>
            </div>
          </div>
        )
      case 'partial':
        return (
          <div className="flex items-center space-x-3 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Shield className="w-8 h-8 text-yellow-400" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400">Partial Verification</h3>
              <p className="text-yellow-300 text-sm">Score: {reelpassScore}/100 - Complete more verifications</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-3 p-4 bg-gray-500/10 border border-gray-500/20 rounded-xl">
            <Shield className="w-8 h-8 text-text-muted" />
            <div>
              <h3 className="text-lg font-semibold text-text-muted">Not Verified</h3>
              <p className="text-text-muted text-sm">Score: {reelpassScore}/100 - Start your verification journey</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">ReelPass Verification</h1>
          <p className="text-text-secondary">Build trust with government-verified credentials</p>
        </div>
        <button
          onClick={refreshStatus}
          disabled={isRefreshing}
          className="flex items-center space-x-2 px-4 py-2 bg-background-card hover:bg-gray-600 text-text-primary rounded-xl border border-gray-600 transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ReelPass Status Badge */}
      {getReelPassBadge()}

      {/* Progress Overview */}
      <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text-primary">Verification Progress</h3>
          <span className="text-2xl font-bold text-primary-400">{reelpassStatus.reelpassScore}/100</span>
        </div>
        
        <div className="w-full bg-background-card rounded-full h-3 mb-4">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${reelpassStatus.reelpassScore}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-text-primary">{reelpassStatus.verifiedGovernmentChecks}</div>
            <div className="text-sm text-text-muted">Identity Checks</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{reelpassStatus.verifiedEducationCount}</div>
            <div className="text-sm text-text-muted">Education</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{reelpassStatus.verifiedEmploymentCount}</div>
            <div className="text-sm text-text-muted">Employment</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{reelpassStatus.verifiedLicenseCount}</div>
            <div className="text-sm text-text-muted">Licenses</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{reelpassStatus.verifiedSkillCount}</div>
            <div className="text-sm text-text-muted">Skills</div>
          </div>
        </div>
      </div>

      {/* Verification Items */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-text-primary">Verification Categories</h3>
        
        {verificationItems.map((item) => (
          <div key={item.id} className="bg-background-panel border border-gray-600 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  item.status === 'verified' 
                    ? 'bg-green-500/10 text-green-400' 
                    : 'bg-background-card text-text-muted'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-lg font-semibold text-text-primary">{item.title}</h4>
                    {getStatusIcon(item.status)}
                  </div>
                  <p className="text-text-secondary text-sm">{item.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-lg font-semibold text-primary-400">+{item.score}</div>
                  <div className="text-xs text-text-muted">points</div>
                </div>
                
                {item.status !== 'verified' && item.action && (
                  <button
                    onClick={item.action}
                    className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200"
                  >
                    {item.status === 'pending' ? 'Check Status' : 'Start Verification'}
                  </button>
                )}
                
                {item.status === 'verified' && (
                  <div className="flex items-center space-x-2 text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Benefits Section */}
      <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-8">
        <h3 className="text-2xl font-semibold text-text-primary mb-4">ReelPass Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Higher Match Scores</h4>
              <p className="text-text-secondary text-sm">Verified profiles receive priority in AI matching algorithms</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Faster Hiring Process</h4>
              <p className="text-text-secondary text-sm">Skip redundant background checks with pre-verified credentials</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Premium Job Access</h4>
              <p className="text-text-secondary text-sm">Access exclusive opportunities requiring verified candidates</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Trust Badge</h4>
              <p className="text-text-secondary text-sm">Display your verification status to build employer confidence</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReelPassDashboard