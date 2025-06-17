# Environment Variables Setup

This document explains how to set up environment variables for StudyWrite.

## Required Environment Variables

Create a `.env` file in the root directory of the project with the following variables:

```bash
# StudyWrite Environment Variables
# OpenAI API Key for AI grammar checking and chat features
# Get your key from: https://platform.openai.com/api-keys
VITE_OPENAI_API_KEY=sk-your-openai-api-key

# Copyscape API Credentials for real plagiarism detection
# Get your credentials from: https://www.copyscape.com/api/
VITE_COPYSCAPE_USERNAME=your-copyscape-username
VITE_COPYSCAPE_API_KEY=your-copyscape-api-key

# Firebase Configuration (if using different project)
# VITE_FIREBASE_API_KEY=your-firebase-api-key
# VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# VITE_FIREBASE_PROJECT_ID=your-project-id
```

## Setup Instructions

1. **Create the .env file:**
   ```bash
   touch .env
   ```

2. **Add your OpenAI API Key:**
   - Go to [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key and paste it in your `.env` file

3. **Add your Copyscape API Credentials:**
   - Go to [Copyscape API](https://www.copyscape.com/api/)
   - Sign up for an account or log in
   - Get your username and API key
   - Add both to your `.env` file

4. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Security Notes

- **Never commit your `.env` file to version control**
- The `.env` file should be in your `.gitignore`
- Use different API keys for development and production
- Rotate your API keys regularly

## Fallback Behavior

- If `VITE_OPENAI_API_KEY` is not set, AI features will show an error message
- If Copyscape credentials are not set, the system falls back to sophisticated pattern-based detection
- The plagiarism detection will work even without Copyscape, but real API provides more accurate results

## Current Status

✅ **API Keys moved to environment variables** (as of latest update)
- AIService now uses `import.meta.env.VITE_OPENAI_API_KEY`
- PlagiarismDetectionService uses Copyscape API with real credentials
- Added fallback detection for when APIs are unavailable

## Copyscape Integration Details

- **Real-time plagiarism detection** using Copyscape's web search database
- **XML response parsing** for accurate match extraction
- **Cost-effective usage** with text length limits (1000 characters max per check)
- **Fallback system** that works even when Copyscape is unavailable 