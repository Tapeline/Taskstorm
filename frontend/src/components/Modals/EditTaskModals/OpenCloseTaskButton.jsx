import React from "react";
import {Button} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {modifyTaskInWorkspace} from "../../../api/endpoints-tasks.jsx";

export default function OpenCloseTaskButton(props) {
    const {workspaceId, task} = props;
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        modifyTaskInWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            task.id,
            {"is_open": !task.is_open}
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                window.location.href = "/workspaces/" + workspaceId + "/tasks/" + task.id;
            }
        });
    };

    return (
        <Button variant="outline-secondary" onClick={handleSubmit}>{task.is_open? "Close task" : "Reopen task"}</Button>
    );
}
