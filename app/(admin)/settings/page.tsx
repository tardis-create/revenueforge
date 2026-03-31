'use client'

import { useState } from 'react'
import { AnimatedContent } from '@/app/components'
import { useSettings } from '@/lib/use-settings'

export default function AdminSettingsPage() {
  const { branding, loading, saving, saveSettings, uploadLogo, removeLogo } = useSettings()
  const [formData, setFormData] = useState({
    name: branding.name,
    address: branding.address || '',
    email: branding.email || '',
    phone: branding.phone || '',
  })
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    const success = await saveSettings(formData)
    if (success) {
      alert('Settings saved successfully!')
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG or JPG)')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file must be less than 2MB')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Upload logo
    const base64Logo = await uploadLogo(file)
    if (base64Logo) {
      await saveSettings({ logo: base64Logo })
      alert('Logo uploaded successfully!')
    } else {
      alert('Failed to upload logo')
      setLogoPreview(null)
    }
  }

  const handleRemoveLogo = async () => {
    if (window.confirm('Are you sure you want to remove the logo?')) {
      await removeLogo()
      setLogoPreview(null)
      alert('Logo removed successfully!')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950" />

      {/* Header */}
      <header className="relative px-6 lg:px-12 py-8 lg:py-12 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto">
          <AnimatedContent>
            <h1 className="text-3xl lg:text-4xl font-bold text-zinc-100 mb-2">
              Settings
            </h1>
            <p className="text-zinc-400">
              Configure your clinic branding and settings
            </p>
          </AnimatedContent>
        </div>
      </header>

      {/* Content */}
      <main className="relative max-w-7xl mx-auto px-6 lg:px-12 py-8 lg:py-12 pb-24 lg:pb-12 space-y-6">
        <AnimatedContent delay={0.1}>
          <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-zinc-100 mb-4">Clinic Branding</h2>
            <div className="space-y-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Clinic Logo</label>
                <div className="flex items-start gap-6">
                  {branding.logo || logoPreview ? (
                    <div className="relative">
                      <img
                        src={`data:image/png;base64,${branding.logo}` || logoPreview || ''}
                        alt="Clinic Logo"
                        className="w-32 h-32 object-contain bg-white rounded-lg border border-zinc-700"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <div className="w-32 h-32 bg-zinc-800 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center text-zinc-500">
                      <span className="text-xs text-center">No logo</span>
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="text-sm text-zinc-400">
                      Upload your clinic logo to appear on quotes and invoices.
                    </p>
                    <p className="text-xs text-zinc-500">
                      Recommended: PNG or JPG, up to 2MB. Square or rectangular format works best.
                    </p>
                    <div>
                      <label className="inline-block px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg cursor-pointer transition-colors text-sm">
                        Upload Logo
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-700 pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Clinic Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                      placeholder="Your Clinic Name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-400 mb-2">Address</label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={2}
                      className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50 resize-none"
                      placeholder="123 Main Street, City, State 12345"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                        placeholder="contact@clinic.com"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-100 focus:outline-none focus:border-purple-500/50"
                        placeholder="+1-555-0123"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedContent>

        <AnimatedContent delay={0.2}>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </AnimatedContent>
      </main>
    </div>
  )
}
