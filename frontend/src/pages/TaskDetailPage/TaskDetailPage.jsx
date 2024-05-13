import React, {useEffect, useState} from "react";
import {Badge, Button, Form, Tab, Tabs} from "react-bootstrap";
import {login} from "../../api/endpoints-auth.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {getProfile} from "../../api/endpoints-profile.jsx";
import {getWorkspace} from "../../api/endpoints-workspaces.jsx";
import {getAllTasksInWorkspace, getTaskInWorkspace} from "../../api/endpoints-tasks.jsx";
import WorkspaceCard from "../../components/WorkspaceCard/WorkspaceCard.jsx";
import TaskCard from "../../components/TaskCard/TaskCard.jsx";
import CreateTaskModal from "../../components/Modals/CreateTaskModal/CreateTaskModal.jsx";
import EditTaskNameModal from "../../components/Modals/EditTaskModals/EditTaskNameModal.jsx";
import EditTaskFolderModal from "../../components/Modals/EditTaskModals/EditTaskFolderModal.jsx";
import EditTaskAssigneeModal from "../../components/Modals/EditTaskModals/EditTaskAssigneeModal.jsx";

export default function TaskDetailPage() {
    const {workspaceId, taskId} = useParams();
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [isTaskNotFound, setIsTaskNotFound] = useState(false);
    const [taskData, setTaskData] = useState({});

    if (accessToken === null) {
        navigate("login/");
        return;
    }

    useEffect(() => {
        getTaskInWorkspace(accessToken, workspaceId, taskId).then(response => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success && response.success == 404) {
                setIsTaskNotFound(true);
            } else {
                setTaskData(response.data);
            }
        });
    }, []);

    if (isTaskNotFound)
        return <h1>Task not found</h1>;

    return (
        <div className="px-lg-5">
            <Link to={"/workspaces/" + workspaceId}>Back to workspace</Link>
            <hr/>
            <div className="d-flex justify-content-between">
                <h2>{taskData.name} <EditTaskNameModal task={taskData} workspaceId={workspaceId}/></h2>
                <div>
                    <Button variant="outline-secondary">Close task</Button>
                </div>
            </div>
            <h6><i className="bi bi-folder"></i> {taskData.folder}&nbsp;
                <EditTaskFolderModal task={taskData} workspaceId={workspaceId}/></h6>
            <div className="d-flex justify-content-between">
                <div>
                    {
                        taskData.is_open
                            ? <Badge pill bg="warning" text="dark">Open</Badge>
                            : <Badge pill bg="secondary" text="dark">Closed</Badge>
                    }
                    <span className="small"> by {taskData.creator?.username}</span>
                </div>
                <div>
                    {
                        taskData.assignee !== null
                            ? <span className="small"> Assigned to {taskData.assignee?.username}</span>
                            : <span className="small"> Unassigned</span>
                    }
                    &nbsp;
                    <EditTaskAssigneeModal task={taskData} workspaceId={workspaceId}/>
                </div>
            </div>
            <div className="d-flex mb-3">
                {
                    taskData.stage !== null
                        ? <span className="small"> Staged: {taskData.stage?.name}</span>
                        : <span className="small"> Unstaged</span>
                }
            </div>
            <div className="d-flex">
                <span className="small">Time bounds:&nbsp;
                     {taskData.time_bounds_start} - {taskData.time_bounds_end}</span>
            </div>
            <div className="d-flex mb-5">
                <span className="small">Arranged:&nbsp;
                     {taskData.arrangement_start} - {taskData.arrangement_end}</span>
            </div>
            <p>{taskData.description}</p>

        </div>
    );
}
