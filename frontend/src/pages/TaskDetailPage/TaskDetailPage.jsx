import React, {useEffect, useState} from "react";
import {Badge, Tab, Tabs} from "react-bootstrap";
import {Link, useNavigate, useParams} from "react-router-dom";
import {getWorkspace} from "../../api/endpoints-workspaces.jsx";
import {getAllTaskActivity, getTaskInWorkspace} from "../../api/endpoints-tasks.jsx";
import EditTaskNameModal from "../../components/Modals/EditTaskModals/EditTaskNameModal.jsx";
import EditTaskFolderModal from "../../components/Modals/EditTaskModals/EditTaskFolderModal.jsx";
import EditTaskAssigneeModal from "../../components/Modals/EditTaskModals/EditTaskAssigneeModal.jsx";
import EditTaskStageModal from "../../components/Modals/EditTaskModals/EditTaskStageModal.jsx";
import DisplayEditTaskTimeModal from "../../components/Modals/EditTaskModals/DisplayEditTaskTimeModal.jsx";
import EditTaskDescriptionModal from "../../components/Modals/EditTaskModals/EditTaskDescriptionModal.jsx";
import OpenCloseTaskButton from "../../components/Modals/EditTaskModals/OpenCloseTaskButton.jsx";
import DeleteTaskButton from "../../components/Modals/EditTaskModals/DeleteTaskButton.jsx";
import Preloader from "../../components/Preloader/Preloader.jsx";
import CommentCard from "../../components/CommentCard/CommentCard.jsx";
import LeaveCommentField from "../../components/LeaveCommentField/LeaveCommentField.jsx";
import Paginator from "../../components/Pagination/Paginator.jsx";
import HWhitespace from "../../utils/HWhitespace.jsx";
import MarkdownRender from "../../components/Markdown/MarkdownRender.jsx";
import WorkflowPushCard from "../../components/ActivityCards/WorkflowPushCard.jsx";
import AssigneeChangeCard from "../../components/ActivityCards/AssigneeChangeCard.jsx";
import OpenStateChangeCard from "../../components/ActivityCards/OpenStateChangeCard.jsx";
import VWhitespace from "../../utils/VWhitespace.jsx";
import EditTaskTagsModal from "../../components/Modals/EditTaskModals/EditTaskTagsModal.jsx";
import ColorHash from "color-hash";
import ProfilePic from "../../components/Misc/ProfilePic.jsx";

