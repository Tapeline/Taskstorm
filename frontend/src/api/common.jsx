export function getBaseUrl() {
    return "http://localhost:8080/api/";
}

export function apiUrl(url) {
    return getBaseUrl() + url;
}


import axios from 'axios';


export async function sendRequest(method, url, data = null, headers = {}) {
    try {
        const response = await axios({
            method: method,
            url: url,
            data: data,
            headers: headers
        })
        return {success: true, data: response.data};
    } catch (error) {
        return {success: false, status: error.response.status, reason: error.response.data.error_message, data: error};
    }
}
