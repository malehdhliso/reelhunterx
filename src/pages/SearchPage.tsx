import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import SearchInterface from '../../../ReelCV/src/components/search/SearchInterface'
import CandidateCard from '../../../ReelCV/src/components/candidates/CandidateCard'
import { Search, Filter, Users, Shield, Clock, Star } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { searchCandidates, CandidateSearchResult, SearchFilters } from '../services/candidateService'
import SetupProfileBanner from '../components/common/SetupProfileBanner'
import { supabase } from '../services/supabase'

const SearchPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth()
  const [searchResults, setSearchResults] = useState<CandidateSearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsProfileSetup, setNeedsProfileSetup] = useState(false)

  // Check if user needs to set up their profile
  useEffect(() => {
    if (isAuthenticated && user) {
      checkProfileStatus()
    }
  }, [isAuthenticated, user])

  const checkProfileStatus = async () => {
    try {
      // Check if the user has a profile with required fields
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, headline, completion_score')
        .eq('user_id', user!.id)
        .single()

      if (error) {
        console.error('Error checking profile status:', error)
        setNeedsProfileSetup(true)
        return
      }

      // Check if essential fields are missing
      const isMissingFields = !data.first_name || !data.last_name || !data.headline
      
      // Check if completion score is too low
      const hasLowScore = !data.completion_score || data.completion_score < 10
      
      setNeedsProfileSetup(isMissingFields || hasLowScore)
    } catch (error) {
      console.error('Error checking profile status:', error)
      setNeedsProfileSetup(true)
    }
  }

  const handleSearch = async (searchData: { query: string } & SearchFilters) => {
    console.log('Search performed with data:', searchData)
    setIsLoading(true)
    setError(null)
    
    try {
      const results = await searchCandidates(searchData.query, searchData)
      setSearchResults(results)
      setShowResults(true)
    } catch (error) {
      console.error('Search failed:', error)
      setError(error instanceof Error ? error.message : 'Search failed')
      setSearchResults([])
      setShowResults(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectCandidate = (candidate: CandidateSearchResult) => {
    console.log('Selected candidate:', candidate)
    // TODO: Navigate to candidate profile
  }

  const handleAddToPipeline = (candidate: CandidateSearchResult) => {
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

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center space-x-4 mb-6">
              <div className="p-4 bg-primary-500/10 rounded-2xl">
                <Search className="w-10 h-10 text-primary-400" />
              </div>
              <h1 className="text-5xl font-bold text-text-primary">Find ReelCV Talent</h1>
            </div>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
              Please log in to search verified professionals from the ReelCV platform
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Profile Setup Banner */}
        {needsProfileSetup && <SetupProfileBanner className="mb-8" />}
        
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
                  {isLoading ? 'Searching...' : error ? 'Search encountered an error' : `Found ${searchResults.length} verified candidates from the ReelCV platform`}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => {
                    setShowResults(false)
                    setError(null)
                  }}
                  className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200"
                >
                  New Search
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-red-500/20 rounded-lg">
                    <Search className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-400">Search Error</h3>
                    <p className="text-red-300">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
                  <p className="text-text-muted">Searching for candidates...</p>
                </div>
              </div>
            ) : !error && searchResults.length === 0 ? (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-text-primary mb-2">No candidates found</h3>
                <p className="text-text-muted">Try adjusting your search criteria or filters</p>
              </div>
            ) : !error && searchResults.length > 0 ? (
              <>
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
                {searchResults.length >= 50 && (
                  <div className="text-center">
                    <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                      Load More Candidates
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </>
        )}
      </div>
    </DashboardLayout>
  )
}

export default SearchPage