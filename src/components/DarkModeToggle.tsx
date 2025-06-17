import React from 'react'
import { useDarkModeStore } from '../store/useDarkModeStore'

interface DarkModeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const { isDarkMode, toggleDarkMode } = useDarkModeStore()

  const sizeClasses = {
    sm: 'w-12 h-6',
    md: 'w-14 h-7',
    lg: 'w-16 h-8'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const knobSizes = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7'
  }

  const translateClasses = {
    sm: isDarkMode ? 'translate-x-6' : 'translate-x-0.5',
    md: isDarkMode ? 'translate-x-7' : 'translate-x-0.5',
    lg: isDarkMode ? 'translate-x-8' : 'translate-x-0.5'
  }

  return (
    <button
      onClick={toggleDarkMode}
      className={`
        relative inline-flex items-center ${sizeClasses[size]} rounded-full
        transition-all duration-300 ease-in-out
        ${isDarkMode 
          ? 'bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/25' 
          : 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg shadow-orange-500/25'
        }
        hover:shadow-xl hover:scale-105 active:scale-95
        focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
        ${className}
      `}
      title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Background Icons */}
      <div className={`absolute inset-0 flex items-center justify-between px-1`}>
        {/* Sun Icon */}
        <div className={`${iconSizes[size]} transition-opacity duration-300 ${isDarkMode ? 'opacity-30' : 'opacity-100'}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
          </svg>
        </div>
        
        {/* Moon Icon */}
        <div className={`${iconSizes[size]} transition-opacity duration-300 ${isDarkMode ? 'opacity-100' : 'opacity-30'}`}>
          <svg viewBox="0 0 24 24" fill="currentColor" className="text-white">
            <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Toggle Knob */}
      <div
        className={`
          ${knobSizes[size]} bg-white rounded-full shadow-lg
          transform transition-transform duration-300 ease-in-out
          ${translateClasses[size]}
          flex items-center justify-center
        `}
      >
        {/* Active Icon in Knob */}
        <div className={`${iconSizes[size]} transition-all duration-300`}>
          {isDarkMode ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="text-indigo-600">
              <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-4.368 2.667-8.112 6.46-9.694a.75.75 0 01.818.162z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor" className="text-yellow-500">
              <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
            </svg>
          )}
        </div>
      </div>
    </button>
  )
} 