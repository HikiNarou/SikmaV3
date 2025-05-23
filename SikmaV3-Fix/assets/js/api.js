// SikmaV3 - assets/js/api.js (Diperbarui)

const API_BASE_URL = window.sikmaApp?.baseUrl ? `${window.sikmaApp.baseUrl}/auth.php` : 'auth.php';

/**
 * Generic fetch wrapper for API calls
 * @param {string} action - The action to perform (e.g., 'login', 'register')
 * @param {object} options - Fetch options (method, body, headers, signal)
 * @returns {Promise<object>} - Promise resolving to JSON response
 */
async function fetchAPI(action, options = {}) {
    const defaultOptions = {
        method: 'POST',
        headers: {
            // 'Accept': 'application/json', // Backend selalu mengembalikan JSON
            // 'X-Requested-With': 'XMLHttpRequest' // Indikasi request AJAX
        },
        // signal: options.signal // Untuk AbortController jika diperlukan
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Tambahkan CSRF token ke FormData jika ada (perlu di-generate di backend dan disimpan di JS)
    // if (window.sikmaApp && window.sikmaApp.csrfToken && mergedOptions.body instanceof FormData) {
    //     mergedOptions.body.append('csrf_token', window.sikmaApp.csrfToken);
    // } else if (window.sikmaApp && window.sikmaApp.csrfToken && typeof mergedOptions.body === 'string') {
    //     const params = new URLSearchParams(mergedOptions.body);
    //     params.append('csrf_token', window.sikmaApp.csrfToken);
    //     mergedOptions.body = params.toString();
    // }

    // Automatically set Content-Type for FormData or URLSearchParams
    if (mergedOptions.body instanceof FormData) {
        // FormData sets its own Content-Type with boundary
        delete mergedOptions.headers['Content-Type'];
    } else if (typeof mergedOptions.body === 'object' && !(mergedOptions.body instanceof FormData)) {
        // Jika body adalah objek plain dan bukan FormData, diasumsikan x-www-form-urlencoded
        // Backend saat ini tidak secara eksplisit menangani application/json
        const params = new URLSearchParams();
        for (const key in mergedOptions.body) {
            if (mergedOptions.body.hasOwnProperty(key)) {
                params.append(key, mergedOptions.body[key]);
            }
        }
        mergedOptions.body = params.toString();
        mergedOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (!mergedOptions.body && mergedOptions.method.toUpperCase() === 'POST') {
        // For POST requests with no explicit body (like logout, check_session),
        // ensure Content-Type is set for URLSearchParams.
        mergedOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    // Note: if mergedOptions.body is already a string (e.g. URLSearchParams) and Content-Type is not set,
    // it will default to 'text/plain' or similar by fetch.
    // Explicitly setting for 'x-www-form-urlencoded' if it's the intended format for string bodies:
    else if (typeof mergedOptions.body === 'string' && mergedOptions.headers['Content-Type'] === undefined) {
        mergedOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }


    // Append action to FormData or URL string
    let requestUrl = API_BASE_URL;
    if (mergedOptions.method.toUpperCase() === 'GET') {
        const params = new URLSearchParams(mergedOptions.body || {}); // Use body for GET parameters if any
        params.append('action', action);
        requestUrl = `${API_BASE_URL}?${params.toString()}`;
        delete mergedOptions.body; // No body for GET
    } else if (mergedOptions.body instanceof FormData) {
        mergedOptions.body.append('action', action);
    } else if (typeof mergedOptions.body === 'string') { // Handles URLSearchParams string
        const params = new URLSearchParams(mergedOptions.body);
        params.append('action', action);
        mergedOptions.body = params.toString();
    } else if (!mergedOptions.body && mergedOptions.method.toUpperCase() === 'POST') {
        // Handle POST requests with no initial body (e.g. logout, check_session)
        const params = new URLSearchParams();
        params.append('action', action);
        mergedOptions.body = params.toString();
    }
    // Jika body adalah objek JSON (tidak digunakan saat ini oleh backend)
    // else if (typeof mergedOptions.body === 'object' && mergedOptions.headers['Content-Type'] === 'application/json') {
    //     mergedOptions.body.action = action; // Assuming action is part of the JSON payload
    //     mergedOptions.body = JSON.stringify(mergedOptions.body);
    // }

    try {
        const response = await fetch(requestUrl, mergedOptions);
        
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            if (!response.ok) {
                console.error(`HTTP error! Status: ${response.status}. Respons bukan JSON valid.`, await response.text().catch(() => ""));
                return { status: 'error', message: `Kesalahan server (Status: ${response.status}). Respons tidak valid.` };
            }
            console.error('Respons JSON tidak valid meskipun status OK:', jsonError);
            return { status: 'error', message: 'Respons server tidak valid (format JSON salah).' };
        }

        if (!response.ok) {
            console.error(`HTTP error! Status: ${response.status}`, data);
            const message = data?.message || `Kesalahan server (Status: ${response.status}). Silakan coba lagi.`;
            return { status: 'error', message: message, errors: data?.errors, action: data?.action };
        }
        
        return data;
    } catch (error) {
        console.error('Fetch API Error:', error.name, error.message);
        let errorMessage = 'Terjadi masalah jaringan. Periksa koneksi Anda dan coba lagi.';
        if (error.name === 'AbortError') {
            errorMessage = 'Permintaan dibatalkan.';
        }
        return { status: 'error', message: errorMessage };
    }
}

const Api = {
    register: (formData) => fetchAPI('register', { body: formData }),
    login: (formData) => fetchAPI('login', { body: formData }),
    logout: () => fetchAPI('logout', { method: 'POST' }), // Simplified
    checkSession: () => fetchAPI('check_session', { method: 'POST' }), // Simplified
    
    updateUserProfile: (formData) => fetchAPI('update_profile', { body: formData }),
    changePassword: (formData) => fetchAPI('change_password', { body: formData }),
    forgotPassword: (email) => fetchAPI('forgot_password', { body: { email: email } }),
    // resetPassword: (formData) => fetchAPI('reset_password', { body: formData }),

    saveFullProfileData: (profileDataPayload) => {
        const formData = new FormData();
        for (const key in profileDataPayload) {
            if (profileDataPayload.hasOwnProperty(key) && profileDataPayload[key] !== undefined) {
                if (key === 'avatar' && profileDataPayload[key] instanceof File) {
                    formData.append(key, profileDataPayload[key], profileDataPayload[key].name);
                } else {
                    formData.append(key, profileDataPayload[key]);
                }
            }
        }
        return fetchAPI('save_full_profile', { body: formData });
    },

    getProfileData: () => fetchAPI('get_profile_data', { method: 'GET' }),

    getCompanyList: (filters = {}) => {
        return fetchAPI('get_company_list', { 
            method: 'GET',
            body: filters
        });
    },
    getCompanyDetails: (companyId) => {
        return fetchAPI('get_company_details', {
            method: 'GET',
            body: { company_id: companyId }
        });
    },

    deactivateAccount: (password) => fetchAPI('deactivate_account', { body: { current_password: password } })
};

// export default Api; // Jika menggunakan ES6 modules
