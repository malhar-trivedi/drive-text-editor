import { useState, useEffect } from 'react';
import { listFiles, formatFileSize, formatDate } from '../services/googleDrive';

// Icons
const FolderIcon = () => (
    <svg className="file-icon folder" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
    </svg>
);

const FileIcon = () => (
    <svg className="file-icon text" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
    </svg>
);

const BackIcon = () => (
    <svg className="file-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <polyline points="15,18 9,12 15,6" />
    </svg>
);

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const RefreshIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
        <polyline points="23,4 23,10 17,10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
    </svg>
);

const FileBrowser = ({ accessToken, onFileSelect, currentFileId }) => {
    const [files, setFiles] = useState([]);
    const [folderStack, setFolderStack] = useState([{ id: 'root', name: 'My Drive' }]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const currentFolder = folderStack[folderStack.length - 1];

    const loadFiles = async () => {
        if (!accessToken) return;

        setIsLoading(true);
        setError(null);

        try {
            const fileList = await listFiles(accessToken, currentFolder.id, searchQuery);
            setFiles(fileList);
        } catch (err) {
            setError('Failed to load files');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
    }, [accessToken, currentFolder.id]);

    useEffect(() => {
        const debounce = setTimeout(() => {
            if (searchQuery !== '') {
                loadFiles();
            }
        }, 300);
        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleFolderClick = (folder) => {
        setSearchQuery('');
        setFolderStack([...folderStack, { id: folder.id, name: folder.name }]);
    };

    const handleBackClick = () => {
        if (folderStack.length > 1) {
            setSearchQuery('');
            setFolderStack(folderStack.slice(0, -1));
        }
    };

    const handleFileClick = (file) => {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
            handleFolderClick(file);
        } else {
            onFileSelect(file);
        }
    };

    const isFolder = (file) => file.mimeType === 'application/vnd.google-apps.folder';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <span className="sidebar-title">
                    {currentFolder.name}
                </span>
                <button
                    className="btn btn-ghost btn-icon"
                    onClick={loadFiles}
                    title="Refresh"
                    style={{ width: 28, height: 28, padding: 4 }}
                >
                    <RefreshIcon />
                </button>
            </div>

            <div className="search-box">
                <input
                    type="text"
                    className="search-input"
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="file-list">
                {isLoading ? (
                    <div className="empty-state">
                        <div className="loading-spinner" />
                        <p>Loading files...</p>
                    </div>
                ) : error ? (
                    <div className="empty-state">
                        <p style={{ color: 'var(--accent-error)' }}>{error}</p>
                        <button className="btn btn-secondary" onClick={loadFiles}>
                            Retry
                        </button>
                    </div>
                ) : (
                    <>
                        {folderStack.length > 1 && (
                            <div
                                className="file-item folder-back"
                                onClick={handleBackClick}
                            >
                                <BackIcon />
                                <span className="file-name">Back</span>
                            </div>
                        )}

                        {files.length === 0 ? (
                            <div className="empty-state">
                                <FileIcon />
                                <p>No text files found</p>
                            </div>
                        ) : (
                            files.map((file) => (
                                <div
                                    key={file.id}
                                    className={`file-item ${isFolder(file) ? 'folder' : ''} ${file.id === currentFileId ? 'active' : ''
                                        }`}
                                    onClick={() => handleFileClick(file)}
                                    title={`${file.name}\n${formatDate(file.modifiedTime)}`}
                                >
                                    {isFolder(file) ? <FolderIcon /> : <FileIcon />}
                                    <span className="file-name">{file.name}</span>
                                </div>
                            ))
                        )}
                    </>
                )}
            </div>
        </aside>
    );
};

export default FileBrowser;
