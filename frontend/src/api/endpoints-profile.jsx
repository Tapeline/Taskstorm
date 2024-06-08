import {apiUrl, sendRequest} from "./common.jsx";

export function getProfile(token) {
    return sendRequest(
        "GET",
        apiUrl("profile/"),
        {},
        "Authorization: Bearer " + token
    )
}

export function modifyProfileSettings(token, newSettings) {
    return sendRequest(
        "PATCH",
        apiUrl("profile/"),
        {"settings": newSettings},
        "Authorization: Bearer " + token
    )
}

export function deleteProfile(token) {
    return sendRequest(
        "DELETE",
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

export function getAllUnreadNotifications(token) {
    return sendRequest(
        "GET",
        apiUrl("profile/notifications/?only_unread=true&limit=-1"),
        {},
        "Authorization: Bearer " + token
    )
}
