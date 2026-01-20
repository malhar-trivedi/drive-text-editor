import { signIn, signOut } from '../services/googleAuth';

// Icon components
const DriveIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 19h20L12 2z" />
        <path d="M12 2l8 17H4L12 2z" />
    </svg>
);

const SaveIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
        <polyline points="17,21 17,13 7,13 7,21" />
        <polyline points="7,3 7,8 15,8" />
    </svg>
);

const FolderIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
);

const Header = ({
    isAuthenticated,
    user,
    currentFile,
    isModified,
    isSaving,
    onSave,
    onOpenPicker,
}) => {
    const handleSignIn = () => signIn();
    const handleSignOut = () => signOut();

    return (
        <header className="header">
            <div className="header-left">
                <div className="header-logo">
                    <DriveIcon />
                    <span>Drive Editor</span>
                </div>

                {isAuthenticated && (
                    <button className="btn btn-secondary" onClick={onOpenPicker}>
                        <FolderIcon />
                        Open File
                    </button>
                )}

                {currentFile && (
                    <div className={`header-file-info ${isModified ? 'modified' : ''}`}>
                        <span>{currentFile.name}</span>
                    </div>
                )}
            </div>

            <div className="header-right">
                {isAuthenticated && currentFile && (
                    <button
                        className="btn btn-primary"
                        onClick={onSave}
                        disabled={!isModified || isSaving}
                    >
                        {isSaving ? (
                            <>
                                <span className="loading-spinner" style={{ width: 16, height: 16 }} />
                                Saving...
                            </>
                        ) : (
                            <>
                                <SaveIcon />
                                Save
                            </>
                        )}
                    </button>
                )}

                {isAuthenticated ? (
                    <div className="user-profile">
                        {user?.picture && (
                            <img
                                src={user.picture}
                                alt={user.name}
                                className="user-avatar"
                            />
                        )}
                        <span className="user-name">{user?.name}</span>
                        <button className="btn btn-ghost" onClick={handleSignOut}>
                            Sign Out
                        </button>
                    </div>
                ) : (
                    <button className="btn btn-primary" onClick={handleSignIn}>
                        Sign in with Google
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
