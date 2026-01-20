// Google Drive API Service
// Handles file operations

const DRIVE_API_BASE = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

// Supported text file MIME types
const TEXT_MIME_TYPES = [
    'text/plain',
    'text/markdown',
    'text/html',
    'text/css',
    'text/javascript',
    'text/xml',
    'text/csv',
    'application/json',
    'application/xml',
    'application/javascript',
    'application/x-yaml',
    'application/x-python',
];

// File extension to language mapping for Monaco
export const extensionToLanguage = {
    'txt': 'plaintext',
    'md': 'markdown',
    'markdown': 'markdown',
    'json': 'json',
    'js': 'javascript',
    'jsx': 'javascript',
    'ts': 'typescript',
    'tsx': 'typescript',
    'py': 'python',
    'html': 'html',
    'htm': 'html',
    'css': 'css',
    'scss': 'scss',
    'less': 'less',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sh': 'shell',
    'bash': 'shell',
    'sql': 'sql',
    'go': 'go',
    'rs': 'rust',
    'java': 'java',
    'c': 'c',
    'cpp': 'cpp',
    'h': 'c',
    'hpp': 'cpp',
    'rb': 'ruby',
    'php': 'php',
    'swift': 'swift',
    'kt': 'kotlin',
    'r': 'r',
    'lua': 'lua',
    'pl': 'perl',
    'ini': 'ini',
    'toml': 'ini',
    'env': 'ini',
    'log': 'plaintext',
    'conf': 'ini',
    'cfg': 'ini',
};

export const getLanguageFromFileName = (fileName) => {
    if (!fileName) return 'plaintext';
    const ext = fileName.split('.').pop()?.toLowerCase() || '';
    return extensionToLanguage[ext] || 'plaintext';
};

// List files from Google Drive
export const listFiles = async (accessToken, folderId = 'root', searchQuery = '') => {
    let query = `'${folderId}' in parents and trashed = false`;

    // Add search filter if provided
    if (searchQuery) {
        query += ` and name contains '${searchQuery}'`;
    }

    // Build file types query - folders and text files
    const mimeQueries = TEXT_MIME_TYPES.map(m => `mimeType = '${m}'`).join(' or ');
    query += ` and (mimeType = 'application/vnd.google-apps.folder' or ${mimeQueries})`;

    const params = new URLSearchParams({
        q: query,
        fields: 'files(id,name,mimeType,modifiedTime,size,iconLink)',
        orderBy: 'folder,name',
        pageSize: '100',
    });

    try {
        const response = await fetch(`${DRIVE_API_BASE}/files?${params}`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        if (!response.ok) {
            throw new Error(`Failed to list files: ${response.status}`);
        }

        const data = await response.json();
        return data.files || [];
    } catch (error) {
        console.error('List files error:', error);
        throw error;
    }
};

// Get file content
export const getFileContent = async (accessToken, fileId) => {
    try {
        const response = await fetch(
            `${DRIVE_API_BASE}/files/${fileId}?alt=media`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get file: ${response.status}`);
        }

        return await response.text();
    } catch (error) {
        console.error('Get file content error:', error);
        throw error;
    }
};

// Get file metadata
export const getFileMetadata = async (accessToken, fileId) => {
    try {
        const params = new URLSearchParams({
            fields: 'id,name,mimeType,modifiedTime,size',
        });

        const response = await fetch(
            `${DRIVE_API_BASE}/files/${fileId}?${params}`,
            {
                headers: { Authorization: `Bearer ${accessToken}` }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to get file metadata: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Get file metadata error:', error);
        throw error;
    }
};

// Update file content
export const updateFileContent = async (accessToken, fileId, content) => {
    try {
        const response = await fetch(
            `${DRIVE_UPLOAD_BASE}/files/${fileId}?uploadType=media`,
            {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'text/plain',
                },
                body: content,
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to update file: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Update file content error:', error);
        throw error;
    }
};

// Create new file
export const createFile = async (accessToken, name, content = '', folderId = 'root') => {
    try {
        // Create file metadata
        const metadata = {
            name,
            mimeType: 'text/plain',
            parents: [folderId],
        };

        const form = new FormData();
        form.append(
            'metadata',
            new Blob([JSON.stringify(metadata)], { type: 'application/json' })
        );
        form.append('file', new Blob([content], { type: 'text/plain' }));

        const response = await fetch(
            `${DRIVE_UPLOAD_BASE}/files?uploadType=multipart`,
            {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: form,
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to create file: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Create file error:', error);
        throw error;
    }
};

// Format file size
export const formatFileSize = (bytes) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = parseInt(bytes);
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

// Format date
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
