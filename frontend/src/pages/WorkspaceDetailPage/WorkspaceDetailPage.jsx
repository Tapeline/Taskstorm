import {useEffect, useState} from "react";
import {Button, Col, Form, Row, Spinner, Tab, Tabs} from "react-bootstrap";
import {login} from "../../api/endpoints-auth.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {getProfile} from "../../api/endpoints-profile.jsx";
import {getWorkspace} from "../../api/endpoints-workspaces.jsx";
import {getAllTasksInWorkspace} from "../../api/endpoints-tasks.jsx";
import WorkspaceCard from "../../components/WorkspaceCard/WorkspaceCard.jsx";
import TaskCard from "../../components/TaskCard/TaskCard.jsx";
import CreateTaskModal from "../../components/Modals/CreateTaskModal/CreateTaskModal.jsx";
import WorkspaceMemberTable from "../../components/WorkspaceMemberTable/WorkspaceMemberTable.jsx";
import AddWorkspaceMemberModal from "../../components/Modals/AddWorkspaceMemberModal/AddWorkspaceMemberModal.jsx";
import KanbanBoard from "../../components/Kanban/KanbanBoard.jsx";
import DeleteWorkspaceModal from "../../components/Modals/DeleteWorkspaceModal/DeleteWorkspaceModal.jsx";
import CreateStageModal from "../../components/Modals/CreateStageModal/CreateStageModal.jsx";
import WorkspaceStageTable from "../../components/WorkspaceStageTable/WorkspaceStageTable.jsx";
import {getAllNotificationsInWorkspace, getStagesInWorkspace} from "../../api/endpoints-workflow.jsx";
import CreateNotificationRuleModal
    from "../../components/Modals/CreateNotificationRuleModal/CreateNotificationRuleModal.jsx";
import WorkspaceNotificationRuleTable
    from "../../components/WorkspaceNotificationRuleTable/WorkspaceNotificationRuleTable.jsx";
import {getRulesInWorkspace} from "../../api/endpoints-notifications.jsx";
import NotificationCard from "../../components/Notifications/NotificationCard.jsx";
import Paginator from "../../components/Pagination/Paginator.jsx";
import TransferWorkspaceOwnershipModal
    from "../../components/Modals/TransferWorkspaceOwnershipModal/TransferWorkspaceOwnershipModal.jsx";

