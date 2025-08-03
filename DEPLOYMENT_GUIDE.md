# Multi-Domain Deployment Guide

This guide explains how to deploy your KubeVela Quiz application to support both domains:
- `kubevela-quiz-oss-summit.vercel.app` (current Vercel deployment)
- `kubevela.guidewire.co.in` (final production domain)

## Changes Made

### 1. Backend Configuration (serverless.js)
- **Dynamic CORS**: Now accepts both domains in production
- **Smart URL Detection**: Uses helper functions to determine the correct frontend URL
- **Flexible OAuth Callbacks**: Automatically uses the right domain for redirects
- **Environment Variables**: Supports `FRONTEND_URL` and `API_BASE_URL` for manual override

### 2. Frontend Configuration (authService.ts)
- **Smart API Detection**: Automatically detects the correct API endpoint based on domain
- **Multiple Domain Support**: Works with localhost, Vercel, and kubevela.guidewire.co.in

## Deployment Options

### Option 1: Automatic Detection (Recommended)
The code will automatically detect which domain it's running on and configure itself accordingly.

**No additional configuration needed** - just deploy and it will work on both domains.

### Option 2: Manual Override via Environment Variables
Set these environment variables in your deployment:

#### For kubevela.guidewire.co.in:
```bash
FRONTEND_URL=https://kubevela.guidewire.co.in
API_BASE_URL=https://kubevela.guidewire.co.in/api
```

#### For Vercel deployment:
```bash
FRONTEND_URL=https://kubevela-quiz-oss-summit.vercel.app
API_BASE_URL=https://kubevela-quiz-oss-summit.vercel.app/api
```

## OAuth Provider Configuration

### Google OAuth Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to "APIs & Services" > "Credentials"
3. Find your OAuth 2.0 Client ID and click "Edit"
4. Add these to "Authorized JavaScript origins":

```
https://kubevela-quiz-oss-summit.vercel.app
https://kubevela.guidewire.co.in
http://localhost:5173
```

5. Add these to "Authorized redirect URIs":

```
https://kubevela-quiz-oss-summit.vercel.app/api/auth/google/callback
https://kubevela.guidewire.co.in/api/auth/google/callback
http://localhost:5000/auth/google/callback
```

### GitHub OAuth App Configuration

GitHub only allows one callback URL per OAuth app, so you have two options:

#### Option A: Multiple OAuth Apps (Recommended)
Create separate GitHub OAuth apps for each environment:

**App 1 - Vercel Domain:**
- Application name: `KubeVela Quiz - Vercel`
- Homepage URL: `https://kubevela-quiz-oss-summit.vercel.app`
- Authorization callback URL: `https://kubevela-quiz-oss-summit.vercel.app/api/auth/github/callback`

**App 2 - Production Domain:**
- Application name: `KubeVela Quiz - Production`
- Homepage URL: `https://kubevela.guidewire.co.in`
- Authorization callback URL: `https://kubevela.guidewire.co.in/api/auth/github/callback`

**App 3 - Development:**
- Application name: `KubeVela Quiz - Development`
- Homepage URL: `http://localhost:5173`
- Authorization callback URL: `http://localhost:5000/auth/github/callback`

Then use different `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` environment variables for each deployment.

#### Option B: Single App with Manual Updates
Use one GitHub OAuth app and manually update the callback URL when switching domains:
- Current: `https://kubevela-quiz-oss-summit.vercel.app/api/auth/github/callback`
- When moving to production: `https://kubevela.guidewire.co.in/api/auth/github/callback`

## Environment Variables for Different Deployments

### For Vercel Deployment
Set these environment variables in your Vercel dashboard:

```bash
NODE_ENV=production
FRONTEND_URL=https://kubevela-quiz-oss-summit.vercel.app
API_BASE_URL=https://kubevela-quiz-oss-summit.vercel.app/api
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_vercel_github_client_id
GITHUB_CLIENT_SECRET=your_vercel_github_client_secret
SESSION_SECRET=your_secure_session_secret
```

### For kubevela.guidewire.co.in Deployment
Set these environment variables in your production environment:

```bash
NODE_ENV=production
FRONTEND_URL=https://kubevela.guidewire.co.in
API_BASE_URL=https://kubevela.guidewire.co.in/api
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_production_github_client_id
GITHUB_CLIENT_SECRET=your_production_github_client_secret
SESSION_SECRET=your_secure_session_secret
```

### For Local Development
Create a `.env` file in the `backend` directory:

```bash
NODE_ENV=development
PORT=5000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_development_github_client_id
GITHUB_CLIENT_SECRET=your_development_github_client_secret
SESSION_SECRET=your_development_session_secret
```

## Testing

1. **Vercel Domain**: Deploy to Vercel and test OAuth at `kubevela-quiz-oss-summit.vercel.app`
2. **Final Domain**: Deploy to kubevela.guidewire.co.in and test OAuth there

## Environment Variables Priority

The system uses this priority order:
1. `FRONTEND_URL` environment variable (if set)
2. Auto-detection from request headers
3. Default to kubevela.guidewire.co.in

This gives you maximum flexibility while maintaining automatic operation.
