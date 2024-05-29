import {apiUrl, sendRequest} from "./common.jsx";

export function getCommentsForTask(token, workspaceId, taskId) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/tasks/" + taskId + "/comments"),
        {},
        "Authorization: Bearer " + token
    )
}

export function newCommentForTask(token, workspaceId, taskId, data) {
    return sendRequest(
        "POST",
        apiUrl("workspaces/" + workspaceId + "/tasks/" + taskId + "/comments/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function modifyCommentForTask(token, workspaceId, taskId, commentId, data) {
    return sendRequest(
        "PATCH",
        apiUrl("workspaces/" + workspaceId + "/tasks/" + taskId + "/comments/" + commentId + "/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function removeCommentForTask(token, workspaceId, taskId, commentId) {
    return sendRequest(
        "DELETE",
        apiUrl("workspaces/" + workspaceId + "/tasks/" + taskId + "/comments/" + commentId + "/"),
        {},
        "Authorization: Bearer " + token
    )
}
