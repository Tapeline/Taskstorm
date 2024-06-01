import {apiUrl, sendRequest} from "./common.jsx";

export function getAllDocumentsInWorkspace(token, workspaceId) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/documents"),
        {},
        "Authorization: Bearer " + token
    )
}


export function getDocumentInWorkspace(token, workspaceId, id) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/documents/" + id),
        {},
        "Authorization: Bearer " + token
    )
}

export function newDocumentInWorkspace(token, workspaceId, name) {
    return sendRequest(
        "POST",
        apiUrl("workspaces/" + workspaceId + "/documents/"),
        {"title": name},
        "Authorization: Bearer " + token
    )
}

export function modifyDocumentInWorkspace(token, workspaceId, id, data) {
    return sendRequest(
        "PATCH",
        apiUrl("workspaces/" + workspaceId + "/documents/" + id + "/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function removeDocumentInWorkspace(token, workspaceId, id) {
    return sendRequest(
        "DELETE",
        apiUrl("workspaces/" + workspaceId + "/documents/" + id + "/"),
        {},
        "Authorization: Bearer " + token
    )
}
