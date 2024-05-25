import {apiUrl, sendRequest} from "./common.jsx";

export function getAllWorkspaces(token) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/"),
        {},
        "Authorization: Bearer " + token
    )
}

export function getWorkspace(token, id) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + id + "/"),
        {},
        "Authorization: Bearer " + token
    )
}

export function newWorkspace(token, name) {
    return sendRequest(
        "POST",
        apiUrl("workspaces/"),
        {"name": name},
        "Authorization: Bearer " + token
    )
}

export function modifyWorkspace(token, id, data) {
    return sendRequest(
        "PATCH",
        apiUrl("workspaces/" + id + "/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function removeWorkspace(token, id) {
    return sendRequest(
        "DELETE",
        apiUrl("workspaces/" + id + "/"),
        {},
        "Authorization: Bearer " + token
    )
}
