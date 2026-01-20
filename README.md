# Drive Text Editor

A web application to edit text files from Google Drive with a powerful code editor - without giving full Drive access to third-party apps.

![Drive Text Editor](https://img.shields.io/badge/React-18-blue) ![Monaco Editor](https://img.shields.io/badge/Monaco-Editor-green)

## Features

- 🔒 **Minimal Permissions** - Only accesses files you explicitly open (`drive.file` scope)
- ✨ **Monaco Editor** - Same editor as VS Code with syntax highlighting
- 📁 **File Browser** - Navigate your Google Drive folders
- 🔍 **Search** - Find files quickly
- ⌨️ **Keyboard Shortcuts** - `Cmd/Ctrl+S` to save
- 🌙 **Dark Theme** - Easy on the eyes

## Supported File Types

txt, md, json, js, ts, py, html, css, xml, yaml, sh, sql, go, rust, java, and more

## Quick Start

### 1. Install Dependencies

```bash
cd drive-text-editor
npm install
```

### 2. Set Up Environment Variables

Copy the example env file:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```
VITE_GOOGLE_CLIENT_ID=your_client_id_here
VITE_GOOGLE_API_KEY=your_api_key_here
```

### 3. Set Up Google Cloud OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable the **Google Drive API**:
   - Go to APIs & Services > Library
   - Search for "Google Drive API" and enable it
4. Create OAuth Credentials:
   - Go to APIs & Services > Credentials
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized JavaScript origin: `http://localhost:5173`
   - Copy the **Client ID**

5. Update the app with your Client ID:
   
   Open `src/App.jsx` and replace:
   ```javascript
   const GOOGLE_CLIENT_ID = 'YOUR_CLIENT_ID.apps.googleusercontent.com';
   ```
   with your actual Client ID.

### 3. Run the App

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Usage

1. Click **Sign in with Google**
2. Grant permission (only for files you open in this app)
3. Browse or search for a text file
4. Edit the file using the Monaco editor
5. Click **Save** or press `Cmd/Ctrl+S`

## Tech Stack

- **React** + **Vite** - Fast development
- **Monaco Editor** - Industry-standard code editing
- **Google Identity Services** - Secure OAuth 2.0
- **Google Drive API v3** - File operations

## Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## License

MIT
