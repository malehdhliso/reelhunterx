import React, { useState } from 'react'
import { Search, Filter, Users, Zap, Shield, ChevronDown, X, MapPin, Globe } from 'lucide-react'

interface SASearchFilters {
  skills: string[]
  experience: string
  province: string
  reelPassOnly: boolean
  availability: string
  beeLevel: string
  languages: string[]
  workPermitRequired: boolean
}

const SASearchInterface: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<SASearchFilters>({
    skills: [],
    experience: '',
    province: '',
    reelPassOnly: true,
    availability: '',
    beeLevel: '',
    languages: [],
    workPermitRequired: false
  })

  const skillSuggestions = [
    'React', 'TypeScript', 'Node.js', 'Python', 'Java', 'C#', 
    'Angular', 'Vue.js', 'PHP', 'Laravel', 'Django', 'Spring Boot',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'PostgreSQL', 'MySQL'
  ]

  const experienceLevels = [
    'Graduate/Entry Level (0-2 years)',
    'Junior Level (2-4 years)',
    'Intermediate Level (4-7 years)', 
    'Senior Level (7-12 years)',
    'Lead/Principal (12+ years)'
  ]

  const saProvinces = [
    'Eastern Cape',
    'Free State', 
    'Gauteng',
    'KwaZulu-Natal',
    'Limpopo',
    'Mpumalanga',
    'Northern Cape',
    'North West',
    'Western Cape'
  ]

  const availabilityOptions = [
    'Available immediately',
    'Available in 2 weeks',
    'Available in 1 month',
    'Open to opportunities',
    'Not actively looking'
  ]

  const beeLevels = [
    'Level 1 (135%+ Recognition)',
    'Level 2 (125% Recognition)',
    'Level 3 (110% Recognition)',
    'Level 4 (100% Recognition)',
    'Level 5 (80% Recognition)',
    'Level 6 (60% Recognition)',
    'Level 7 (50% Recognition)',
    'Level 8 (10% Recognition)'
  ]

  const saLanguages = [
    'English',
    'Afrikaans',
    'isiZulu',
    'isiXhosa',
    'Sepedi',
    'Setswana',
    'Sesotho',
    'Xitsonga',
    'siSwati',
    'Tshivenda',
    'isiNdebele'
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

  const addLanguage = (language: string) => {
    if (!filters.languages.includes(language)) {
      setFilters(prev => ({
        ...prev,
        languages: [...prev.languages, language]
      }))
    }
  }

  const removeLanguage = (language: string) => {
    setFilters(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }))
  }

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-4 mb-6">
          <div className="p-4 bg-primary-500/10 rounded-2xl">
            <Search className="w-10 h-10 text-primary-400" />
          </div>
          <h1 className="text-5xl font-bold text-text-primary">Find South African Talent</h1>
        </div>
        <p className="text-xl text-text-secondary max-w-4xl mx-auto leading-relaxed">
          Discover verified South African professionals with government-backed credentials and local market expertise
        </p>
      </div>

      {/* Main Search Bar */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 w-6 h-6 text-text-muted" />
          <input
            type="text"
            placeholder="Search for roles, skills, or technologies in South Africa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
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
              <span className="text-sm font-medium">SA Filters</span>
            </button>
            <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-2.5 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Advanced SA Filters Panel */}
      {showFilters && (
        <div className="max-w-6xl mx-auto bg-background-panel border border-gray-600 rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-semibold text-text-primary">South African Talent Filters</h3>
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

            {/* Province */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                <MapPin className="w-5 h-5 inline mr-2" />
                Province
              </label>
              <div className="relative">
                <select
                  value={filters.province}
                  onChange={(e) => setFilters(prev => ({ ...prev, province: e.target.value }))}
                  className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">All provinces</option>
                  {saProvinces.map(province => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
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

            {/* BEE Level */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                <Users className="w-5 h-5 inline mr-2" />
                BEE Level
              </label>
              <div className="relative">
                <select
                  value={filters.beeLevel}
                  onChange={(e) => setFilters(prev => ({ ...prev, beeLevel: e.target.value }))}
                  className="w-full px-4 py-4 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
                >
                  <option value="">Any BEE level</option>
                  {beeLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted pointer-events-none" />
              </div>
            </div>

            {/* Languages */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                <Globe className="w-5 h-5 inline mr-2" />
                Languages
              </label>
              <div className="space-y-3">
                {filters.languages.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {filters.languages.map(language => (
                      <span
                        key={language}
                        className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium"
                      >
                        <span>{language}</span>
                        <button
                          onClick={() => removeLanguage(language)}
                          className="hover:text-blue-100 transition-colors duration-200"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                  {saLanguages.filter(language => !filters.languages.includes(language)).map(language => (
                    <button
                      key={language}
                      onClick={() => addLanguage(language)}
                      className="text-left px-3 py-2 bg-background-card hover:bg-gray-600 text-text-secondary hover:text-text-primary rounded-lg text-sm transition-all duration-200 border border-gray-600 hover:border-blue-500"
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Special SA Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-gray-600">
            {/* SA ReelPass Filter */}
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
                  <span className="text-text-secondary font-medium">SA ReelPass Verified Only</span>
                </div>
              </label>
            </div>

            {/* Work Permit Filter */}
            <div className="space-y-4">
              <label className="block text-lg font-medium text-text-primary">
                Work Authorization
              </label>
              <label className="flex items-center space-x-4 cursor-pointer p-4 bg-background-card rounded-xl border border-gray-600 hover:border-orange-500 transition-colors duration-200">
                <input
                  type="checkbox"
                  checked={filters.workPermitRequired}
                  onChange={(e) => setFilters(prev => ({ ...prev, workPermitRequired: e.target.checked }))}
                  className="w-5 h-5 text-orange-500 bg-background-card border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                />
                <div className="flex items-center space-x-3">
                  <Globe className="w-5 h-5 text-orange-400" />
                  <span className="text-text-secondary font-medium">Include candidates requiring work permits</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-gray-600 mt-8">
            <button
              onClick={() => setFilters({
                skills: [],
                experience: '',
                province: '',
                reelPassOnly: true,
                availability: '',
                beeLevel: '',
                languages: [],
                workPermitRequired: false
              })}
              className="text-text-muted hover:text-text-primary font-medium transition-colors duration-200"
            >
              Clear all filters
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-text-muted">
                {filters.skills.length + (filters.experience ? 1 : 0) + (filters.province ? 1 : 0) + (filters.availability ? 1 : 0) + (filters.beeLevel ? 1 : 0) + filters.languages.length} filters applied
              </span>
              <button className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                Search SA Talent
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
            Ready to Find South African Talent?
          </h3>
          <p className="text-text-secondary mb-8 text-lg leading-relaxed">
            Search for verified South African professionals with government-backed credentials and local expertise
          </p>
          <div className="bg-background-card p-6 rounded-xl border border-gray-600">
            <p className="text-text-muted">
              🇿🇦 <strong className="text-text-secondary">SA Focus:</strong> Find candidates with Home Affairs ID verification, SAQA education credentials, SARS employment history, and BEE compliance
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SASearchInterface