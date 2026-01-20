import { useState, useEffect } from 'react';
import Header from './components/Header';
import EditorComponent from './components/Editor';
import StatusBar from './components/StatusBar';
import { initGoogleAuth, getAccessToken, getUserInfo } from './services/googleAuth';
import { getFileContent, updateFileContent } from './services/googleDrive';
import { openFilePicker } from './services/googlePicker';
import './index.css';

// Google Cloud credentials from environment variables
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);

  // File state
  const [currentFile, setCurrentFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  // Editor state
  const [isModified, setIsModified] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [cursorPosition, setCursorPosition] = useState({ line: 1, column: 1 });

  // UI state
  const [toast, setToast] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);

  // Initialize Google Auth
  useEffect(() => {
    initGoogleAuth(GOOGLE_CLIENT_ID, async (authenticated, token) => {
      setIsAuthenticated(authenticated);
      setAccessToken(token);

      if (authenticated && token) {
        const userInfo = await getUserInfo();
        setUser(userInfo);
      } else {
        setUser(null);
      }
    });

    // Load recent files from localStorage
    const saved = localStorage.getItem('recentFiles');
    if (saved) {
      setRecentFiles(JSON.parse(saved));
    }
  }, []);

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Handle file picker
  const handleOpenPicker = () => {
    const appId = GOOGLE_CLIENT_ID.split('-')[0];
    openFilePicker(accessToken, GOOGLE_API_KEY, appId, handleFilePicked);
  };

  // Handle file picked from picker
  const handleFilePicked = async (file) => {
    if (isModified) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to open a different file?'
      );
      if (!confirm) return;
    }

    setIsLoadingFile(true);
    setCurrentFile(file);

    try {
      const content = await getFileContent(accessToken, file.id);
      setFileContent(content);
      setOriginalContent(content);
      setIsModified(false);
      setLastSaved(new Date().toISOString());

      // Add to recent files
      const newRecent = [file, ...recentFiles.filter(f => f.id !== file.id)].slice(0, 5);
      setRecentFiles(newRecent);
      localStorage.setItem('recentFiles', JSON.stringify(newRecent));
    } catch (error) {
      showToast('Failed to load file', 'error');
      console.error(error);
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Handle opening a recent file
  const handleOpenRecent = async (file) => {
    await handleFilePicked(file);
  };

  // Handle content change
  const handleContentChange = (newContent) => {
    setFileContent(newContent);
    setIsModified(newContent !== originalContent);
  };

  // Handle save
  const handleSave = async () => {
    if (!currentFile || !isModified) return;

    setIsSaving(true);

    try {
      await updateFileContent(accessToken, currentFile.id, fileContent);
      setOriginalContent(fileContent);
      setIsModified(false);
      setLastSaved(new Date().toISOString());
      showToast('File saved successfully');
    } catch (error) {
      showToast('Failed to save file', 'error');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut for save
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (isModified && currentFile) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModified, currentFile, fileContent, accessToken]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isModified) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isModified]);

  return (
    <div className="app">
      <Header
        isAuthenticated={isAuthenticated}
        user={user}
        currentFile={currentFile}
        isModified={isModified}
        isSaving={isSaving}
        onSave={handleSave}
        onOpenPicker={handleOpenPicker}
      />

      <main className="app-main">
        {isAuthenticated ? (
          <div className="editor-container">
            {currentFile ? (
              <EditorComponent
                content={fileContent}
                fileName={currentFile?.name}
                onChange={handleContentChange}
                isLoading={isLoadingFile}
              />
            ) : (
              <div className="file-picker-screen">
                <div className="picker-content">
                  <svg
                    className="picker-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  >
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  <h2 className="picker-title">Open a file from Google Drive</h2>
                  <p className="picker-text">
                    Select a text file to edit. The app only gets access to files you choose.
                  </p>
                  <button className="btn btn-primary btn-large" onClick={handleOpenPicker}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
                    </svg>
                    Choose from Google Drive
                  </button>

                  {recentFiles.length > 0 && (
                    <div className="recent-files">
                      <h3 className="recent-title">Recent Files</h3>
                      <div className="recent-list">
                        {recentFiles.map((file) => (
                          <button
                            key={file.id}
                            className="recent-item"
                            onClick={() => handleOpenRecent(file)}
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14,2 14,8 20,8" />
                            </svg>
                            {file.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="welcome-screen">
            <svg
              className="welcome-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M12 2L2 19h20L12 2z" />
              <path d="M12 2l8 17H4L12 2z" />
            </svg>
            <h1 className="welcome-title">Drive Text Editor</h1>
            <p className="welcome-text">
              Edit your text files directly from Google Drive with a powerful code editor.
              Sign in to get started.
            </p>
          </div>
        )}
      </main>

      <StatusBar
        fileName={currentFile?.name}
        isModified={isModified}
        lastSaved={lastSaved}
        cursorPosition={cursorPosition}
        isConnected={isAuthenticated}
      />

      {toast && (
        <div className={`toast ${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;
