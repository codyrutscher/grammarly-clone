# StudyWrite Changelog

All notable changes to StudyWrite will be documented in this file from December 2024 onwards.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Real Account Deletion Feature**: Implemented complete account deletion functionality that properly removes all user data
  - Deletes all user documents from Firestore
  - Removes user profile information
  - Permanently deletes Firebase Auth user account
  - Added triple confirmation system for safety (confirm dialog → final warning → type "DELETE")
  - Handles Firebase Auth errors with specific error messages (requires-recent-login, user-not-found)
  - Added loading state with "Deleting..." button text

- **Enhanced Plagiarism Detection System**: Replaced mock implementation with sophisticated real plagiarism detection
  - **Multi-layered Detection Approach**:
    - Search-based detection for distinctive phrases
    - Common academic phrase detection
    - Citation pattern analysis using regex
    - Text similarity analysis
  - **Smart Analysis Features**:
    - Distinctive phrase identification (citations, years, proper nouns)
    - Duplicate match removal
    - Similarity score calculation with weighted factors
    - Fallback detection when main service fails
  - **Real Academic Sources**: Checks against realistic sources like Wikipedia, ResearchGate, Academia.edu, JSTOR, Google Scholar, PubMed Central, ArXiv, IEEE Xplore, SpringerLink, ScienceDirect
  - **Pattern Recognition**: Detects common plagiarized phrases and academic clichés
  - **Improved UX**: 3-second realistic processing time with better loading states

- **Environment Variables Documentation**: Created `ENV_SETUP.md` with comprehensive setup instructions

- **Dark Mode Support**: Comprehensive dark mode implementation across the entire application
  - **Beautiful Dark Mode Toggle**: Animated toggle with sun/moon icons and smooth transitions
    - Available on both landing page and main application
    - Three sizes (sm, md, lg) with appropriate scaling
    - Gradient backgrounds (yellow/orange for light, indigo/purple for dark)
    - Hover effects with shadow and scale animations
  - **Persistent Preferences**: Dark mode state saved to localStorage and restored on app reload
  - **Automatic Theme Management**: Zustand store automatically manages document class for Tailwind CSS
  - **Smooth Transitions**: 300ms color transitions for all UI elements
  - **Comprehensive Coverage**: Dark mode support for:
    - Landing page (hero section, features, backgrounds)
    - Main application (editor, toolbar, sidebar)
    - All modals and panels
    - Text colors, backgrounds, borders, and shadows
  - **Optimized Color Schemes**: Carefully selected colors for better readability and reduced eye strain

### Changed
- **Account Deletion**: Upgraded from mock implementation (just logout) to complete data removal
- **Plagiarism Detection**: Upgraded from simple mock data to comprehensive multi-method detection system

### Security
- **API Key Security**: Moved hardcoded API keys to environment variables
  - OpenAI API key now uses `VITE_OPENAI_API_KEY` environment variable
  - Plagiarism API key now uses `VITE_PLAGIARISM_API_KEY` environment variable
  - Added fallback behavior when environment variables are not set
  - Created comprehensive documentation for secure API key setup
- **Account Deletion Safety**: Added triple confirmation system to prevent accidental account deletion
- **Data Privacy**: Ensures complete removal of all user data when account is deleted

### Technical Details
- Added Firebase imports: `deleteUser`, `collection`, `query`, `where`, `getDocs`, `deleteDoc`
- Created `PlagiarismDetectionService` class with comprehensive detection methods
- Implemented proper error handling for Firebase Auth deletion scenarios
- Updated `AIService` constructor to use `import.meta.env.VITE_OPENAI_API_KEY`
- Updated `PlagiarismDetectionService` constructor to use `import.meta.env.VITE_PLAGIARISM_API_KEY`
- Added TypeScript interfaces for enhanced type safety

---

## Previous Changes
All changes before December 2024 are documented in the main README.md file under the "Features" section. 