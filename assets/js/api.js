// SikmaV2 - assets/js/api.js

const API_ENDPOINT = 'auth.php'; // Centralized API endpoint

/**
 * Generic fetch wrapper for API calls
 * @param {string} action - The action to perform (e.g., 'login', 'register')
 * @param {object} options - Fetch options (method, body, headers)
 * @returns {Promise<object>} - Promise resolving to JSON response
 */
async function fetchAPI(action, options = {}) {
    const defaultOptions = {
        method: 'POST', // Default to POST
        headers: {
            // 'Content-Type' will be set based on body type
        },
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Automatically set Content-Type for FormData or URLSearchParams
    if (mergedOptions.body instanceof FormData) {
        // FormData sets its own Content-Type with boundary
        delete mergedOptions.headers['Content-Type'];
    } else if (typeof mergedOptions.body === 'string' && mergedOptions.headers['Content-Type'] === undefined) {
        // Assume x-www-form-urlencoded if body is string and no specific Content-Type
        mergedOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }


    // Append action to FormData or URL string
    let requestUrl = API_ENDPOINT;
    if (mergedOptions.method === 'GET') {
        const params = new URLSearchParams(mergedOptions.body || {}); // Use body for GET params if provided
        params.append('action', action);
        requestUrl = `${API_ENDPOINT}?${params.toString()}`;
        delete mergedOptions.body; // No body for GET
    } else if (mergedOptions.body instanceof FormData) {
        mergedOptions.body.append('action', action);
    } else if (typeof mergedOptions.body === 'string') { // URLSearchParams
        const params = new URLSearchParams(mergedOptions.body);
        params.append('action', action);
        mergedOptions.body = params.toString();
    } else if (typeof mergedOptions.body === 'object' && !(mergedOptions.body instanceof FormData)) {
        // For JSON body, though current PHP backend expects FormData or x-www-form-urlencoded
        // This part would need PHP to handle json_decode(file_get_contents('php://input'), true)
        // mergedOptions.headers['Content-Type'] = 'application/json';
        // mergedOptions.body.action = action; // Add action to JSON body
        // mergedOptions.body = JSON.stringify(mergedOptions.body);
        // For now, we'll stick to FormData or URLSearchParams as per current backend
        const params = new URLSearchParams();
        for (const key in mergedOptions.body) {
            params.append(key, mergedOptions.body[key]);
        }
        params.append('action', action);
        mergedOptions.body = params.toString();
        if (mergedOptions.headers['Content-Type'] === undefined) {
             mergedOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        }
    }


    try {
        const response = await fetch(requestUrl, mergedOptions);
        if (!response.ok) {
            // Handle HTTP errors (e.g., 500, 404)
            console.error(`HTTP error! Status: ${response.status}`, await response.text());
            return { status: 'error', message: `Server error: ${response.status}. Please try again.` };
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch API Error:', error);
        // Network error or JSON parsing error
        return { status: 'error', message: 'Network error or invalid server response. Please check your connection and try again.' };
    }
}

const Api = {
    register: (formData) => fetchAPI('register', { body: formData }),
    login: (formData) => fetchAPI('login', { body: formData }),
    logout: () => fetchAPI('logout', { body: 'action=logout' }), // body can be simple string for x-www-form-urlencoded
    checkSession: () => fetchAPI('check_session', { method: 'POST', body: 'action=check_session' }), // Use POST to be consistent, or GET
    
    updateUserProfile: (formData) => fetchAPI('update_profile', { body: formData }), // For settings page basic profile
    changePassword: (formData) => fetchAPI('change_password', { body: formData }),
    
    saveFullProfileData: (profileDataPayload) => {
        // profileDataPayload should be an object with keys like:
        // firstName, lastName, bio, avatar (file), programming_skills (JSON string), frameworks (JSON string), etc.
        const formData = new FormData();
        for (const key in profileDataPayload) {
            if (profileDataPayload[key] !== undefined) {
                 if (key === 'avatar' && profileDataPayload[key] instanceof File) {
                    formData.append(key, profileDataPayload[key], profileDataPayload[key].name);
                } else {
                    formData.append(key, profileDataPayload[key]);
                }
            }
        }
        return fetchAPI('save_full_profile', { body: formData });
    },

    getProfileData: () => fetchAPI('get_profile_data', { method: 'GET' }), // GET request, action in URL by fetchAPI

    getCompanyDetails: (companyId) => {
        return fetchAPI('get_company_details', {
            method: 'GET',
            body: { company_id: companyId } // fetchAPI will turn this into query string for GET
        });
    },
    
    // Example for fetching company list (if you implement it on backend)
    // getCompanyList: (filters = {}) => {
    //     const params = new URLSearchParams(filters);
    //     return fetchAPI('get_company_list', { method: 'GET', body: params });
    // }
};

// Export if using modules, otherwise it's available globally on window.Api
// export default Api; // If using ES6 modules