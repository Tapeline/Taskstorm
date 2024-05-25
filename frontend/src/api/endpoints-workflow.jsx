import {apiUrl, sendRequest} from "./common.jsx";

export function getStagesInWorkspace(token, workspaceId) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/stages/"),
        {},
        "Authorization: Bearer " + token
    )
}

export function newStageInWorkspace(token, workspaceId, data) {
    return sendRequest(
        "POST",
        apiUrl("workspaces/" + workspaceId + "/stages/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function modifyStageInWorkspace(token, workspaceId, stageId, data) {
    return sendRequest(
        "PATCH",
        apiUrl("workspaces/" + workspaceId + "/stages/" + stageId + "/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function removeStageFromWorkspace(token, workspaceId, stageId) {
    return sendRequest(
        "DELETE",
        apiUrl("workspaces/" + workspaceId + "/stages/" + stageId + "/"),
        {},
        "Authorization: Bearer " + token
    )
}
