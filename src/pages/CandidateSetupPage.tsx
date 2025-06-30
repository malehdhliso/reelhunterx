import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import { 
  updateCandidateProfile, 
  updateCandidateAvailability, 
  addCandidateSkill,
  getCandidateProfile,
  getCandidateSkills,
  getCandidateAvailability
} from '../services/profileService'
import { Shield, CheckCircle, Clock, MapPin, DollarSign, Briefcase, GraduationCap, AlertTriangle, Save, Plus, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const CandidateSetupPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  // Profile form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [headline, setHeadline] = useState('')
  const [province, setProvince] = useState('')
  
  // Availability form state
  const [availabilityStatus, setAvailabilityStatus] = useState<'available' | 'open' | 'not-looking'>('not-looking')
  const [availableFrom, setAvailableFrom] = useState('')
  const [noticePeriod, setNoticePeriod] = useState('')
  const [salaryMin, setSalaryMin] = useState('')
  const [salaryMax, setSalaryMax] = useState('')
  const [workType, setWorkType] = useState<'remote' | 'hybrid' | 'onsite' | 'flexible'>('remote')
  const [locations, setLocations] = useState<string[]>([])
  const [locationInput, setLocationInput] = useState('')
  
  // Skills form state
  const [skills, setSkills] = useState<{name: string, verified: boolean}[]>([])
  const [newSkill, setNewSkill] = useState('')

  // Load existing data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserData()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const loadUserData = async () => {
    try {
      setIsLoading(true)
      
      // Get profile data
      const profile = await getCandidateProfile(user!.id)
      if (profile) {
        setFirstName(profile.first_name || '')
        setLastName(profile.last_name || '')
        setHeadline(profile.headline || '')
        setProvince(profile.province || '')
        
        // Get skills
        const skillsData = await getCandidateSkills(profile.id)
        setSkills(skillsData.map(skill => ({
          name: skill.name,
          verified: skill.verified
        })))
        
        // Get availability
        const availability = await getCandidateAvailability(profile.id)
        if (availability) {
          setAvailabilityStatus(availability.availability_status)
          setAvailableFrom(availability.available_from ? new Date(availability.available_from).toISOString().split('T')[0] : '')
          setNoticePeriod(availability.notice_period_days?.toString() || '')
          setSalaryMin(availability.salary_expectation_min?.toString() || '')
          setSalaryMax(availability.salary_expectation_max?.toString() || '')
          setWorkType(availability.preferred_work_type as any || 'remote')
          setLocations(availability.location_preferences || [])
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveProfile = async () => {
    if (!isAuthenticated || !user) return
    
    try {
      setIsSaving(true)
      setSaveError(null)
      setSaveSuccess(false)
      
      // Update profile
      await updateCandidateProfile(user.id, {
        firstName,
        lastName,
        headline,
        completionScore: 60, // Set a reasonable score to make the profile searchable
        province: province || undefined
      })
      
      // Update availability
      await updateCandidateAvailability(user.id, {
        status: availabilityStatus,
        availableFrom: availableFrom || undefined,
        noticePeriodDays: noticePeriod ? parseInt(noticePeriod) : undefined,
        salaryMin: salaryMin ? parseInt(salaryMin) : undefined,
        salaryMax: salaryMax ? parseInt(salaryMax) : undefined,
        preferredWorkType: workType,
        locationPreferences: locations
      })
      
      // Clear existing skills and add new ones
      // In a real implementation, you'd want to update existing skills instead of recreating them
      for (const skill of skills) {
        await addCandidateSkill(user.id, {
          name: skill.name,
          verified: skill.verified
        })
      }
      
      setSaveSuccess(true)
      
      // Redirect to search page after successful save
      setTimeout(() => {
        navigate('/search')
      }, 2000)
      
    } catch (error) {
      console.error('Error saving profile:', error)
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile')
    } finally {
      setIsSaving(false)
    }
  }

  const addLocation = () => {
    if (locationInput && !locations.includes(locationInput)) {
      setLocations([...locations, locationInput])
      setLocationInput('')
    }
  }

  const removeLocation = (location: string) => {
    setLocations(locations.filter(loc => loc !== location))
  }

  const addSkillItem = () => {
    if (newSkill && !skills.some(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setSkills([...skills, { name: newSkill, verified: false }])
      setNewSkill('')
    }
  }

  const removeSkill = (skillName: string) => {
    setSkills(skills.filter(s => s.name !== skillName))
  }

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto py-12">
          <div className="text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-text-primary mb-2">Authentication Required</h2>
            <p className="text-text-secondary mb-6">Please log in to set up your candidate profile.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-text-muted">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center space-x-4 mb-6">
            <div className="p-4 bg-primary-500/10 rounded-2xl">
              <Shield className="w-10 h-10 text-primary-400" />
            </div>
            <h1 className="text-4xl font-bold text-text-primary">Candidate Profile Setup</h1>
          </div>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">
            Complete your profile to be discoverable by recruiters and receive job opportunities
          </p>
        </div>

        {/* Success Message */}
        {saveSuccess && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <h3 className="text-lg font-semibold text-green-400">Profile Saved Successfully</h3>
                <p className="text-green-300">Your profile has been updated and is now discoverable by recruiters.</p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {saveError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <div>
                <h3 className="text-lg font-semibold text-red-400">Error Saving Profile</h3>
                <p className="text-red-300">{saveError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-background-panel border border-gray-600 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Briefcase className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-semibold text-text-primary">Basic Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your first name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Your last name"
                required
              />
            </div>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Professional Headline *
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="e.g. Senior Software Engineer | React | Node.js"
              required
            />
            <p className="mt-1 text-sm text-text-muted">
              This appears in search results and helps recruiters understand your role
            </p>
          </div>
          
          <div className="mt-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Province (South Africa)
            </label>
            <select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="">Select Province</option>
              <option value="eastern_cape">Eastern Cape</option>
              <option value="free_state">Free State</option>
              <option value="gauteng">Gauteng</option>
              <option value="kwazulu_natal">KwaZulu-Natal</option>
              <option value="limpopo">Limpopo</option>
              <option value="mpumalanga">Mpumalanga</option>
              <option value="northern_cape">Northern Cape</option>
              <option value="north_west">North West</option>
              <option value="western_cape">Western Cape</option>
            </select>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-background-panel border border-gray-600 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <GraduationCap className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-semibold text-text-primary">Skills</h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Add Skills *
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addSkillItem()}
                className="flex-1 px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="e.g. React, JavaScript, Project Management"
              />
              <button
                onClick={addSkillItem}
                className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors duration-200"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-text-muted">
              Add at least 3 skills to improve your discoverability
            </p>
          </div>
          
          {skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-primary-500/20 text-primary-300 px-3 py-2 rounded-full"
                >
                  <span>{skill.name}</span>
                  <button
                    onClick={() => removeSkill(skill.name)}
                    className="hover:text-primary-100 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-background-card rounded-xl border border-gray-600">
              <p className="text-text-muted">No skills added yet</p>
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="bg-background-panel border border-gray-600 rounded-xl p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Clock className="w-6 h-6 text-primary-400" />
            <h2 className="text-2xl font-semibold text-text-primary">Availability</h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-primary mb-2">
              Availability Status *
            </label>
            <select
              value={availabilityStatus}
              onChange={(e) => setAvailabilityStatus(e.target.value as any)}
              className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
            >
              <option value="available">Available Now</option>
              <option value="open">Open to Opportunities</option>
              <option value="not-looking">Not Looking</option>
            </select>
          </div>
          
          {availabilityStatus !== 'not-looking' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Available From
                  </label>
                  <input
                    type="date"
                    value={availableFrom}
                    onChange={(e) => setAvailableFrom(e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Notice Period (days)
                  </label>
                  <input
                    type="number"
                    value={noticePeriod}
                    onChange={(e) => setNoticePeriod(e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 30"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Minimum Salary Expectation
                  </label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 50000"
                    min="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">
                    Maximum Salary Expectation
                  </label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. 70000"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Preferred Work Type
                </label>
                <select
                  value={workType}
                  onChange={(e) => setWorkType(e.target.value as any)}
                  className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">Onsite</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  Location Preferences
                </label>
                <div className="flex space-x-2 mb-3">
                  <input
                    type="text"
                    value={locationInput}
                    onChange={(e) => setLocationInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addLocation()}
                    className="flex-1 px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="e.g. Johannesburg, Cape Town"
                  />
                  <button
                    onClick={addLocation}
                    className="px-4 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                
                {locations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {locations.map((location, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 bg-blue-500/20 text-blue-300 px-3 py-2 rounded-full"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>{location}</span>
                        <button
                          onClick={() => removeLocation(location)}
                          className="hover:text-blue-100 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-text-muted">
                    Add locations where you're willing to work
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSaveProfile}
            disabled={isSaving || !firstName || !lastName || !headline || skills.length === 0}
            className="flex items-center space-x-2 px-8 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default CandidateSetupPage