import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import type { AcademicStyle, LanguageVariant, CheckingMode, WritingMode, WritingSettings } from '../types';

interface WritingSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: WritingSettings) => void;
}

export function WritingSettingsPanel({ isOpen, onClose, onSettingsChange }: WritingSettingsPanelProps) {
  const { user } = useAuthStore();
  const { profile, updateProfile } = useProfileStore();
  
  const [settings, setSettings] = useState<WritingSettings>({
    academicStyle: 'none',
    languageVariant: 'us',
    checkingMode: 'standard',
    writingMode: 'academic',
    criticalErrorsOnly: false
  });

  useEffect(() => {
    if (profile?.writingSettings) {
      setSettings(profile.writingSettings);
    }
  }, [profile]);

  const handleSettingChange = <K extends keyof WritingSettings>(
    key: K,
    value: WritingSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    onSettingsChange(newSettings);
    
    // Save to user profile if logged in
    if (user && profile) {
      updateProfile({
        ...profile,
        writingSettings: newSettings
      });
    }
  };

  const academicStyles: { value: AcademicStyle; label: string; description: string }[] = [
    { value: 'none', label: 'General Writing', description: 'Standard grammar and style checking' },
    { value: 'mla', label: 'MLA Style', description: 'Modern Language Association format' },
    { value: 'apa', label: 'APA Style', description: 'American Psychological Association format' },
    { value: 'chicago', label: 'Chicago Style', description: 'Chicago Manual of Style format' },
    { value: 'harvard', label: 'Harvard Style', description: 'Harvard referencing system' }
  ];

  const languageVariants: { value: LanguageVariant; label: string; flag: string }[] = [
    { value: 'us', label: 'US English', flag: '🇺🇸' },
    { value: 'uk', label: 'UK English', flag: '🇬🇧' },
    { value: 'au', label: 'Australian English', flag: '🇦🇺' },
    { value: 'ca', label: 'Canadian English', flag: '🇨🇦' }
  ];

  const checkingModes: { value: CheckingMode; label: string; description: string; icon: string }[] = [
    { value: 'speed', label: 'Speed Mode', description: 'Quick check for critical errors only', icon: '⚡' },
    { value: 'standard', label: 'Standard Mode', description: 'Balanced checking for most writing', icon: '⚖️' },
    { value: 'comprehensive', label: 'Comprehensive Mode', description: 'Thorough analysis with detailed suggestions', icon: '🔍' }
  ];

  const writingModes: { value: WritingMode; label: string; description: string; icon: string }[] = [
    { value: 'academic', label: 'Academic Writing', description: 'Formal academic style and structure', icon: '🎓' },
    { value: 'business', label: 'Business Writing', description: 'Professional business communication', icon: '💼' },
    { value: 'casual', label: 'Casual Writing', description: 'Informal and conversational tone', icon: '💬' },
    { value: 'creative', label: 'Creative Writing', description: 'Artistic and expressive style', icon: '🎨' }
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white rounded-t-lg border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Writing Settings</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Customize your writing assistant for better results
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Academic Style Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              📚 Academic Style
            </h3>
            <p className="text-sm text-gray-600">
              Choose your preferred citation and formatting style
            </p>
            <div className="grid grid-cols-1 gap-3">
              {academicStyles.map((style) => (
                <div
                  key={style.value}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    settings.academicStyle === style.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSettingChange('academicStyle', style.value)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{style.label}</div>
                      <div className="text-sm text-gray-600">{style.description}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      settings.academicStyle === style.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {settings.academicStyle === style.value && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Language Variant Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              🌍 Language Variant
            </h3>
            <p className="text-sm text-gray-600">
              Select your preferred English variant for spelling and style
            </p>
            <div className="grid grid-cols-2 gap-3">
              {languageVariants.map((variant) => (
                <div
                  key={variant.value}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    settings.languageVariant === variant.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSettingChange('languageVariant', variant.value)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{variant.flag}</span>
                    <div>
                      <div className="font-medium text-gray-900">{variant.label}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checking Mode Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              ⚙️ Checking Mode
            </h3>
            <p className="text-sm text-gray-600">
              Choose how thoroughly you want your text analyzed
            </p>
            <div className="grid grid-cols-1 gap-3">
              {checkingModes.map((mode) => (
                <div
                  key={mode.value}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    settings.checkingMode === mode.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSettingChange('checkingMode', mode.value)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl">{mode.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{mode.label}</div>
                        <div className="text-sm text-gray-600">{mode.description}</div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 ${
                      settings.checkingMode === mode.value
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {settings.checkingMode === mode.value && (
                        <div className="w-full h-full rounded-full bg-white scale-50"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Writing Mode Selection */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              ✍️ Writing Mode
            </h3>
            <p className="text-sm text-gray-600">
              Set the appropriate tone and style for your writing
            </p>
            <div className="grid grid-cols-2 gap-3">
              {writingModes.map((mode) => (
                <div
                  key={mode.value}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    settings.writingMode === mode.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSettingChange('writingMode', mode.value)}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{mode.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900">{mode.label}</div>
                      <div className="text-sm text-gray-600">{mode.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Speed Mode Options */}
          {settings.checkingMode === 'speed' && (
            <div className="space-y-3 bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 flex items-center">
                ⚡ Speed Mode Options
              </h4>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="criticalErrorsOnly"
                  checked={settings.criticalErrorsOnly}
                  onChange={(e) => handleSettingChange('criticalErrorsOnly', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="criticalErrorsOnly" className="text-sm text-gray-700">
                  Show only critical errors (grammar and spelling mistakes)
                </label>
              </div>
              <p className="text-xs text-gray-600">
                Perfect for quick proofreading when you're in a hurry
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 rounded-b-lg px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Settings are automatically saved to your profile
            </p>
            <button
              onClick={onClose}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 