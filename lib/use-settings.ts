import { useState, useEffect } from 'react';

export interface ClinicBranding {
  name: string;
  logo?: string; // base64 encoded PNG/JPG
  address?: string;
  email?: string;
  phone?: string;
}

const SETTINGS_STORAGE_KEY = 'revenueforge_clinic_branding';

export function useSettings() {
  const [branding, setBranding] = useState<ClinicBranding>({
    name: 'RevenueForge',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setBranding(parsed);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = async (newBranding: Partial<ClinicBranding>) => {
    setSaving(true);
    try {
      const updated = { ...branding, ...newBranding };
      setBranding(updated);
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const uploadLogo = async (file: File): Promise<string | null> => {
    try {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result;
          if (result && typeof result === 'string') {
            // Convert to base64 without the data URL prefix
            const base64 = result.split(',')[1];
            resolve(base64);
          } else {
            reject(new Error('Failed to read file'));
          }
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Failed to upload logo:', error);
      return null;
    }
  };

  const removeLogo = async () => {
    return saveSettings({ logo: undefined });
  };

  return {
    branding,
    loading,
    saving,
    saveSettings,
    uploadLogo,
    removeLogo,
  };
}
