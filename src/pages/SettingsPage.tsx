import React, { useState, useEffect } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import { User, Bell, Shield, CreditCard, Save, Camera, Mail, Briefcase, Building } from 'lucide-react'
import SAReelPassDashboard from '../components/reelpass/SAReelPassDashboard'

const SettingsPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth()
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')

  // Form state for profile information
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    company: '',
    phone: '',
    bio: ''
  })

  // Initialize form data from user authentication data
  useEffect(() => {
    if (user) {
      const fullName = user.user_metadata?.full_name || ''
      const nameParts = fullName.split(' ')
      
      setProfileData({
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        jobTitle: user.user_metadata?.job_title || '',
        company: user.user_metadata?.company || '',
        phone: user.user_metadata?.phone || '',
        bio: user.user_metadata?.bio || ''
      })
    }
  }, [user])

  const handleInputChange = (field: string, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSaveProfile = async () => {
    setIsLoading(true)
    try {
      // TODO: Implement actual profile update via Supabase
      // For now, just simulate a save operation
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setSaveMessage('Profile updated successfully!')
      setTimeout(() => setSaveMessage(''), 3000)
    } catch (error) {
      setSaveMessage('Failed to update profile. Please try again.')
      setTimeout(() => setSaveMessage(''), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const getUserInitials = () => {
    if (profileData.firstName && profileData.lastName) {
      return (profileData.firstName[0] + profileData.lastName[0]).toUpperCase()
    }
    if (profileData.firstName) {
      return profileData.firstName.slice(0, 2).toUpperCase()
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase()
    }
    return 'U'
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'reelpass', label: 'ReelPass', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ]

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Shield className="w-16 h-16 text-text-muted mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-text-primary mb-2">Authentication Required</h2>
            <p className="text-text-muted">Please log in to access your settings.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-text-primary mb-2">Account Settings</h1>
          <p className="text-lg text-text-secondary">Manage your account preferences and settings</p>
        </div>

        {/* Tabs */}
        <div className="bg-background-panel border border-gray-600 rounded-2xl overflow-hidden">
          <div className="flex border-b border-gray-600">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white border-b-2 border-primary-400'
                    : 'text-text-secondary hover:text-text-primary hover:bg-background-card'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-8">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                {/* Profile Picture Section */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-2xl">
                        {getUserInitials()}
                      </span>
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-2 bg-primary-500 hover:bg-primary-600 text-white rounded-full transition-colors duration-200">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-text-primary">
                      {profileData.firstName} {profileData.lastName}
                    </h3>
                    <p className="text-text-muted">{profileData.jobTitle || 'Talent Acquisition Lead'}</p>
                    <button className="mt-2 text-primary-400 hover:text-primary-300 font-medium transition-colors duration-200">
                      Change Profile Picture
                    </button>
                  </div>
                </div>

                {/* Profile Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={profileData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your first name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={profileData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your last name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <Briefcase className="w-4 h-4 inline mr-2" />
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={profileData.jobTitle}
                      onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your job title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      <Building className="w-4 h-4 inline mr-2" />
                      Company
                    </label>
                    <input
                      type="text"
                      value={profileData.company}
                      onChange={(e) => handleInputChange('company', e.target.value)}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-text-primary mb-2">
                      Bio
                    </label>
                    <textarea
                      value={profileData.bio}
                      onChange={(e) => handleInputChange('bio', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-3 bg-background-card border border-gray-600 rounded-xl text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center justify-between pt-6 border-t border-gray-600">
                  {saveMessage && (
                    <div className={`text-sm font-medium ${
                      saveMessage.includes('success') ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {saveMessage}
                    </div>
                  )}
                  <button
                    onClick={handleSaveProfile}
                    disabled={isLoading}
                    className="ml-auto bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-8 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* ReelPass Tab */}
            {activeTab === 'reelpass' && (
              <div>
                <SAReelPassDashboard />
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Notification Preferences</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                      <div>
                        <h4 className="font-medium text-text-primary">Email Notifications</h4>
                        <p className="text-text-muted text-sm">Receive updates about your applications and matches</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-primary-500" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-background-card rounded-xl border border-gray-600">
                      <div>
                        <h4 className="font-medium text-text-primary">Push Notifications</h4>
                        <p className="text-text-muted text-sm">Get instant alerts on your device</p>
                      </div>
                      <input type="checkbox" className="w-5 h-5 text-primary-500" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Security Settings</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-background-card rounded-xl border border-gray-600">
                      <h4 className="font-medium text-text-primary mb-2">Change Password</h4>
                      <p className="text-text-muted text-sm mb-4">Update your password to keep your account secure</p>
                      <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-xl font-medium transition-colors duration-200">
                        Change Password
                      </button>
                    </div>
                    <div className="p-4 bg-background-card rounded-xl border border-gray-600">
                      <h4 className="font-medium text-text-primary mb-2">Two-Factor Authentication</h4>
                      <p className="text-text-muted text-sm mb-4">Add an extra layer of security to your account</p>
                      <button className="bg-background-primary hover:bg-gray-600 text-text-primary px-6 py-2 rounded-xl font-medium border border-gray-600 transition-colors duration-200">
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Billing Tab */}
            {activeTab === 'billing' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold text-text-primary mb-4">Billing Information</h3>
                  <div className="p-6 bg-background-card rounded-xl border border-gray-600">
                    <div className="text-center">
                      <CreditCard className="w-16 h-16 text-text-muted mx-auto mb-4" />
                      <h4 className="text-lg font-semibold text-text-primary mb-2">No billing information</h4>
                      <p className="text-text-muted mb-4">You're currently on the free plan</p>
                      <button className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors duration-200">
                        Upgrade Plan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default SettingsPage