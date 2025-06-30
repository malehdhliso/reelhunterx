import React, { useState } from 'react'
import { Search, Filter, Users, Zap, Shield, ChevronDown, X, DollarSign } from 'lucide-react'

interface SearchFilters {
  skills: string[]
  experience: string
  location: string
  reelPassOnly: boolean
  availability: string
  currency: string
  salaryMin: string
  salaryMax: string
}

interface SearchInterfaceProps {
  onSearch?: (searchData: SearchFilters & { query: string }) => void
}

const SearchInterface: React.FC<SearchInterfaceProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SearchFilters>({
    skills: [],
    experience: '',
    location: '',
    reelPassOnly: true,
    availability: '',
    currency: 'USD',
    salaryMin: '',
    salaryMax: ''
  })

  const skillSuggestions = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#',
    'Angular', 'Vue.js', 'PHP', 'Laravel', 'Django', 'Spring Boot',
    'Cloud Computing', 'Docker', 'Kubernetes', 'PostgreSQL', 'MySQL'
  ]

  const experienceLevels = [
    'Entry Level (0-2 years)',
    'Mid Level (3-5 years)', 
    'Senior Level (6-10 years)',
    'Lead/Principal (10+ years)'
  ]

  const availabilityOptions = [
    'Available immediately',
    'Available in 2 weeks',
    'Available in 1 month',
    'Open to opportunities'
  ]

  const currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' }
  ]

  const addSkill = (skill: string) => {
    if (!filters.skills.includes(skill)) {
      setFilters(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }))
    }
  }

  const removeSkill = (skill: string) => {
    setFilters(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const handleSearch = () => {
    if (onSearch) {
      onSearch({
        query: searchQuery,
        ...filters
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const selectedCurrency = currencies.find(c => c.code === filters.currency)

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 mb-6">
          <div className="p-4 bg-primary-500/10 rounded-2xl">
            <Search className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-5xl font-bold text-text-primary">Find ReelCV Talent</h1>
        </div>
        <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
          Search verified professionals from the ReelCV platform with government-backed credentials and comprehensive skill assessments
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-text-muted" />
          <input
            type="text"
            placeholder="Search for roles, skills, or technologies in ReelCV candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full pl-16 pr-40 py-5 bg-background-panel border border-gray-600 rounded-2xl text-lg text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 shadow-lg"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all duration-200 ${
                showFilters 
                  ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                  : 'bg-background-card text-text-secondary hover:text-text-primary hover:bg-gray-600'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
            <button 
              onClick={handleSearch}
              className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="max-w-6xl mx-auto bg-background-panel border border-gray-600 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-text-primary">Advanced Filters</h3>
            <button
              onClick={() => setShowFilters(false)}
              className="text-text-muted hover:text-text-primary p-2 hover:bg-background-card rounded-lg transition-colors duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Skills Filter */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Required Skills
              </label>
              <div className="space-y-3">
                {filters.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.skills.map(skill => (
                      <span
                        key={skill}
                        className="inline-flex items-center space-x-2 bg-primary-500/20 text-primary-300 px-4 py-2 rounded-full text-sm font-medium"
                      >
                        <span>{skill}</span>
                        <button
                          onClick={() => removeSkill(skill)}
                          className="hover:text-primary-100 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2">
                  {skillSuggestions.filter(skill => !filters.skills.includes(skill)).slice(0, 6).map(skill => (
                    <button
                      key={skill}
                      onClick={() => addSkill(skill)}
                      className="text-left px-4 py-3 bg-background-card hover:bg-gray-600 text-text-secondary hover:text-text-primary rounded-xl text-sm transition-all duration-200 border border-gray-600 hover:border-primary-500"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Experience Level
              </label>
              <div className="relative">
                <select
                  value={filters.experience}
                  onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                  className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">Any experience level</option>
                  {experienceLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Location
              </label>
              <input
                type="text"
                placeholder="City, Country, or Remote"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Currency Selection */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Salary Currency
              </label>
              <div className="relative">
                <select
                  value={filters.currency}
                  onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  {currencies.map(currency => (
                    <option key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name} ({currency.code})
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Salary Range ({selectedCurrency?.symbol})
              </label>
              <div className="flex space-x-3">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.salaryMin}
                  onChange={(e) => setFilters(prev => ({ ...prev, salaryMin: e.target.value }))}
                  className="flex-1 px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <span className="text-text-muted self-center">to</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.salaryMax}
                  onChange={(e) => setFilters(prev => ({ ...prev, salaryMax: e.target.value }))}
                  className="flex-1 px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Availability */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Availability
              </label>
              <div className="relative">
                <select
                  value={filters.availability}
                  onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                  className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">Any availability</option>
                  {availabilityOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* ReelPass Filter */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Verification Status
              </label>
              <label className="flex items-center space-x-4 cursor-pointer p-4 bg-background-card rounded-xl border border-gray-600 hover:border-primary-500 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={filters.reelPassOnly}
                  onChange={(e) => setFilters(prev => ({ ...prev, reelPassOnly: e.target.checked }))}
                  className="w-5 h-5 text-primary-500 bg-background-card border-gray-600 rounded focus:ring-primary-500 focus:ring-2"
                />
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-primary-400" />
                  <span className="text-text-secondary font-medium">ReelPass Verified Only</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-gray-600 mt-8">
            <button
              onClick={() => setFilters({
                skills: [],
                experience: '',
                location: '',
                reelPassOnly: true,
                availability: '',
                currency: 'USD',
                salaryMin: '',
                salaryMax: ''
              })}
              className="text-text-muted hover:text-text-primary font-medium transition-colors duration-200"
            >
              Clear all filters
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-text-muted">
                {filters.skills.length + (filters.experience ? 1 : 0) + (filters.location ? 1 : 0) + (filters.availability ? 1 : 0)} filters applied
              </span>
              <button 
                onClick={handleSearch}
                className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Results Placeholder */}
      <div className="max-w-4xl mx-auto bg-background-panel border border-gray-600 rounded-2xl p-12 text-center shadow-xl">
        <div className="max-w-lg mx-auto">
          <div className="p-6 bg-primary-500/10 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <Search className="w-12 h-12 text-primary-400" />
          </div>
          <h3 className="text-2xl font-semibold text-text-primary mb-4">
            Ready to Find Your Perfect Match?
          </h3>
          <p className="text-text-secondary mb-8 text-lg leading-relaxed">
            Search through our verified ReelCV talent pool with comprehensive skill assessments and government-backed credentials
          </p>
          <div className="bg-background-card p-6 rounded-xl border border-gray-600">
            <p className="text-text-muted">
              🎯 <strong className="text-text-secondary">ReelCV Advantage:</strong> All candidates have verified skills, ReelPass credentials, and comprehensive profiles with video demonstrations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SearchInterface