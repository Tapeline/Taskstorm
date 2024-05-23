import {apiUrl, sendRequest} from "./common.jsx";

export function getProfile(token) {
    return sendRequest(
        "GET",
        apiUrl("profile/"),
        {},
        "Authorization: Bearer " + token
    )
}


export function getAllUsers(token) {
    return sendRequest(
        "GET",
        apiUrl("profile/all/"),
        {},
        "Authorization: Bearer " + token
    )
}
