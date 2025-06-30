import React, { useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import SearchInterface from '../components/search/SearchInterface'
import CandidateCard from '../components/candidates/CandidateCard'
import { Search, Filter, Users, Shield, Clock, Star } from 'lucide-react'

const SearchPage: React.FC = () => {
  const [searchResults, setSearchResults] = useState([
    {
      id: '1',
      firstName: 'Sarah',
      lastName: 'Chen',
      headline: 'Senior Full-Stack Developer',
      email: 'sarah.chen@example.com',
      reelpassScore: 92,
      verificationStatus: 'verified' as const,
      availabilityStatus: 'available' as const,
      availableFrom: '2024-02-01',
      noticePeriodDays: 30,
      salaryExpectationMin: 45000,
      salaryExpectationMax: 65000,
      preferredWorkType: 'hybrid',
      locationPreferences: ['New York', 'San Francisco'],
      skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
      lastActive: '2024-01-15T10:00:00Z',
      currency: 'USD'
    },
    {
      id: '2',
      firstName: 'Marcus',
      lastName: 'Rodriguez',
      headline: 'DevOps Engineer & Cloud Architect',
      email: 'marcus.r@example.com',
      reelpassScore: 87,
      verificationStatus: 'verified' as const,
      availabilityStatus: 'open' as const,
      noticePeriodDays: 60,
      salaryExpectationMin: 50000,
      salaryExpectationMax: 75000,
      preferredWorkType: 'remote',
      locationPreferences: ['Remote'],
      skills: ['AWS', 'Docker', 'Kubernetes', 'Terraform', 'Python'],
      lastActive: '2024-01-10T14:30:00Z',
      currency: 'USD'
    },
    {
      id: '3',
      firstName: 'Priya',
      lastName: 'Patel',
      headline: 'Frontend Developer & UX Specialist',
      email: 'priya.patel@example.com',
      reelpassScore: 78,
      verificationStatus: 'partial' as const,
      availabilityStatus: 'not-looking' as const,
      salaryExpectationMin: 35000,
      salaryExpectationMax: 50000,
      preferredWorkType: 'onsite',
      locationPreferences: ['London'],
      skills: ['React', 'Vue.js', 'Figma', 'CSS', 'JavaScript'],
      lastActive: '2024-01-12T09:15:00Z',
      currency: 'GBP'
    }
  ])

  const [showResults, setShowResults] = useState(false)

  const handleSearch = (searchData: any) => {
    console.log('Search performed with data:', searchData)
    setShowResults(true)
  }

  const handleSelectCandidate = (candidate: any) => {
    console.log('Selected candidate:', candidate)
    // TODO: Navigate to candidate profile
  }

  const handleAddToPipeline = (candidate: any) => {
    console.log('Adding to pipeline:', candidate)
    // TODO: Add to pipeline logic
    showNotification('✅ Candidate Added to Pipeline', `${candidate.firstName} ${candidate.lastName} has been added to your pipeline`)
  }

  const showNotification = (title: string, message: string) => {
    const notification = document.createElement('div')
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm'
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

  const getVerificationStats = () => {
    const verified = searchResults.filter(c => c.verificationStatus === 'verified').length
    const available = searchResults.filter(c => c.availabilityStatus === 'available').length
    const highScore = searchResults.filter(c => c.reelpassScore >= 80).length
    
    return { verified, available, highScore }
  }

  const stats = getVerificationStats()

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {!showResults ? (
          <div className="space-y-8">
            <SearchInterface onSearch={handleSearch} />
            
            {/* ReelCV Platform Benefits */}
            <div className="max-w-4xl mx-auto">
              <div className="bg-gradient-to-r from-primary-500/10 to-primary-600/10 border border-primary-500/20 rounded-xl p-8">
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <Shield className="w-8 h-8 text-primary-400" />
                    <h3 className="text-2xl font-semibold text-text-primary">ReelCV Verified Talent Pool</h3>
                  </div>
                  <p className="text-text-secondary mb-6 text-lg leading-relaxed">
                    Search through our curated pool of ReelCV candidates with verified skills, government-backed credentials, and comprehensive ReelPass profiles
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="p-3 bg-green-500/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Shield className="w-8 h-8 text-green-400" />
                      </div>
                      <h4 className="font-semibold text-text-primary mb-2">ReelPass Verified</h4>
                      <p className="text-text-muted text-sm">Government-backed credential verification</p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 bg-blue-500/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Star className="w-8 h-8 text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-text-primary mb-2">Skill Demonstrations</h4>
                      <p className="text-text-muted text-sm">Video proofs and verified competencies</p>
                    </div>
                    <div className="text-center">
                      <div className="p-3 bg-purple-500/10 rounded-full w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                        <Clock className="w-8 h-8 text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-text-primary mb-2">Live Availability</h4>
                      <p className="text-text-muted text-sm">Real-time availability and notice periods</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Search Results Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-text-primary mb-2">ReelCV Talent Search Results</h1>
                <p className="text-text-secondary">
                  Found {searchResults.length} verified candidates from the ReelCV platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowResults(false)}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  New Search
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Shield className="w-6 h-6 text-green-400" />
                  <span className="text-lg font-semibold text-text-primary">{stats.verified}</span>
                </div>
                <p className="text-text-muted">ReelPass Verified</p>
              </div>
              
              <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Clock className="w-6 h-6 text-blue-400" />
                  <span className="text-lg font-semibold text-text-primary">{stats.available}</span>
                </div>
                <p className="text-text-muted">Available Now</p>
              </div>
              
              <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Star className="w-6 h-6 text-yellow-400" />
                  <span className="text-lg font-semibold text-text-primary">{stats.highScore}</span>
                </div>
                <p className="text-text-muted">High ReelPass Score (80+)</p>
              </div>
              
              <div className="bg-background-panel border border-gray-600 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-2">
                  <Users className="w-6 h-6 text-purple-400" />
                  <span className="text-lg font-semibold text-text-primary">{searchResults.length}</span>
                </div>
                <p className="text-text-muted">Total Candidates</p>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="flex items-center space-x-4 p-4 bg-background-panel border border-gray-600 rounded-xl">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-text-muted" />
                <span className="text-text-primary font-medium">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm">
                  ReelPass Verified
                </span>
                <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm">
                  Available
                </span>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm">
                  React
                </span>
              </div>
              <button className="text-text-muted hover:text-text-primary text-sm ml-auto">
                Clear all
              </button>
            </div>

            {/* Search Results */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map(candidate => (
                <CandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  onSelect={handleSelectCandidate}
                  onAddToPipeline={handleAddToPipeline}
                />
              ))}
            </div>

            {/* Load More */}
            <div className="text-center">
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Load More Candidates
              </button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default SearchPage