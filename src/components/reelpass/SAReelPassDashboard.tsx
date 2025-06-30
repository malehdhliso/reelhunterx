import React, { useState, useEffect } from 'react'
import { Shield, CheckCircle, Clock, AlertTriangle, Award, FileText, Briefcase, GraduationCap, CreditCard, User, RefreshCw, MapPin, Globe, Users, Video, Star, Code, Brain, MessageSquare, Lightbulb, Target, Heart } from 'lucide-react'

interface SAReelPassStatus {
  profileId: string
  reelpassScore: number
  reelpassStatus: 'verified' | 'partial' | 'unverified'
  province: string
  beeStatus: string
  verifiedSkillCount: number
  videoVerifiedSkills: number
  personaAssessed: boolean
  personaConfidenceScore: number
  verifiedIdentityChecks: number
  verifiedBeeCount: number
  verifiedEducationCount: number
  verifiedEmploymentCount: number
  verifiedLicenseCount: number
  verifiedSetaCount: number
}

interface SAVerificationItem {
  id: string
  type: 'skills' | 'video_skills' | 'persona' | 'identity' | 'bee' | 'education' | 'employment' | 'license' | 'seta'
  title: string
  description: string
  status: 'verified' | 'pending' | 'failed' | 'not_started'
  score: number
  priority: 'critical' | 'high' | 'medium' | 'low'
  icon: React.ReactNode
  agency: string
  action?: () => void
}

