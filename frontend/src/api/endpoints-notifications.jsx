import {apiUrl, sendRequest} from "./common.jsx";

export function getRulesInWorkspace(token, workspaceId) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/notification-rules/"),
        {},
        "Authorization: Bearer " + token
    )
}

export function newRuleInWorkspace(token, workspaceId, data) {
    return sendRequest(
        "POST",
        apiUrl("workspaces/" + workspaceId + "/notification-rules/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function modifyRuleInWorkspace(token, workspaceId, ruleId, data) {
    return sendRequest(
        "PATCH",
        apiUrl("workspaces/" + workspaceId + "/notification-rules/" + ruleId + "/"),
        data,
        "Authorization: Bearer " + token
    )
}

export function removeRuleFromWorkspace(token, workspaceId, ruleId) {
    return sendRequest(
        "DELETE",
        apiUrl("workspaces/" + workspaceId + "/notification-rules/" + ruleId + "/"),
        {},
        "Authorization: Bearer " + token
    )
}
