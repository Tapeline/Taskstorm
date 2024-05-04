import {apiUrl, sendRequest} from "./common.jsx";

export function getProfile(token) {
    return sendRequest(
        "GET",
        apiUrl("profile/"),
        {},
        "Authorization: Bearer " + token
    )
}
