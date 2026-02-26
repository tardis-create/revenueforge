'use client'

import { useState, useEffect } from 'react'
import { 
  BlurText, 
  AnimatedContent,
  GlareHover,
  FormInput,
  FormTextarea,
  FormSection,
  FormActions,
  useToast
} from '@/app/components'
import { apiFetch } from '@/lib/api'

// Types for settings
interface CompanySettings {
  name: string
  address: string
  phone: string
  taxId: string
}

interface SmtpSettings {
  host: string
  port: string
  user: string
  password: string
  fromEmail: string
  fromName: string
}

interface WhiteLabelSettings {
  logoUrl: string
  primaryColor: string
  secondaryColor: string
}

interface Settings {
  company: CompanySettings
  smtp: SmtpSettings
  whiteLabel: WhiteLabelSettings
}

interface FormErrors {
  // Company
  name?: string
  phone?: string
  // SMTP
  host?: string
  port?: string
  user?: string
  password?: string
  fromEmail?: string
  fromName?: string
  // White-label
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
}

type TabId = 'company' | 'smtp' | 'whitelabel'

const DEFAULT_SETTINGS: Settings = {
  company: {
    name: '',
    address: '',
    phone: '',
    taxId: '',
  },
  smtp: {
    host: '',
    port: '587',
    user: '',
    password: '',
    fromEmail: '',
    fromName: '',
  },
  whiteLabel: {
    logoUrl: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#06B6D4',
  },
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('company')
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const { success, error: showError } = useToast()

  const tabs = [
    { 
      id: 'company' as const, 
      label: 'Company Settings', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
    },
    { 
      id: 'smtp' as const, 
      label: 'SMTP Settings', 
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
    },
    { 
      id: 'whitelabel' as const, 
      label: 'White-Label Settings', 
      icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' 
    },
  ]

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      const response = await apiFetch('/api/settings')
      if (response.ok) {
        const data = await response.json() as { settings?: Settings }
        if (data && data.settings) {
          setSettings({
            company: { ...DEFAULT_SETTINGS.company, ...data.settings.company },
            smtp: { ...DEFAULT_SETTINGS.smtp, ...data.settings.smtp },
            whiteLabel: { ...DEFAULT_SETTINGS.whiteLabel, ...data.settings.whiteLabel },
          })
        }
      }
    } catch (error) {
      console.error('Failed to load settings:', error)
      // Keep default settings on error
    } finally {
      setIsLoading(false)
    }
  }

  const validateCompanySettings = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!settings.company.name.trim()) {
      newErrors.name = 'Company name is required'
    }

    if (settings.company.phone && !/^\+?[\d\s\-().]+$/.test(settings.company.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSmtpSettings = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!settings.smtp.host.trim()) {
      newErrors.host = 'SMTP host is required'
    }

    if (!settings.smtp.port.trim()) {
      newErrors.port = 'Port is required'
    } else if (!/^\d+$/.test(settings.smtp.port) || parseInt(settings.smtp.port) < 1 || parseInt(settings.smtp.port) > 65535) {
      newErrors.port = 'Port must be a number between 1 and 65535'
    }

    if (!settings.smtp.user.trim()) {
      newErrors.user = 'SMTP user is required'
    }

    if (!settings.smtp.password.trim()) {
      newErrors.password = 'SMTP password is required'
    }

    if (!settings.smtp.fromEmail.trim()) {
      newErrors.fromEmail = 'From email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.smtp.fromEmail)) {
      newErrors.fromEmail = 'Please enter a valid email address'
    }

    if (!settings.smtp.fromName.trim()) {
      newErrors.fromName = 'From name is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateWhiteLabelSettings = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (settings.whiteLabel.logoUrl && !/^https?:\/\/.+/.test(settings.whiteLabel.logoUrl)) {
      newErrors.logoUrl = 'Logo URL must be a valid URL starting with http:// or https://'
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(settings.whiteLabel.primaryColor)) {
      newErrors.primaryColor = 'Primary color must be a valid hex color (e.g., #8B5CF6)'
    }

    if (!/^#[0-9A-Fa-f]{6}$/.test(settings.whiteLabel.secondaryColor)) {
      newErrors.secondaryColor = 'Secondary color must be a valid hex color (e.g., #06B6D4)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    setIsSubmitting(true)
    setErrors({})

    // Validate based on active tab
    let isValid = false
    switch (activeTab) {
      case 'company':
        isValid = validateCompanySettings()
        break
      case 'smtp':
        isValid = validateSmtpSettings()
        break
      case 'whitelabel':
        isValid = validateWhiteLabelSettings()
        break
    }

    if (!isValid) {
      setIsSubmitting(false)
      showError('Validation Failed', 'Please fix the errors below.')
      return
    }

    try {
      const response = await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        success('Settings Saved', 'Your settings have been updated successfully.')
      } else {
        const errorData = await response.json() as { error?: string }
        showError('Save Failed', errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      showError('Save Failed', 'An error occurred while saving settings.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTestEmail = async () => {
    if (!validateSmtpSettings()) {
      showError('Validation Failed', 'Please fix SMTP settings errors before testing.')
      return
    }

    setIsTestingEmail(true)
    try {
      const response = await apiFetch('/api/settings/test-email', {
        method: 'POST',
        body: JSON.stringify(settings.smtp),
      })

      if (response.ok) {
        const data = await response.json() as { message?: string }
        success('Test Email Sent', data.message || 'Test email sent successfully.')
      } else {
        const errorData = await response.json() as { error?: string }
        showError('Test Failed', errorData.error || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Failed to send test email:', error)
      showError('Test Failed', 'An error occurred while sending test email.')
    } finally {
      setIsTestingEmail(false)
    }
  }

  const updateCompanySetting = <K extends keyof CompanySettings>(key: K, value: CompanySettings[K]) => {
    setSettings(prev => ({
      ...prev,
      company: { ...prev.company, [key]: value }
    }))
    // Clear error when field is edited
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  const updateSmtpSetting = <K extends keyof SmtpSettings>(key: K, value: SmtpSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      smtp: { ...prev.smtp, [key]: value }
    }))
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  const updateWhiteLabelSetting = <K extends keyof WhiteLabelSettings>(key: K, value: WhiteLabelSettings[K]) => {
    setSettings(prev => ({
      ...prev,
      whiteLabel: { ...prev.whiteLabel, [key]: value }
    }))
    if (errors[key as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [key]: undefined }))
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <AnimatedContent>
          <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
            <BlurText text="Admin Settings" />
          </h1>
          <p className="text-zinc-400">
            Configure system settings for RevenueForge
          </p>
        </AnimatedContent>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <svg className="animate-spin h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      ) : (
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Tabs */}
          <AnimatedContent delay={0.1}>
            <div className="lg:col-span-1">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
            {/* Company Settings Tab */}
            {activeTab === 'company' && (
              <AnimatedContent delay={0.2}>
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
                          value={settings.company.name}
                          onChange={(e) => updateCompanySetting('name', e.target.value)}
                          error={errors.name}
                          required
                          placeholder="Enter company name"
                        />
                        
                        <FormTextarea
                          label="Address"
                          name="address"
                          rows={3}
                          value={settings.company.address}
                          onChange={(e) => updateCompanySetting('address', e.target.value)}
                          placeholder="Enter full address including postal code"
                        />
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormInput
                            label="Phone"
                            name="phone"
                            type="tel"
                            value={settings.company.phone}
                            onChange={(e) => updateCompanySetting('phone', e.target.value)}
                            error={errors.phone}
                            helpText="Include country code (e.g., +1)"
                          />
                          <FormInput
                            label="Tax ID"
                            name="taxId"
                            value={settings.company.taxId}
                            onChange={(e) => updateCompanySetting('taxId', e.target.value)}
                            placeholder="e.g., GSTIN, VAT, EIN"
                          />
                        </div>
                      </div>
                    </FormSection>
                    
                    <FormActions className="mt-6">
                      <button
                        type="button"
                        onClick={handleSave}
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
              </AnimatedContent>
            )}

            {/* SMTP Settings Tab */}
            {activeTab === 'smtp' && (
              <AnimatedContent delay={0.2}>
                <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={300}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <FormSection 
                      title="SMTP Configuration"
                      description="Configure email delivery settings for your system"
                    >
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="sm:col-span-2">
                            <FormInput
                              label="SMTP Host"
                              name="smtpHost"
                              value={settings.smtp.host}
                              onChange={(e) => updateSmtpSetting('host', e.target.value)}
                              error={errors.host}
                              required
                              placeholder="smtp.example.com"
                            />
                          </div>
                          <FormInput
                            label="Port"
                            name="smtpPort"
                            type="number"
                            value={settings.smtp.port}
                            onChange={(e) => updateSmtpSetting('port', e.target.value)}
                            error={errors.port}
                            required
                            placeholder="587"
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormInput
                            label="Username"
                            name="smtpUser"
                            value={settings.smtp.user}
                            onChange={(e) => updateSmtpSetting('user', e.target.value)}
                            error={errors.user}
                            required
                            placeholder="your-username"
                          />
                          <FormInput
                            label="Password"
                            name="smtpPassword"
                            type="password"
                            value={settings.smtp.password}
                            onChange={(e) => updateSmtpSetting('password', e.target.value)}
                            error={errors.password}
                            required
                            placeholder="••••••••"
                          />
                        </div>
                        
                        <div className="border-t border-zinc-800/50 pt-4 mt-4">
                          <h4 className="text-sm font-medium text-zinc-300 mb-4">Default Sender Information</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormInput
                              label="From Email"
                              name="fromEmail"
                              type="email"
                              value={settings.smtp.fromEmail}
                              onChange={(e) => updateSmtpSetting('fromEmail', e.target.value)}
                              error={errors.fromEmail}
                              required
                              placeholder="noreply@example.com"
                            />
                            <FormInput
                              label="From Name"
                              name="fromName"
                              value={settings.smtp.fromName}
                              onChange={(e) => updateSmtpSetting('fromName', e.target.value)}
                              error={errors.fromName}
                              required
                              placeholder="Company Name"
                            />
                          </div>
                        </div>
                      </div>
                    </FormSection>
                    
                    <FormActions className="mt-6">
                      <button
                        type="button"
                        onClick={handleTestEmail}
                        disabled={isTestingEmail}
                        className="px-4 py-2.5 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-300 font-medium hover:border-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isTestingEmail ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Sending...
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            Test Email
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={handleSave}
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
              </AnimatedContent>
            )}

            {/* White-Label Settings Tab */}
            {activeTab === 'whitelabel' && (
              <AnimatedContent delay={0.2}>
                <GlareHover glareColor="rgba(168, 85, 247, 0.15)" glareSize={300}>
                  <div className="p-6 bg-zinc-900/60 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
                    <FormSection 
                      title="White-Label Configuration"
                      description="Customize the appearance of your platform"
                    >
                      <div className="space-y-4">
                        <FormInput
                          label="Logo URL"
                          name="logoUrl"
                          type="url"
                          value={settings.whiteLabel.logoUrl}
                          onChange={(e) => updateWhiteLabelSetting('logoUrl', e.target.value)}
                          error={errors.logoUrl}
                          placeholder="https://example.com/logo.png"
                          helpText="URL to your company logo (recommended: 200x50px PNG)"
                        />

                        {/* Logo Preview */}
                        {settings.whiteLabel.logoUrl && (
                          <div className="flex items-center gap-4 p-4 bg-zinc-800/30 rounded-lg">
                            <span className="text-sm text-zinc-400">Preview:</span>
                            <img 
                              src={settings.whiteLabel.logoUrl} 
                              alt="Logo preview" 
                              className="h-10 max-w-[200px] object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">
                              Primary Color
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={settings.whiteLabel.primaryColor}
                                onChange={(e) => updateWhiteLabelSetting('primaryColor', e.target.value)}
                                className="w-12 h-12 rounded-lg border border-zinc-700/50 cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={settings.whiteLabel.primaryColor}
                                onChange={(e) => updateWhiteLabelSetting('primaryColor', e.target.value)}
                                className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 font-mono text-sm"
                                placeholder="#8B5CF6"
                              />
                            </div>
                            {errors.primaryColor && (
                              <p className="text-sm text-red-400">{errors.primaryColor}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-zinc-300">
                              Secondary Color
                            </label>
                            <div className="flex items-center gap-3">
                              <input
                                type="color"
                                value={settings.whiteLabel.secondaryColor}
                                onChange={(e) => updateWhiteLabelSetting('secondaryColor', e.target.value)}
                                className="w-12 h-12 rounded-lg border border-zinc-700/50 cursor-pointer bg-transparent"
                              />
                              <input
                                type="text"
                                value={settings.whiteLabel.secondaryColor}
                                onChange={(e) => updateWhiteLabelSetting('secondaryColor', e.target.value)}
                                className="flex-1 px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 font-mono text-sm"
                                placeholder="#06B6D4"
                              />
                            </div>
                            {errors.secondaryColor && (
                              <p className="text-sm text-red-400">{errors.secondaryColor}</p>
                            )}
                          </div>
                        </div>

                        {/* Color Preview */}
                        <div className="p-4 bg-zinc-800/30 rounded-lg">
                          <p className="text-sm text-zinc-400 mb-3">Color Preview:</p>
                          <div className="flex items-center gap-4">
                            <div 
                              className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-medium shadow-lg"
                              style={{ backgroundColor: settings.whiteLabel.primaryColor }}
                            >
                              Primary
                            </div>
                            <div 
                              className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-medium shadow-lg"
                              style={{ backgroundColor: settings.whiteLabel.secondaryColor }}
                            >
                              Secondary
                            </div>
                            <div 
                              className="flex-1 h-16 rounded-lg flex items-center justify-center text-white font-medium shadow-lg"
                              style={{ background: `linear-gradient(to right, ${settings.whiteLabel.primaryColor}, ${settings.whiteLabel.secondaryColor})` }}
                            >
                              Gradient
                            </div>
                          </div>
                        </div>
                      </div>
                    </FormSection>
                    
                    <FormActions className="mt-6">
                      <button
                        type="button"
                        onClick={handleSave}
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
              </AnimatedContent>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
