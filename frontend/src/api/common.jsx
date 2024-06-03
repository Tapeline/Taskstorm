export function getBaseUrl() {
    //const envUrl = import.meta.env.API_BASE_URL;
    console.log(import.meta.env.API_BASE_URL, import.meta.env.API_WS_URL);
    console.log(import.meta.env);
    console.log(JSON.stringify(import.meta.env));
    //if (envUrl === null || envUrl === undefined)
    if (import.meta.env.DEV)
        return "http://localhost:8080/api/";
    return "https://taskstorm.tapeline.dev/api/";
}

export function getBaseWebSocketUrl() {
    //const envUrl = import.meta.env.API_WS_URL;
    //if (envUrl === null || envUrl === undefined)
    if (import.meta.env.DEV)
        return "wss://taskstorm.tapeline.dev/ws/";
    return envUrl;
}

export function apiUrl(url) {
    return getBaseUrl() + url;
}

export function wsUrl(url) {
    return getBaseWebSocketUrl() + url;
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