export default function WorkspaceDetailPage() {
    const {workspaceId, page} = useParams();
    const [key, setKey] = useState(page === undefined || page === null? "tasks" : page);
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [taskFilter, setTaskFilter] = useState(null);

    const [isWorkspaceNotFound, setWorkspaceNotFound] = useState(false);
    const [taskList, setTaskList] = useState(null);
    const [workspaceData, setWorkspaceData] = useState(null);
    const [workspaceStages, setWorkspaceStages] = useState(null);
    const [workspaceRules, setWorkspaceRules] = useState(null);
    const [workspaceNotifications, setWorkspaceNotifications] = useState(null);

    if (accessToken === null) {
        navigate("login/");
        return;
    }
    if (page === null) {
        navigate("/workspaces/" + workspaceId + "/tasks");
        return;
    }

    useEffect(() => {
        getWorkspace(accessToken, workspaceId).then(response => {
            if (!response.success && response.status === 404) {
                setWorkspaceNotFound(true);
            } else {
                setWorkspaceData(response.data);
            }
        });
        getAllTasksInWorkspace(accessToken, workspaceId, taskFilter).then(response => {
            setTaskList(response.data);
        });
        getStagesInWorkspace(accessToken, workspaceId).then(response => {
            setWorkspaceStages(response.data);
        });
        getRulesInWorkspace(accessToken, workspaceId).then(response => {
            setWorkspaceRules(response.data);
        });
        getAllNotificationsInWorkspace(accessToken, workspaceId).then(response => {
            setWorkspaceNotifications(response.data);
        });
    }, [taskFilter]);

    useEffect(() => {
        navigate("/workspaces/" + workspaceId + "/" + key + "/");
    }, [key]);

    const isFullyLoaded = () => {
        return !(workspaceRules === null || workspaceStages === null || workspaceData === null ||
                 taskList === null || workspaceNotifications === null)
    }

    if (isWorkspaceNotFound)
        return <h1>Workspace not found</h1>;

    return (
        !isFullyLoaded()?
        <div className="d-flex justify-content-center h-100 w-100 align-items-center">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
        :
        <div className="px-lg-5">
            <Link to="/workspaces">Back to workspace list</Link>
            <h1 className="mb-5">{workspaceData.name}</h1>
            <Tabs id="controlled-tab-example" activeKey={key}
                  onSelect={(k) => setKey(k)} className="mb-3">
                <Tab eventKey="members" title={<i className="bi bi-people-fill"></i>}>
                    <AddWorkspaceMemberModal workspace={workspaceData}/>
                    <WorkspaceMemberTable workspace={workspaceData}/>
                </Tab>
                <Tab eventKey="stages" title={<i className="bi bi-flag-fill"></i>}>
                    <CreateStageModal workspace={workspaceData}/>
                    <WorkspaceStageTable workspace={workspaceData} stages={workspaceStages}/>
                </Tab>
                <Tab eventKey="notifications" title={<i className="bi bi-bell-fill"></i>}>
                    <Row>
                        <Col style={{minWidth: "400px"}}>
                            <h3>Notifications</h3>
                            {/*
                                workspaceNotifications.map((value, index) => {
                                    return <NotificationCard notification={value} key={index}/>;
                                })
                            */}
                            <Paginator>
                                {
                                    workspaceNotifications.map((value, index) => {
                                        return <NotificationCard notification={value} key={index}/>;
                                    })
                                }
                            </Paginator>
                        </Col>
                        <Col style={{minWidth: "400px"}}>
                            <h3>Notification rules</h3>
                            <CreateNotificationRuleModal workspace={workspaceData}/>
                            <WorkspaceNotificationRuleTable workspace={workspaceData}
                                                            rules={workspaceRules}/>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="manage" title={<i className="bi bi-gear-fill"></i>}>
                    <Row>
                        <Col md={2}>
                            <Row><Link to="#manage-general">General</Link></Row>
                            <Row><Link to="#manage-ownership">Ownership</Link></Row>
                            <Row><Link to="#manage-danger-zone">Danger zone</Link></Row>
                        </Col>
                        <Col>
                            <Row id="#manage-general">
                                <h3>General</h3>
                                <div>
                                    <h4>{workspaceData.name}</h4>
                                    <h6>ID: {workspaceData.id}</h6>
                                </div>
                            </Row>
                            <hr/>
                            <Row id="#manage-ownership">
                                <h3>Ownership</h3>
                                <h6>Current owner: {workspaceData.owner.username}</h6>
                                {workspaceData.owner.id.toString() ===
                                    localStorage.getItem("accountId")?
                                    <div>
                                        <TransferWorkspaceOwnershipModal workspace={workspaceData}/>
                                    </div>
                                : ""}
                            </Row>
                            <hr/>
                            <Row id="#manage-danger-zone">
                                <h3>Danger zone</h3>
                                <div>
                                    <DeleteWorkspaceModal workspace={workspaceData}/>
                                </div>
                            </Row>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="tasks" title="Tasks">
                    <div className="d-flex mb-2">
                        <CreateTaskModal workspace={workspaceData}/>
                        <Form.Control type="text" placeholder="Task filter" className="ms-2"
                                      onChange={e => setTaskFilter(e.target.value)}/>
                    </div>
                    {
                        taskList.map(function (data, id) {
                            return <TaskCard data={data} key={id}/>
                        })
                    }
                </Tab>
                <Tab eventKey="kanban" title="Kanban">
                    <KanbanBoard filter={taskFilter} workspace={workspaceData}/>
                </Tab>
            </Tabs>
        </div>
    );
}
