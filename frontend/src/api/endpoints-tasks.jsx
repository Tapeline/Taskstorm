import {apiUrl, sendRequest} from "./common.jsx";

export function getAllTasksInWorkspace(token, workspaceId, filter) {
    if (filter !== null)
        return sendRequest(
            "GET",
            apiUrl("workspaces/" + workspaceId + "/tasks/?filters=" + filter),
            {},
            "Authorization: Bearer " + token
        )
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/tasks/"),
        {},
        "Authorization: Bearer " + token
    )
}

export function getTaskInWorkspace(token, workspaceId, taskId) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/tasks/" + taskId + "/"),
        {},
        "Authorization: Bearer " + token
    )
}

export function newTaskInWorkspace(token, workspaceId, data) {
    return sendRequest(
        "POST",
        apiUrl("workspaces/" + workspaceId + "/tasks/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function modifyTaskInWorkspace(token, workspaceId, taskId, data) {
    return sendRequest(
        "PATCH",
        apiUrl("workspaces/" + workspaceId + "/tasks/" + taskId + "/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function removeTaskFromWorkspace(token, workspaceId, taskId) {
    return sendRequest(
        "DELETE",
        apiUrl("workspaces/" + workspaceId + "/tasks/" + taskId + "/"),
        {},
        "Authorization: Bearer " + token
    )
}


export function getAllTaskActivity(token, workspaceId, taskId) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/tasks/" + taskId + "/activity/"),
        {},
        "Authorization: Bearer " + token
    )
}
