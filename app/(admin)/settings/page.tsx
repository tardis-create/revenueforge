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
import { API_BASE_URL } from '@/lib/api'

// Types for settings
interface CompanySettings {
  name: string
  address: string
  phone: string
  taxId: string
}

interface SMTPSettings {
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
  smtp: SMTPSettings
  whiteLabel: WhiteLabelSettings
}

interface FormErrors {
  // Company
  name?: string
  address?: string
  phone?: string
  taxId?: string
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

const defaultSettings: Settings = {
  company: {
    name: '',
    address: '',
    phone: '',
    taxId: ''
  },
  smtp: {
    host: '',
    port: '587',
    user: '',
    password: '',
    fromEmail: '',
    fromName: ''
  },
  whiteLabel: {
    logoUrl: '',
    primaryColor: '#8B5CF6',
    secondaryColor: '#06B6D4'
  }
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'company' | 'smtp' | 'whitelabel'>('company')
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const { success, error: showError } = useToast()

  const tabs = [
    { 
      id: 'company', 
      label: 'Company Settings', 
      icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' 
    },
    { 
      id: 'smtp', 
      label: 'SMTP Settings', 
      icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' 
    },
    { 
      id: 'whitelabel', 
      label: 'White-Label', 
      icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01' 
    },
  ]

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${API_BASE_URL}/api/settings`)
      const data = await response.json() as { success: boolean; data?: Settings; error?: string }
      
      if (data.success && data.data) {
        setSettings({
          company: { ...defaultSettings.company, ...data.data.company },
          smtp: { ...defaultSettings.smtp, ...data.data.smtp },
          whiteLabel: { ...defaultSettings.whiteLabel, ...data.data.whiteLabel }
        })
      }
    } catch {
      // Settings might not exist yet, use defaults
      console.log('Settings not found, using defaults')
    } finally {
      setIsLoading(false)
    }
  }

  // Validation functions
  const validateCompanySettings = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!settings.company.name.trim()) {
      newErrors.name = 'Company name is required'
    }
    
    if (!settings.company.address.trim()) {
      newErrors.address = 'Address is required'
    }
    
    if (!settings.company.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s\-().]+$/.test(settings.company.phone)) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (!settings.company.taxId.trim()) {
      newErrors.taxId = 'Tax ID is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const validateSMTPSettings = (): boolean => {
    const newErrors: FormErrors = {}
    
    if (!settings.smtp.host.trim()) {
      newErrors.host = 'SMTP host is required'
    }
    
    if (!settings.smtp.port.trim()) {
      newErrors.port = 'Port is required'
    } else if (!/^\d+$/.test(settings.smtp.port) || parseInt(settings.smtp.port) < 1 || parseInt(settings.smtp.port) > 65535) {
      newErrors.port = 'Port must be between 1 and 65535'
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
      newErrors.logoUrl = 'Logo URL must be a valid URL'
    }
    
    if (!settings.whiteLabel.primaryColor.trim()) {
      newErrors.primaryColor = 'Primary color is required'
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(settings.whiteLabel.primaryColor)) {
      newErrors.primaryColor = 'Color must be a valid hex color (e.g., #8B5CF6)'
    }
    
    if (!settings.whiteLabel.secondaryColor.trim()) {
      newErrors.secondaryColor = 'Secondary color is required'
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(settings.whiteLabel.secondaryColor)) {
      newErrors.secondaryColor = 'Color must be a valid hex color (e.g., #06B6D4)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Save settings
  const handleSave = async () => {
    // Validate current tab
    let isValid = false
    switch (activeTab) {
      case 'company':
        isValid = validateCompanySettings()
        break
      case 'smtp':
        isValid = validateSMTPSettings()
        break
      case 'whitelabel':
        isValid = validateWhiteLabelSettings()
        break
    }

    if (!isValid) {
      showError('Validation Error', 'Please fix the errors before saving.')
      return
    }

    try {
      setIsSaving(true)
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })
      const data = await response.json() as { success: boolean; error?: string }
      
      if (data.success) {
        success('Settings Saved', 'Your settings have been updated successfully.')
      } else {
        showError('Save Failed', data.error || 'Failed to save settings')
      }
    } catch {
      showError('Save Failed', 'Could not connect to the server')
    } finally {
      setIsSaving(false)
    }
  }

  // Test email
  const handleTestEmail = async () => {
    if (!validateSMTPSettings()) {
      showError('Validation Error', 'Please fill in all SMTP settings before testing.')
      return
    }

    try {
      setIsTestingEmail(true)
      const response = await fetch(`${API_BASE_URL}/api/settings/test-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings.smtp)
      })
      const data = await response.json() as { success: boolean; error?: string }
      
      if (data.success) {
        success('Test Email Sent', 'Check your inbox for the test email.')
      } else {
        showError('Test Failed', data.error || 'Failed to send test email')
      }
    } catch {
      showError('Test Failed', 'Could not connect to the server')
    } finally {
      setIsTestingEmail(false)
    }
  }

  // Update handlers
  const updateCompany = (field: keyof CompanySettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      company: { ...prev.company, [field]: value }
    }))
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const updateSMTP = (field: keyof SMTPSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      smtp: { ...prev.smtp, [field]: value }
    }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const updateWhiteLabel = (field: keyof WhiteLabelSettings, value: string) => {
    setSettings(prev => ({
      ...prev,
      whiteLabel: { ...prev.whiteLabel, [field]: value }
    }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
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
            Configure your system settings, email, and branding
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
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab)
                    setErrors({})
                  }}
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
                    description="Your company details for invoices and communications"
                  >
                    <div className="space-y-4">
                      <FormInput
                        label="Company Name"
                        name="companyName"
                        value={settings.company.name}
                        onChange={(e) => updateCompany('name', e.target.value)}
                        error={errors.name}
                        placeholder="Acme Corporation"
                        required
                      />
                      
                      <FormTextarea
                        label="Address"
                        name="address"
                        rows={3}
                        value={settings.company.address}
                        onChange={(e) => updateCompany('address', e.target.value)}
                        error={errors.address}
                        placeholder="123 Business Street&#10;City, State 12345&#10;Country"
                        required
                      />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Phone"
                          name="phone"
                          type="tel"
                          value={settings.company.phone}
                          onChange={(e) => updateCompany('phone', e.target.value)}
                          error={errors.phone}
                          placeholder="+1-555-123-4567"
                          helpText="Include country code"
                          required
                        />
                        <FormInput
                          label="Tax ID"
                          name="taxId"
                          value={settings.company.taxId}
                          onChange={(e) => updateCompany('taxId', e.target.value)}
                          error={errors.taxId}
                          placeholder="GSTIN / VAT / EIN"
                          helpText="Your business tax identifier"
                          required
                        />
                      </div>
                    </div>
                  </FormSection>
                  
                  <FormActions className="mt-6">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
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
                    description="Configure your email server for sending notifications"
                  >
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <FormInput
                            label="SMTP Host"
                            name="smtpHost"
                            value={settings.smtp.host}
                            onChange={(e) => updateSMTP('host', e.target.value)}
                            error={errors.host}
                            placeholder="smtp.example.com"
                            required
                          />
                        </div>
                        <FormInput
                          label="Port"
                          name="smtpPort"
                          type="number"
                          value={settings.smtp.port}
                          onChange={(e) => updateSMTP('port', e.target.value)}
                          error={errors.port}
                          placeholder="587"
                          helpText="Usually 587 or 465"
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormInput
                          label="Username"
                          name="smtpUser"
                          value={settings.smtp.user}
                          onChange={(e) => updateSMTP('user', e.target.value)}
                          error={errors.user}
                          placeholder="your-email@example.com"
                          required
                        />
                        <FormInput
                          label="Password"
                          name="smtpPassword"
                          type="password"
                          value={settings.smtp.password}
                          onChange={(e) => updateSMTP('password', e.target.value)}
                          error={errors.password}
                          placeholder="••••••••"
                          helpText="App password recommended"
                          required
                        />
                      </div>
                      
                      <div className="border-t border-zinc-800/50 pt-4 mt-4">
                        <h4 className="text-sm font-medium text-zinc-300 mb-3">Sender Information</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormInput
                            label="From Email"
                            name="fromEmail"
                            type="email"
                            value={settings.smtp.fromEmail}
                            onChange={(e) => updateSMTP('fromEmail', e.target.value)}
                            error={errors.fromEmail}
                            placeholder="noreply@yourcompany.com"
                            required
                          />
                          <FormInput
                            label="From Name"
                            name="fromName"
                            value={settings.smtp.fromName}
                            onChange={(e) => updateSMTP('fromName', e.target.value)}
                            error={errors.fromName}
                            placeholder="Your Company Name"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  </FormSection>
                  
                  <FormActions className="mt-6">
                    <div className="flex flex-wrap gap-3">
                      <button
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
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            Saving...
                          </>
                        ) : (
                          'Save Settings'
                        )}
                      </button>
                    </div>
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
                    title="White-Label Settings"
                    description="Customize branding colors and logo"
                  >
                    <div className="space-y-6">
                      {/* Logo URL */}
                      <div>
                        <label className="block text-sm font-medium text-zinc-300 mb-2">
                          Logo URL
                        </label>
                        <div className="flex gap-3">
                          <input
                            type="url"
                            name="logoUrl"
                            value={settings.whiteLabel.logoUrl}
                            onChange={(e) => updateWhiteLabel('logoUrl', e.target.value)}
                            placeholder="https://example.com/logo.png"
                            className={`flex-1 px-4 py-2.5 bg-zinc-800/50 border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors ${
                              errors.logoUrl ? 'border-red-500/50' : 'border-zinc-700/50 focus:border-purple-500/50'
                            }`}
                          />
                        </div>
                        {errors.logoUrl && (
                          <p className="mt-1 text-sm text-red-400">{errors.logoUrl}</p>
                        )}
                        <p className="mt-1 text-xs text-zinc-500">
                          URL to your company logo (PNG, SVG recommended)
                        </p>
                        {/* Logo Preview */}
                        {settings.whiteLabel.logoUrl && (
                          <div className="mt-3 p-4 bg-zinc-800/30 rounded-lg">
                            <p className="text-xs text-zinc-500 mb-2">Preview:</p>
                            <img 
                              src={settings.whiteLabel.logoUrl} 
                              alt="Logo preview" 
                              className="max-h-16 object-contain"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Colors */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {/* Primary Color */}
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Primary Color <span className="text-red-400">*</span>
                          </label>
                          <div className="flex gap-3 items-center">
                            <input
                              type="color"
                              value={settings.whiteLabel.primaryColor}
                              onChange={(e) => updateWhiteLabel('primaryColor', e.target.value)}
                              className="w-12 h-10 rounded-lg border border-zinc-700/50 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings.whiteLabel.primaryColor}
                              onChange={(e) => updateWhiteLabel('primaryColor', e.target.value)}
                              placeholder="#8B5CF6"
                              className={`flex-1 px-4 py-2.5 bg-zinc-800/50 border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors font-mono text-sm ${
                                errors.primaryColor ? 'border-red-500/50' : 'border-zinc-700/50 focus:border-purple-500/50'
                              }`}
                            />
                          </div>
                          {errors.primaryColor && (
                            <p className="mt-1 text-sm text-red-400">{errors.primaryColor}</p>
                          )}
                          <p className="mt-1 text-xs text-zinc-500">
                            Used for buttons, links, and accents
                          </p>
                        </div>

                        {/* Secondary Color */}
                        <div>
                          <label className="block text-sm font-medium text-zinc-300 mb-2">
                            Secondary Color <span className="text-red-400">*</span>
                          </label>
                          <div className="flex gap-3 items-center">
                            <input
                              type="color"
                              value={settings.whiteLabel.secondaryColor}
                              onChange={(e) => updateWhiteLabel('secondaryColor', e.target.value)}
                              className="w-12 h-10 rounded-lg border border-zinc-700/50 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={settings.whiteLabel.secondaryColor}
                              onChange={(e) => updateWhiteLabel('secondaryColor', e.target.value)}
                              placeholder="#06B6D4"
                              className={`flex-1 px-4 py-2.5 bg-zinc-800/50 border rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-colors font-mono text-sm ${
                                errors.secondaryColor ? 'border-red-500/50' : 'border-zinc-700/50 focus:border-purple-500/50'
                              }`}
                            />
                          </div>
                          {errors.secondaryColor && (
                            <p className="mt-1 text-sm text-red-400">{errors.secondaryColor}</p>
                          )}
                          <p className="mt-1 text-xs text-zinc-500">
                            Used for gradients and highlights
                          </p>
                        </div>
                      </div>

                      {/* Color Preview */}
                      <div className="p-4 bg-zinc-800/30 rounded-lg">
                        <p className="text-xs text-zinc-500 mb-3">Preview:</p>
                        <div className="flex gap-3 items-center">
                          <button 
                            type="button"
                            className="px-4 py-2 rounded-lg text-white font-medium"
                            style={{ backgroundColor: settings.whiteLabel.primaryColor }}
                          >
                            Primary Button
                          </button>
                          <button 
                            type="button"
                            className="px-4 py-2 rounded-lg text-white font-medium"
                            style={{ backgroundColor: settings.whiteLabel.secondaryColor }}
                          >
                            Secondary Button
                          </button>
                          <span 
                            className="font-medium"
                            style={{ color: settings.whiteLabel.primaryColor }}
                          >
                            Link Text
                          </span>
                        </div>
                      </div>
                    </div>
                  </FormSection>
                  
                  <FormActions className="mt-6">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 border border-purple-500/30 rounded-lg text-white font-medium hover:border-purple-400/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSaving ? (
                        <>
                          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Saving...
                        </>
                      ) : (
                        'Save Settings'
                      )}
                    </button>
                  </FormActions>
                </div>
              </GlareHover>
            </AnimatedContent>
          )}
        </div>
      </div>
    </div>
  )
}
