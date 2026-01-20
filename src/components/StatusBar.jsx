import { getLanguageFromFileName, formatDate } from '../services/googleDrive';

const StatusBar = ({
    fileName,
    isModified,
    lastSaved,
    cursorPosition,
    isConnected
}) => {
    const language = getLanguageFromFileName(fileName);

    return (
        <footer className="status-bar">
            <div className="status-left">
                {isConnected ? (
                    <span className="status-item success">
                        <span style={{ fontSize: '0.5rem' }}>●</span>
                        Connected
                    </span>
                ) : (
                    <span className="status-item error">
                        <span style={{ fontSize: '0.5rem' }}>●</span>
                        Disconnected
                    </span>
                )}

                {isModified && (
                    <span className="status-item warning">
                        Unsaved changes
                    </span>
                )}

                {lastSaved && !isModified && (
                    <span className="status-item">
                        Saved {formatDate(lastSaved)}
                    </span>
                )}
            </div>

            <div className="status-right">
                {cursorPosition && (
                    <span className="status-item">
                        Ln {cursorPosition.line}, Col {cursorPosition.column}
                    </span>
                )}

                {fileName && (
                    <span className="status-item" style={{ textTransform: 'capitalize' }}>
                        {language}
                    </span>
                )}
            </div>
        </footer>
    );
};

export default StatusBar;
