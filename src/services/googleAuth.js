// Google Authentication Service
// Uses Google Identity Services for OAuth 2.0

const SCOPES = 'https://www.googleapis.com/auth/drive.file';

let tokenClient = null;
let accessToken = null;
let onAuthChangeCallback = null;

export const initGoogleAuth = (clientId, onAuthChange) => {
  onAuthChangeCallback = onAuthChange;

  return new Promise((resolve) => {
    // Load Google Identity Services
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPES,
        callback: (response) => {
          if (response.access_token) {
            accessToken = response.access_token;
            localStorage.setItem('drive_access_token', accessToken);
            onAuthChangeCallback?.(true, accessToken);
          }
        },
        error_callback: (error) => {
          console.error('Auth error:', error);
          onAuthChangeCallback?.(false, null);
        }
      });

      // Check for existing token
      const savedToken = localStorage.getItem('drive_access_token');
      if (savedToken) {
        accessToken = savedToken;
        // Validate token
        validateToken(savedToken).then((isValid) => {
          if (isValid) {
            onAuthChangeCallback?.(true, savedToken);
          } else {
            localStorage.removeItem('drive_access_token');
            accessToken = null;
          }
          resolve();
        });
      } else {
        resolve();
      }
    };
    document.head.appendChild(script);
  });
};

const validateToken = async (token) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${token}`
    );
    return response.ok;
  } catch {
    return false;
  }
};

export const signIn = () => {
  if (tokenClient) {
    tokenClient.requestAccessToken({ prompt: 'consent' });
  }
};

export const signOut = () => {
  if (accessToken) {
    window.google.accounts.oauth2.revoke(accessToken, () => {
      accessToken = null;
      localStorage.removeItem('drive_access_token');
      onAuthChangeCallback?.(false, null);
    });
  }
};

export const getAccessToken = () => accessToken;

export const getUserInfo = async () => {
  if (!accessToken) return null;

  try {
    const response = await fetch(
      'https://www.googleapis.com/oauth2/v2/userinfo',
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to get user info:', error);
  }
  return null;
};
