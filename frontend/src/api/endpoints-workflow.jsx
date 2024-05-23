import {apiUrl, sendRequest} from "./common.jsx";

export function getStagesInWorkspace(token, workspaceId) {
    return sendRequest(
        "GET",
        apiUrl("workspaces/" + workspaceId + "/stages/"),
        {},
        "Authorization: Bearer " + token
    )
}
