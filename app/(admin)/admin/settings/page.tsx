'use client'

import { useState } from 'react'
import { 
  BlurText, 
  AnimatedContent,
  GlareHover,
  FormInput,
  FormTextarea,
  FormError,
  FormSection,
  FormActions,
  useToast
} from '@/app/components'

interface FormErrors {
  companyName?: string
  email?: string
  phone?: string
  currentPassword?: string
  newPassword?: string
  confirmPassword?: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'security' | 'integrations'>('general')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { success, error: showError } = useToast()

  const tabs = [
    { id: 'general', label: 'General', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
    { id: 'notifications', label: 'Notifications', icon: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
    { id: 'security', label: 'Security', icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z' },
    { id: 'integrations', label: 'Integrations', icon: 'M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z' },
  ]

  const validateCompanyInfo = (formData: FormData): FormErrors => {
    const newErrors: FormErrors = {}
    
    const companyName = formData.get('companyName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string

    if (!companyName?.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!email?.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (phone && !/^\+?[\d\s-().]+$/.test(phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    return newErrors
  }

  const validatePassword = (formData: FormData): FormErrors => {
    const newErrors: FormErrors = {}
    
    const currentPassword = formData.get('currentPassword') as string
    const newPassword = formData.get('newPassword') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (!currentPassword) {
      newErrors.currentPassword = 'Current password is required'
    }

    if (!newPassword) {
      newErrors.newPassword = 'New password is required'
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters'
    }

    if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    return newErrors
  }

  const handleCompanySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const newErrors = validateCompanyInfo(formData)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      showError('Please fix the errors below', 'Some fields are invalid.')
      return
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success('Settings saved', 'Your company information has been updated.')
    setIsSubmitting(false)
  }

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    const formData = new FormData(e.currentTarget)
    const newErrors = validatePassword(formData)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setIsSubmitting(false)
      showError('Please fix the errors below', 'Some fields are invalid.')
      return
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    success('Password updated', 'Your password has been changed successfully.')
    setIsSubmitting(false)
    e.currentTarget.reset()
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Settings" />
          </h1>
          <p className="text-zinc-400">
            Manage your account and system preferences
          </p>
        </AnimatedContent>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Sidebar Tabs */}
        <AnimatedContent delay={0.1}>
          <div className="lg:col-span-1">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 text-purple-300 border border-purple-500/20'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={tab.icon} />
                  </svg>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </AnimatedContent>

        {/* Content */}
        <div className="lg:col-span-3">
          {activeTab === 'general' && (
            <AnimatedContent delay={0.2}>
              <form onSubmit={handleCompanySubmit} className="space-y-6">
                <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={300}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <FormSection 
                      title="Company Information"
                      description="Update your company details and contact information"
                    >
                      <div className="space-y-4">
                        <FormInput
                          label="Company Name"
                          name="companyName"
                          defaultValue="RevenueForge Inc."
                          error={errors.companyName}
                          required
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormInput
                            label="Email"
                            name="email"
                            type="email"
                            defaultValue="contact@revenueforge.com"
                            error={errors.email}
                            required
                          />
                          <FormInput
                            label="Phone"
                            name="phone"
                            type="tel"
                            defaultValue="+1-555-123-4567"
                            error={errors.phone}
                            helpText="Include country code (e.g., +1)"
                          />
                        </div>
                        
                        <FormTextarea
                          label="Address"
                          name="address"
                          rows={3}
                          defaultValue="123 Business Street, Suite 100&#10;New York, NY 10001&#10;United States"
                          helpText="Full address including postal code"
                        />
                      </div>
                    </FormSection>
                    
                    <FormActions className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Changes'
                        )}
                      </button>
                    </FormActions>
                  </div>
                </GlareHover>

                <GlareHover glareColor="rgba(6, 182, 212, 0.1)" glareSize={300}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">System Settings</h3>
                    
                    <div className="space-y-4">
                      {[
                        { label: 'Enable Dark Mode', checked: true },
                        { label: 'Email Notifications', checked: true },
                        { label: 'Auto-save Drafts', checked: true },
                        { label: 'Show Welcome Tips', checked: false },
                      ].map((setting) => (
                        <div key={setting.label} className="flex items-center justify-between">
                          <span className="text-zinc-300">{setting.label}</span>
                          <button 
                            type="button"
                            className={`relative w-11 h-6 rounded-full transition-colors ${
                              setting.checked ? 'bg-purple-600' : 'bg-zinc-700'
                            }`}
                          >
                            <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                              setting.checked ? 'translate-x-5' : 'translate-x-0'
                            }`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </GlareHover>
              </form>
            </AnimatedContent>
          )}

          {activeTab === 'notifications' && (
            <AnimatedContent delay={0.2}>
              <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={300}>
                <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Notification Preferences</h3>
                  
                  <div className="space-y-4">
                    {[
                      { label: 'New RFQ Received', email: true, push: true },
                      { label: 'Quote Accepted', email: true, push: true },
                      { label: 'Quote Rejected', email: true, push: false },
                      { label: 'New Order Placed', email: true, push: true },
                      { label: 'Payment Received', email: false, push: true },
                      { label: 'System Updates', email: true, push: false },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0">
                        <span className="text-zinc-300">{item.label}</span>
                        <div className="flex items-center gap-4">
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              defaultChecked={item.email}
                              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20"
                            />
                            <span className="text-sm text-zinc-500">Email</span>
                          </label>
                          <label className="flex items-center gap-2">
                            <input 
                              type="checkbox" 
                              defaultChecked={item.push}
                              className="w-4 h-4 rounded border-zinc-700 bg-zinc-800 text-purple-500 focus:ring-purple-500/20"
                            />
                            <span className="text-sm text-zinc-500">Push</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GlareHover>
            </AnimatedContent>
          )}

          {activeTab === 'security' && (
            <AnimatedContent delay={0.2}>
              <form onSubmit={handlePasswordSubmit} className="space-y-6">
                <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={300}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <FormSection 
                      title="Change Password"
                      description="Update your account password"
                    >
                      <div className="space-y-4">
                        <FormInput
                          label="Current Password"
                          name="currentPassword"
                          type="password"
                          error={errors.currentPassword}
                          required
                        />
                        
                        <FormInput
                          label="New Password"
                          name="newPassword"
                          type="password"
                          error={errors.newPassword}
                          required
                          helpText="Must be at least 8 characters"
                        />
                        
                        <FormInput
                          label="Confirm New Password"
                          name="confirmPassword"
                          type="password"
                          error={errors.confirmPassword}
                          required
                        />
                      </div>
                    </FormSection>
                    
                    <FormActions className="mt-6">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Updating...
                          </>
                        ) : (
                          'Update Password'
                        )}
                      </button>
                    </FormActions>
                  </div>
                </GlareHover>

                <GlareHover glareColor="rgba(6, 182, 212, 0.1)" glareSize={300}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <h3 className="text-lg font-semibold text-zinc-100 mb-4">Two-Factor Authentication</h3>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-zinc-300 font-medium">2FA is disabled</div>
                        <div className="text-sm text-zinc-500">Add an extra layer of security to your account</div>
                      </div>
                      <button 
                        type="button"
                        className="px-4 py-2 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 font-medium hover:border-zinc-600 transition-all"
                      >
                        Enable 2FA
                      </button>
                    </div>
                  </div>
                </GlareHover>
              </form>
            </AnimatedContent>
          )}

          {activeTab === 'integrations' && (
            <AnimatedContent delay={0.2}>
              <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={300}>
                <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                  <h3 className="text-lg font-semibold text-zinc-100 mb-4">Connected Services</h3>
                  
                  <div className="space-y-4">
                    {[
                      { name: 'Stripe', description: 'Payment processing', connected: true, icon: '💳' },
                      { name: 'SendGrid', description: 'Email delivery', connected: true, icon: '📧' },
                      { name: 'Twilio', description: 'SMS & WhatsApp', connected: false, icon: '💬' },
                      { name: 'Google Analytics', description: 'Website analytics', connected: true, icon: '📊' },
                    ].map((integration) => (
                      <div key={integration.name} className="flex items-center justify-between p-4 bg-zinc-800/30 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">
                            {integration.icon}
                          </div>
                          <div>
                            <div className="font-medium text-zinc-100">{integration.name}</div>
                            <div className="text-sm text-zinc-500">{integration.description}</div>
                          </div>
                        </div>
                        <button 
                          type="button"
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            integration.connected
                              ? 'bg-zinc-800/50 text-zinc-300 hover:bg-red-500/10 hover:text-red-400 border border-zinc-700/50'
                              : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border border-purple-500/30'
                          }`}
                        >
                          {integration.connected ? 'Disconnect' : 'Connect'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </GlareHover>
            </AnimatedContent>
          )}
        </div>
      </div>
    </div>
  )
}
