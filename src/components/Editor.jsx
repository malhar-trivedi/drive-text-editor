import Editor from '@monaco-editor/react';
import { getLanguageFromFileName } from '../services/googleDrive';

const EditorComponent = ({ content, fileName, onChange, isLoading }) => {
    const language = getLanguageFromFileName(fileName);

    const handleEditorChange = (value) => {
        onChange(value);
    };

    const editorOptions = {
        fontSize: 14,
        fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
        lineNumbers: 'on',
        minimap: { enabled: true },
        scrollBeyondLastLine: false,
        wordWrap: 'on',
        automaticLayout: true,
        tabSize: 2,
        insertSpaces: true,
        renderWhitespace: 'selection',
        cursorBlinking: 'smooth',
        cursorSmoothCaretAnimation: 'on',
        smoothScrolling: true,
        padding: { top: 16, bottom: 16 },
        folding: true,
        bracketPairColorization: { enabled: true },
        guides: {
            bracketPairs: true,
            indentation: true,
        },
    };

    if (isLoading) {
        return (
            <div className="editor-placeholder">
                <div className="loading-spinner" style={{ width: 32, height: 32 }} />
                <p>Loading file...</p>
            </div>
        );
    }

    if (!fileName) {
        return (
            <div className="editor-placeholder">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                </svg>
                <p>Select a file from the sidebar to start editing</p>
            </div>
        );
    }

    return (
        <div className="editor-wrapper">
            <Editor
                height="100%"
                language={language}
                value={content}
                onChange={handleEditorChange}
                theme="vs-dark"
                options={editorOptions}
                loading={
                    <div className="editor-placeholder">
                        <div className="loading-spinner" style={{ width: 32, height: 32 }} />
                        <p>Loading editor...</p>
                    </div>
                }
            />
        </div>
    );
};

export default EditorComponent;