const SAReelPassDashboard: React.FC = () => {
  const [reelpassStatus, setReelpassStatus] = useState<SAReelPassStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    fetchSAReelPassStatus()
  }, [])

  const fetchSAReelPassStatus = async () => {
    try {
      setIsLoading(true)
      // TODO: Implement actual API call to SA ReelPass status
      
      // Mock data for South African context with skills + persona focus
      const mockData: SAReelPassStatus = {
        profileId: 'user-123',
        reelpassScore: 78,
        reelpassStatus: 'partial',
        province: 'gauteng',
        beeStatus: 'level_4',
        verifiedSkillCount: 6,
        videoVerifiedSkills: 2,
        personaAssessed: false, // This will drive the persona assessment priority
        personaConfidenceScore: 0,
        verifiedIdentityChecks: 1,
        verifiedBeeCount: 0,
        verifiedEducationCount: 1,
        verifiedEmploymentCount: 2,
        verifiedLicenseCount: 0,
        verifiedSetaCount: 1
      }
      
      setReelpassStatus(mockData)
    } catch (error) {
      console.error('Failed to fetch SA ReelPass status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const refreshStatus = async () => {
    setIsRefreshing(true)
    await fetchSAReelPassStatus()
    setIsRefreshing(false)
  }

  const startSAVerification = async (verificationType: string) => {
    console.log('Starting South African verification for:', verificationType)
    // TODO: Implement SA verification flow
  }

  const startPersonaAssessment = async () => {
    console.log('Starting ReelPersona assessment')
    // TODO: Implement persona assessment flow
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
        <p className="text-text-muted">Failed to load SA ReelPass status</p>
      </div>
    )
  }

  const saVerificationItems: SAVerificationItem[] = [
    // SKILLS DEMONSTRATION - Highest Priority (50% of score)
    {
      id: 'verified_skills',
      type: 'skills',
      title: 'Verified Technical Skills',
      description: 'Demonstrate and verify your technical competencies through assessments',
      status: reelpassStatus.verifiedSkillCount > 0 ? 'verified' : 'not_started',
      score: 30,
      priority: 'critical',
      icon: <Code className="w-5 h-5" />,
      agency: 'ReelHunter Skills Engine',
      action: () => startSAVerification('skills')
    },
    {
      id: 'video_skills',
      type: 'video_skills',
      title: 'Video Skill Demonstrations',
      description: 'Record videos showcasing your technical abilities in action',
      status: reelpassStatus.videoVerifiedSkills > 0 ? 'verified' : 'not_started',
      score: 12,
      priority: 'critical',
      icon: <Video className="w-5 h-5" />,
      agency: 'ReelHunter AI Assessment',
      action: () => startSAVerification('video_skills')
    },
    
    // REELPERSONA ASSESSMENT - NEW High Priority (20% of score)
    {
      id: 'persona',
      type: 'persona',
      title: 'ReelPersona Assessment',
      description: 'Complete personality and soft skills assessment for holistic profile',
      status: reelpassStatus.personaAssessed ? 'verified' : 'not_started',
      score: 20,
      priority: 'critical',
      icon: <Brain className="w-5 h-5" />,
      agency: 'ReelPersona AI Engine',
      action: () => startPersonaAssessment()
    },
    
    // GOVERNMENT VERIFICATION - Trust & Compliance (20% of score)
    {
      id: 'identity',
      type: 'identity',
      title: 'Home Affairs ID Verification',
      description: 'Verify your South African ID through Department of Home Affairs',
      status: reelpassStatus.verifiedIdentityChecks > 0 ? 'verified' : 'not_started',
      score: 12,
      priority: 'high',
      icon: <User className="w-5 h-5" />,
      agency: 'Department of Home Affairs',
      action: () => startSAVerification('id_verification')
    },
    {
      id: 'bee',
      type: 'bee',
      title: 'BEE Verification',
      description: 'Verify your BEE status for employment equity compliance',
      status: reelpassStatus.verifiedBeeCount > 0 ? 'verified' : 'not_started',
      score: 8,
      priority: 'high',
      icon: <Users className="w-5 h-5" />,
      agency: 'BEE Verification Agencies',
      action: () => startSAVerification('bee_certificate')
    },
    
    // TRADITIONAL CREDENTIALS - Supporting Evidence (10% of score)
    {
      id: 'education',
      type: 'education',
      title: 'SAQA Education Verification',
      description: 'Verify your qualifications through South African Qualifications Authority',
      status: reelpassStatus.verifiedEducationCount > 0 ? 'verified' : 'not_started',
      score: 4,
      priority: 'medium',
      icon: <GraduationCap className="w-5 h-5" />,
      agency: 'SAQA',
      action: () => startSAVerification('education_saqa')
    },
    {
      id: 'employment',
      type: 'employment',
      title: 'SARS Employment Verification',
      description: 'Verify your employment history through SARS and Department of Labour',
      status: reelpassStatus.verifiedEmploymentCount > 0 ? 'verified' : 'not_started',
      score: 4,
      priority: 'medium',
      icon: <Briefcase className="w-5 h-5" />,
      agency: 'SARS / Department of Labour',
      action: () => startSAVerification('tax_clearance')
    },
    {
      id: 'licenses',
      type: 'license',
      title: 'Professional Council Registration',
      description: 'Verify professional registration with ECSA, SAPC, SAICA, etc.',
      status: reelpassStatus.verifiedLicenseCount > 0 ? 'verified' : 'not_started',
      score: 1,
      priority: 'low',
      icon: <CreditCard className="w-5 h-5" />,
      agency: 'Professional Councils',
      action: () => startSAVerification('professional_registration')
    },
    {
      id: 'seta',
      type: 'seta',
      title: 'SETA Skills Certification',
      description: 'Verify skills development through SETA bodies (BANKSETA, MERSETA, etc.)',
      status: reelpassStatus.verifiedSetaCount > 0 ? 'verified' : 'not_started',
      score: 1,
      priority: 'low',
      icon: <Award className="w-5 h-5" />,
      agency: 'SETA Bodies',
      action: () => startSAVerification('seta_certification')
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'border-l-4 border-l-red-500'
      case 'high': return 'border-l-4 border-l-orange-500'
      case 'medium': return 'border-l-4 border-l-yellow-500'
      case 'low': return 'border-l-4 border-l-gray-500'
      default: return ''
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs font-semibold rounded-full">CRITICAL</span>
      case 'high': return <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs font-semibold rounded-full">HIGH IMPACT</span>
      case 'medium': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-semibold rounded-full">COMPLIANCE</span>
      case 'low': return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs font-semibold rounded-full">SUPPORTING</span>
      default: return null
    }
  }

  const getReelPassBadge = () => {
    const { reelpassStatus: status, reelpassScore } = reelpassStatus
    
    switch (status) {
      case 'verified':
        return (
          <div className="flex items-center space-x-3 p-6 bg-green-500/10 border border-green-500/20 rounded-xl">
            <Shield className="w-10 h-10 text-green-400" />
            <div>
              <h3 className="text-xl font-semibold text-green-400">SA ReelPass Verified</h3>
              <p className="text-green-300">Score: {reelpassScore}/100 - Skills + personality verified for SA market</p>
            </div>
          </div>
        )
      case 'partial':
        return (
          <div className="flex items-center space-x-3 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <Shield className="w-10 h-10 text-yellow-400" />
            <div>
              <h3 className="text-xl font-semibold text-yellow-400">Partial Skills + Personality Verification</h3>
              <p className="text-yellow-300">Score: {reelpassScore}/100 - Complete skills and personality assessment to increase score</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="flex items-center space-x-3 p-6 bg-gray-500/10 border border-gray-500/20 rounded-xl">
            <Shield className="w-10 h-10 text-text-muted" />
            <div>
              <h3 className="text-xl font-semibold text-text-muted">Skills + Personality Not Verified</h3>
              <p className="text-text-muted">Score: {reelpassScore}/100 - Start with skills demonstration and personality assessment</p>
            </div>
          </div>
        )
    }
  }

  // Sort verification items by priority
  const sortedItems = saVerificationItems.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">SA ReelPass Verification</h1>
          <p className="text-text-secondary">Skills + personality verification for South African talent</p>
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

      {/* Skills + Personality Philosophy Banner */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-3">
          <div className="flex items-center space-x-2">
            <Star className="w-6 h-6 text-blue-400" />
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">Skills + Personality Over Papers</h3>
        </div>
        <p className="text-text-secondary">
          ReelHunter combines <strong>verified technical skills</strong> with <strong>personality insights</strong> to create holistic candidate profiles. 
          Show what you can do AND how you work, not just what certificates you have.
        </p>
      </div>

      {/* SA ReelPass Status Badge */}
      {getReelPassBadge()}

      {/* Updated Scoring Breakdown */}
      <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
        <h3 className="text-xl font-semibold text-text-primary mb-6">Skills + Personality Scoring Breakdown</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
            <div className="text-3xl font-bold text-red-400 mb-2">50%</div>
            <div className="text-red-300 font-semibold mb-1">Skills Demonstration</div>
            <div className="text-text-muted text-sm">Video proofs + verified skills</div>
          </div>
          <div className="text-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
            <div className="text-3xl font-bold text-purple-400 mb-2">20%</div>
            <div className="text-purple-300 font-semibold mb-1">ReelPersona</div>
            <div className="text-text-muted text-sm">Personality + soft skills</div>
          </div>
          <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <div className="text-3xl font-bold text-yellow-400 mb-2">20%</div>
            <div className="text-yellow-300 font-semibold mb-1">Government Trust</div>
            <div className="text-text-muted text-sm">ID verification + BEE status</div>
          </div>
          <div className="text-center p-4 bg-gray-500/10 border border-gray-500/20 rounded-xl">
            <div className="text-3xl font-bold text-gray-400 mb-2">10%</div>
            <div className="text-gray-300 font-semibold mb-1">Traditional Credentials</div>
            <div className="text-text-muted text-sm">Education + employment</div>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-text-primary">SA Verification Progress</h3>
          <span className="text-2xl font-bold text-primary-400">{reelpassStatus.reelpassScore}/100</span>
        </div>
        
        <div className="w-full bg-background-card rounded-full h-3 mb-6">
          <div 
            className="bg-gradient-to-r from-primary-500 to-primary-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${reelpassStatus.reelpassScore}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div className="p-3 bg-red-500/10 rounded-lg">
            <div className="text-2xl font-bold text-red-400">{reelpassStatus.verifiedSkillCount}</div>
            <div className="text-sm text-red-300">Verified Skills</div>
          </div>
          <div className="p-3 bg-blue-500/10 rounded-lg">
            <div className="text-2xl font-bold text-blue-400">{reelpassStatus.videoVerifiedSkills}</div>
            <div className="text-sm text-blue-300">Video Skills</div>
          </div>
          <div className="p-3 bg-purple-500/10 rounded-lg">
            <div className="text-2xl font-bold text-purple-400">{reelpassStatus.personaAssessed ? '✓' : '✗'}</div>
            <div className="text-sm text-purple-300">Personality</div>
          </div>
          <div className="p-3 bg-green-500/10 rounded-lg">
            <div className="text-2xl font-bold text-green-400">{reelpassStatus.verifiedIdentityChecks}</div>
            <div className="text-sm text-green-300">ID Verified</div>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">{reelpassStatus.verifiedBeeCount}</div>
            <div className="text-sm text-yellow-300">BEE Status</div>
          </div>
        </div>
      </div>

      {/* ReelPersona Assessment Details */}
      {!reelpassStatus.personaAssessed && (
        <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Brain className="w-8 h-8 text-purple-400" />
            <div>
              <h3 className="text-xl font-semibold text-text-primary">Complete Your ReelPersona Assessment</h3>
              <p className="text-purple-300">Unlock 20% of your ReelPass score with personality insights</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-purple-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-400" />
              <div>
                <div className="font-semibold text-purple-300">Communication</div>
                <div className="text-xs text-purple-200">5 points</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-500/10 rounded-lg">
              <Lightbulb className="w-5 h-5 text-blue-400" />
              <div>
                <div className="font-semibold text-blue-300">Problem Solving</div>
                <div className="text-xs text-blue-200">5 points</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-500/10 rounded-lg">
              <Target className="w-5 h-5 text-green-400" />
              <div>
                <div className="font-semibold text-green-300">Leadership</div>
                <div className="text-xs text-green-200">5 points</div>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-pink-500/10 rounded-lg">
              <Heart className="w-5 h-5 text-pink-400" />
              <div>
                <div className="font-semibold text-pink-300">Adaptability</div>
                <div className="text-xs text-pink-200">5 points</div>
              </div>
            </div>
          </div>
          
          <button
            onClick={startPersonaAssessment}
            className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-3 rounded-xl font-semibold transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            Start ReelPersona Assessment
          </button>
        </div>
      )}

      {/* SA Verification Items - Sorted by Priority */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-text-primary">Verification Categories (Prioritized by Impact)</h3>
        
        {sortedItems.map((item) => (
          <div key={item.id} className={`bg-background-panel border border-gray-600 rounded-xl p-6 ${getPriorityColor(item.priority)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-lg ${
                  item.status === 'verified' 
                    ? 'bg-green-500/10 text-green-400' 
                    : item.priority === 'critical'
                    ? 'bg-red-500/10 text-red-400'
                    : item.priority === 'high'
                    ? 'bg-orange-500/10 text-orange-400'
                    : 'bg-background-card text-text-muted'
                }`}>
                  {item.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-1">
                    <h4 className="text-lg font-semibold text-text-primary">{item.title}</h4>
                    {getStatusIcon(item.status)}
                    {getPriorityBadge(item.priority)}
                  </div>
                  <p className="text-text-secondary text-sm mb-1">{item.description}</p>
                  <p className="text-text-muted text-xs">Agency: {item.agency}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className={`text-lg font-semibold ${
                    item.priority === 'critical' ? 'text-red-400' : 
                    item.priority === 'high' ? 'text-orange-400' : 
                    item.priority === 'medium' ? 'text-yellow-400' : 
                    'text-gray-400'
                  }`}>+{item.score}</div>
                  <div className="text-xs text-text-muted">points</div>
                </div>
                
                {item.status !== 'verified' && item.action && (
                  <button
                    onClick={item.action}
                    className={`px-6 py-2 rounded-xl font-medium transition-colors duration-200 ${
                      item.priority === 'critical' 
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : item.priority === 'high'
                        ? 'bg-orange-500 hover:bg-orange-600 text-white'
                        : item.priority === 'medium'
                        ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                        : 'bg-gray-500 hover:bg-gray-600 text-white'
                    }`}
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

      {/* SA Benefits Section */}
      <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-8">
        <h3 className="text-2xl font-semibold text-text-primary mb-6">Skills + Personality SA ReelPass Benefits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Holistic Matching</h4>
              <p className="text-text-secondary text-sm">Get matched on technical skills AND personality fit</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Video Skill Proofs</h4>
              <p className="text-text-secondary text-sm">Show your abilities in action with video demonstrations</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Personality Insights</h4>
              <p className="text-text-secondary text-sm">ReelPersona reveals communication style and work preferences</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">BEE Compliance Ready</h4>
              <p className="text-text-secondary text-sm">Verified BEE status for employment equity requirements</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Government Trust Layer</h4>
              <p className="text-text-secondary text-sm">ID verification provides baseline trust and compliance</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="w-6 h-6 text-primary-400 mt-1" />
            <div>
              <h4 className="font-semibold text-text-primary">Cultural Fit Assessment</h4>
              <p className="text-text-secondary text-sm">Understand how candidates work within SA business culture</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SAReelPassDashboard