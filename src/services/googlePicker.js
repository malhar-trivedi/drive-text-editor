// Google Picker Service
// Opens Google Drive file picker for user to select files

const PICKER_API_URL = 'https://apis.google.com/js/api.js';

let pickerApiLoaded = false;
let pickerApiLoadPromise = null;

// Load the Google Picker API
const loadPickerApi = () => {
    if (pickerApiLoaded) {
        return Promise.resolve();
    }

    if (pickerApiLoadPromise) {
        return pickerApiLoadPromise;
    }

    pickerApiLoadPromise = new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = PICKER_API_URL;
        script.async = true;
        script.defer = true;
        script.onload = () => {
            window.gapi.load('picker', () => {
                pickerApiLoaded = true;
                resolve();
            });
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return pickerApiLoadPromise;
};

// Supported MIME types for text files
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
];

// Open the Google Picker to select a file
// Open the Google Picker to select a file
export const openFilePicker = async (accessToken, apiKey, appId, onFilePicked) => {
    await loadPickerApi();

    const view = new window.google.picker.DocsView()
        .setIncludeFolders(true)
        .setSelectFolderEnabled(false)
        .setMimeTypes(TEXT_MIME_TYPES.join(','))
        .setMode(window.google.picker.DocsViewMode.LIST);

    const picker = new window.google.picker.PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .setAppId(appId)
        .setCallback((data) => {
            if (data.action === window.google.picker.Action.PICKED) {
                const file = data.docs[0];
                onFilePicked({
                    id: file.id,
                    name: file.name,
                    mimeType: file.mimeType,
                });
            }
        })
        .setTitle('Select a text file to edit')
        .build();

    picker.setVisible(true);
};

export default { openFilePicker };
