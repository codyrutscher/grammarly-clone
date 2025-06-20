import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useProfileStore } from '../store/useProfileStore';
import type { AcademicStyle, LanguageVariant, CheckingMode, WritingMode, WritingSettings } from '../types';
import { useWritingModeStore } from '../store/useWritingModeStore';
import { useDarkModeStore } from '../store/useDarkModeStore';

interface WritingSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: WritingSettings) => void;
}

type RuleCategory = keyof WritingMode['rules'];
type RuleValue = string | boolean;

const defaultMode: WritingMode = {
  id: 'academic',
  name: 'Academic Writing',
  description: 'Formal academic style and structure',
  rules: {
    tone: {
      formality: 'formal',
      emotion: 'objective'
    },
    style: {
      sentenceLength: 'medium',
      vocabulary: 'advanced',
      allowPassiveVoice: true,
      technicalTerms: true
    },
    structure: {
      paragraphLength: 'medium',
      requireTopicSentences: true,
      requireTransitions: true
    },
    citations: {
      required: true,
      style: 'APA'
    }
  }
};

export const WritingSettingsPanel: React.FC<WritingSettingsPanelProps> = ({ isOpen, onClose, onSettingsChange }) => {
  const { user } = useAuthStore();
  const { profile, updateProfile } = useProfileStore();
  const { modes, currentMode, setCurrentMode, addMode, updateMode, deleteMode } = useWritingModeStore();
  const isDarkMode = useDarkModeStore(state => state.isDarkMode);
  const [showCustomizeModal, setShowCustomizeModal] = useState(false);
  const [editingMode, setEditingMode] = useState<WritingMode | null>(null);
  const [selectedMode, setSelectedMode] = useState<WritingMode>(currentMode || defaultMode);

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

  const handleModeSelect = (mode: WritingMode) => {
    setSelectedMode(mode);
    setCurrentMode(mode);
    handleSettingChange('writingMode', mode.id);
  };

  const handleCustomize = (mode: WritingMode) => {
    setEditingMode(mode);
    setShowCustomizeModal(true);
  };

  const handleSaveCustomization = (category: RuleCategory, rule: string, value: RuleValue) => {
    if (editingMode) {
      const updates: Partial<WritingMode> = {
        rules: {
          ...editingMode.rules,
          [category]: {
            ...editingMode.rules[category],
            [rule]: value
          }
        }
      };
      updateMode(editingMode.id, updates);
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

  const writingModes: WritingMode[] = [
    {
      id: 'academic',
      name: 'Academic Writing',
      description: 'Formal academic style and structure',
      rules: {
        tone: {
          formality: 'formal',
          emotion: 'objective'
        },
        style: {
          sentenceLength: 'medium',
          vocabulary: 'advanced',
          allowPassiveVoice: true,
          technicalTerms: true
        },
        structure: {
          paragraphLength: 'medium',
          requireTopicSentences: true,
          requireTransitions: true
        },
        citations: {
          required: true,
          style: 'APA'
        }
      }
    },
    {
      id: 'business',
      name: 'Business Writing',
      description: 'Professional business communication',
      rules: {
        tone: {
          formality: 'formal',
          emotion: 'persuasive'
        },
        style: {
          sentenceLength: 'short',
          vocabulary: 'moderate',
          allowPassiveVoice: false,
          technicalTerms: true
        },
        structure: {
          paragraphLength: 'short',
          requireTopicSentences: true,
          requireTransitions: true
        },
        citations: {
          required: false,
          style: 'none'
        }
      }
    },
    {
      id: 'creative',
      name: 'Creative Writing',
      description: 'Artistic and expressive style',
      rules: {
        tone: {
          formality: 'casual',
          emotion: 'engaging'
        },
        style: {
          sentenceLength: 'long',
          vocabulary: 'advanced',
          allowPassiveVoice: true,
          technicalTerms: false
        },
        structure: {
          paragraphLength: 'long',
          requireTopicSentences: false,
          requireTransitions: true
        },
        citations: {
          required: false,
          style: 'none'
        }
      }
    }
  ];

  const renderModeCard = (mode: WritingMode) => (
    <div
      key={mode.id}
      className={`p-4 rounded-lg cursor-pointer transition-all ${
        selectedMode.id === mode.id
          ? isDarkMode
            ? 'bg-blue-900 border-blue-700'
            : 'bg-blue-50 border-blue-200'
          : isDarkMode
          ? 'bg-gray-800 border-gray-700 hover:bg-gray-700'
          : 'bg-white border-gray-200 hover:bg-gray-50'
      } border`}
      onClick={() => handleModeSelect(mode)}
    >
      <div className="flex items-center justify-between">
        <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
          {mode.name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCustomize(mode);
          }}
          className={`text-sm px-2 py-1 rounded ${
            isDarkMode
              ? 'text-gray-300 hover:bg-gray-700'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Customize
        </button>
      </div>
      <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        {mode.description}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {Object.entries(mode.rules).map(([category, rules]) => (
          Object.entries(rules as Record<string, string | boolean>).map(([rule, value]) => {
            if (typeof value === 'boolean') return null;
            return (
              <span
                key={`${category}-${rule}`}
                className={`text-xs px-2 py-1 rounded-full ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {rule}: {value}
              </span>
            );
          })
        ))}
      </div>
    </div>
  );

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
              {writingModes.map(renderModeCard)}
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

      {showCustomizeModal && editingMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`w-full max-w-2xl rounded-lg shadow-xl ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          } p-6`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Customize {editingMode.name}
            </h3>
            
            <div className="space-y-6">
              {Object.entries(editingMode.rules).map(([category, rules]) => (
                <div key={category}>
                  <h4 className={`text-sm font-medium mb-2 capitalize ${
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {category}
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(rules as Record<string, string | boolean>).map(([rule, value]) => (
                      <div key={rule}>
                        <label className={`block text-sm mb-1 capitalize ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {rule.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </label>
                        {typeof value === 'boolean' ? (
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => {
                                handleSaveCustomization(
                                  category as RuleCategory,
                                  rule,
                                  e.target.checked
                                );
                              }}
                              className="rounded border-gray-300"
                            />
                            <span className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              Enable
                            </span>
                          </div>
                        ) : (
                          <select
                            value={value}
                            onChange={(e) => {
                              handleSaveCustomization(
                                category as RuleCategory,
                                rule,
                                e.target.value
                              );
                            }}
                            className={`w-full rounded-md border ${
                              isDarkMode
                                ? 'bg-gray-700 border-gray-600 text-white'
                                : 'bg-white border-gray-300 text-gray-900'
                            } px-3 py-1.5 text-sm`}
                          >
                            {typeof value === 'string' && ['short', 'medium', 'long'].includes(value) && (
                              <>
                                <option value="short">Short</option>
                                <option value="medium">Medium</option>
                                <option value="long">Long</option>
                              </>
                            )}
                            {typeof value === 'string' && ['simple', 'moderate', 'advanced'].includes(value) && (
                              <>
                                <option value="simple">Simple</option>
                                <option value="moderate">Moderate</option>
                                <option value="advanced">Advanced</option>
                              </>
                            )}
                            {typeof value === 'string' && ['casual', 'neutral', 'formal'].includes(value) && (
                              <>
                                <option value="casual">Casual</option>
                                <option value="neutral">Neutral</option>
                                <option value="formal">Formal</option>
                              </>
                            )}
                            {typeof value === 'string' && ['objective', 'persuasive', 'engaging'].includes(value) && (
                              <>
                                <option value="objective">Objective</option>
                                <option value="persuasive">Persuasive</option>
                                <option value="engaging">Engaging</option>
                              </>
                            )}
                            {typeof value === 'string' && ['APA', 'MLA', 'Chicago', 'none'].includes(value) && (
                              <>
                                <option value="APA">APA</option>
                                <option value="MLA">MLA</option>
                                <option value="Chicago">Chicago</option>
                                <option value="none">None</option>
                              </>
                            )}
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCustomizeModal(false);
                  setEditingMode(null);
                }}
                className={`px-4 py-2 rounded-md text-sm ${
                  isDarkMode
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCustomizeModal(false)}
                className="px-4 py-2 rounded-md text-sm bg-blue-600 text-white hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 