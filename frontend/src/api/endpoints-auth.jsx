import {apiUrl, sendRequest} from "./common.jsx";

export function login(username, password) {
    return sendRequest(
        "POST",
        apiUrl("auth/login/"),
        {
            username: username,
            password: password
        }
    )
}

export function register(username, password) {
    return sendRequest(
        "POST",
        apiUrl("auth/register/"),
        {
            username: username,
            password: password
        }
    )
}