export default function TaskDetailPage() {
    const {workspaceId, taskId} = useParams();
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [isTaskNotFound, setIsTaskNotFound] = useState(false);
    const [taskData, setTaskData] = useState(null);
    const [taskActivity, setTaskActivity] = useState(null);
    const [taskComments, setTaskComments] = useState(null);
    const [taskPushes, setTaskPushes] = useState(null);
    const [taskAssignments, setTaskAssignments] = useState(null);
    const [taskStateChanges, setTaskStateChanges] = useState(null);
    const [workspaceData, setWorkspaceData] = useState(null);
    const [key, setKey] = useState("all");

    useEffect(() => {
        getTaskInWorkspace(accessToken, workspaceId, taskId).then(response => {
            if (!response.success && response.status === 404) {
                setIsTaskNotFound(true);
            } else {
                setTaskData(response.data);
            }
        });
        getAllTaskActivity(accessToken, workspaceId, taskId).then(response => {
            const activity = response.data;
            const comments = activity.filter(x => x.type === "comment");
            const pushes = activity.filter(x => x.type === "push");
            const assignments = activity.filter(x => x.type === "assign");
            const states = activity.filter(x => x.type === "state");
            setTaskActivity(activity);
            setTaskComments(comments);
            setTaskPushes(pushes);
            setTaskAssignments(assignments);
            setTaskStateChanges(states);
        });
        getWorkspace(accessToken, workspaceId).then(response => {
            setWorkspaceData(response.data);
        })
    }, []);

    if (isTaskNotFound)
        return <h1>Task not found</h1>;

    const isLoaded = () => {
        return !(taskData === null || taskActivity === null || taskComments === null ||
                 taskPushes === null || taskAssignments === null || taskStateChanges === null ||
                 workspaceData === null);
    }

    const colorHash = new ColorHash({
        lightness: 0.35,
        saturation: 1,
    });

    return (
        !isLoaded()? <Preloader/> :

            <div className="px-lg-5">
                <Link to={"/workspaces/" + workspaceId}>Back to workspace</Link>
                <hr/>
                <div className="d-flex justify-content-between">
                    <h2>{taskData.name} <EditTaskNameModal task={taskData} workspaceId={workspaceId}/></h2>
                    <div>
                        <OpenCloseTaskButton task={taskData} workspaceId={workspaceId}/>
                        <span className="mx-1"></span>
                        <DeleteTaskButton task={taskData} workspaceId={workspaceId}/>
                    </div>
                </div>
                <h6><i className="bi bi-folder"></i> {taskData.folder}&nbsp;
                    <EditTaskFolderModal task={taskData} workspaceId={workspaceId}/></h6>
                <div className="d-flex justify-content-between mb-1">
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
                                ? <span className="small"> Assigned to&nbsp;
                                    <ProfilePic url={taskData.assignee?.profile_pic} size={24}/>&nbsp;
                                    {taskData.assignee?.username}</span>
                                : <span className="small"> Unassigned</span>
                        }
                        &nbsp;
                        <EditTaskAssigneeModal task={taskData} workspaceId={workspaceId}/>
                    </div>
                </div>
                <div className="d-flex mb-3">
                    {
                        taskData.tags.length !== 0
                            ? <><span className="small">Tags:</span><span>&nbsp;{
                                taskData.tags.split(" ").map((tag, index) => {
                                    let color = colorHash.hex(tag);
                                    if (workspaceData.settings.tag_coloring[tag] !== undefined)
                                        color = workspaceData.settings.tag_coloring[tag];
                                    return <span className="badge me-1" key={index} style={{
                                        background: color
                                    }}>{tag}</span>;
                                })
                            }</span></>
                            : <span className="small">No tags</span>
                    }
                    &nbsp;
                    <EditTaskTagsModal task={taskData} workspaceId={workspaceId}/>
                </div>
                <div className="d-flex mb-3"> 
                    {
                        taskData.stage !== null
                            ? <span className="small">Stage:&nbsp;
                                <i className="bi bi-circle-fill"
                                   style={{color: "#" + taskData.stage?.color}}></i>&nbsp;
                                {taskData.stage?.name}</span>
                            : <span className="small"> Unstaged</span>
                    }
                    &nbsp;
                    <EditTaskStageModal task={taskData} workspaceId={workspaceId}/>
                </div>
                <div className="d-flex">
                <span className="small">Time bounds:&nbsp;
                    <DisplayEditTaskTimeModal task={taskData} workspaceId={workspaceId}
                                              title="Edit time bound start"
                                              field="time_bounds_start"/>
                    <span> to </span>
                    <DisplayEditTaskTimeModal task={taskData} workspaceId={workspaceId}
                                              title="Edit time bound end"
                                              field="time_bounds_end"/></span>
                </div>
                <div className="d-flex">
                <span className="small">Arranged:&nbsp;
                    <DisplayEditTaskTimeModal task={taskData} workspaceId={workspaceId}
                                              title="Edit arrangement start"
                                              field="arrangement_start"/>
                    <span> to </span>
                    <DisplayEditTaskTimeModal task={taskData} workspaceId={workspaceId}
                                              title="Edit arrangement end"
                                              field="arrangement_end"/></span>
                </div>
                <p className="my-5">
                    <EditTaskDescriptionModal task={taskData} workspaceId={workspaceId}/>
                    <HWhitespace/>
                    <MarkdownRender text={taskData.description}/>
                </p>
                <div>
                    <h5>Activity</h5>
                    <Tabs id="activity-tabs" activeKey={key} onSelect={k => setKey(k)}>
                        <Tab title="All activity" eventKey="all">
                            <VWhitespace/>
                            <Paginator>{taskActivity.map((value, index) => {
                                if (value.type === "comment")
                                    return <CommentCard data={value}
                                                        workspaceId={workspaceId}
                                                        key={index}/>;
                                else if (value.type === "push")
                                    return <WorkflowPushCard data={value} key={index}/>;
                                else if (value.type === "assign")
                                    return <AssigneeChangeCard data={value} key={index}/>;
                                else if (value.type === "state")
                                    return <OpenStateChangeCard data={value} key={index}/>;
                            })}</Paginator>
                        </Tab>
                        <Tab title="Comments" eventKey="comments">
                            <VWhitespace/>
                            <Paginator>{taskComments.map((value, index) => {
                                return <CommentCard data={value}
                                                    workspaceId={workspaceId}
                                                    key={index}/>;
                            })}</Paginator>
                        </Tab>
                        <Tab title="Workflow" eventKey="pushes">
                            <VWhitespace/>
                            <Paginator>{taskPushes.map((value, index) => {
                                return <WorkflowPushCard data={value} key={index}/>;
                            })}</Paginator>
                        </Tab>
                        <Tab title="Assignments" eventKey="assignments">
                            <VWhitespace/>
                            <Paginator>{taskAssignments.map((value, index) => {
                                return <AssigneeChangeCard data={value} key={index}/>;
                            })}</Paginator>
                        </Tab>
                        <Tab title="Open/Close" eventKey="state-change">
                            <VWhitespace/>
                            <Paginator>{taskStateChanges.map((value, index) => {
                                return <OpenStateChangeCard data={value} key={index}/>;
                            })}</Paginator>
                        </Tab>
                    </Tabs>
                    <VWhitespace size={3}/>
                    <LeaveCommentField task={taskData}/>
                </div>
            </div>
    );
}
