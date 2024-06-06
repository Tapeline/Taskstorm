import {useEffect, useState} from "react";
import {Button, Col, Form, ListGroup, Row, Spinner, Tab, Tabs} from "react-bootstrap";
import {Link, useNavigate, useParams} from "react-router-dom";
import {getWorkspace} from "../../api/endpoints-workspaces.jsx";
import {getAllTasksInWorkspace} from "../../api/endpoints-tasks.jsx";
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
import {getAllDocumentsInWorkspace} from "../../api/endpoints-documents.jsx";
import CreateDocumentModal from "../../components/Modals/CreateDocumentModal/CreateDocumentModal.jsx";
import VWhitespace from "../../utils/VWhitespace.jsx";
import HWhitespace from "../../utils/HWhitespace.jsx";
import CategorySwitcher from "../../components/CategorySwitcher/CategorySwitcher.jsx";
import CategoryPanel from "../../components/CategorySwitcher/CategoryPanel.jsx";
import WorkspaceTagColorTable from "../../components/WorkspaceTagColorTable/WorkspaceTagColorTable.jsx";

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
    const [workspaceDocuments, setWorkspaceDocuments] = useState(null);

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
        getAllDocumentsInWorkspace(accessToken, workspaceId).then(response => {
            setWorkspaceDocuments(response.data);
        })
    }, [taskFilter]);

    useEffect(() => {
        navigate("/workspaces/" + workspaceId + "/" + key + "/");
    }, [key]);

    const isFullyLoaded = () => {
        return !(workspaceRules === null || workspaceStages === null || workspaceData === null ||
                 taskList === null || workspaceNotifications === null || workspaceDocuments === null)
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
            <VWhitespace size={1}/>
            <Tabs id="controlled-tab-example" activeKey={key}
                  onSelect={(k) => setKey(k)} className="mb-3">
                <Tab eventKey="members" title={<i className="bi bi-people-fill"></i>}>
                    <AddWorkspaceMemberModal workspace={workspaceData}/>
                    <VWhitespace/>
                    <WorkspaceMemberTable workspace={workspaceData}/>
                </Tab>
                <Tab eventKey="stages" title={<i className="bi bi-flag-fill"></i>}>
                    <CreateStageModal workspace={workspaceData}/>
                    <VWhitespace/>
                    <WorkspaceStageTable workspace={workspaceData} stages={workspaceStages}/>
                </Tab>
                <Tab eventKey="notifications" title={<i className="bi bi-bell-fill"></i>}>
                    <Row>
                        <Col sm>
                            <h3>Notifications</h3>
                            <Paginator>
                                {
                                    workspaceNotifications.map((value, index) => {
                                        return <NotificationCard notification={value} key={index}/>;
                                    })
                                }
                            </Paginator>
                        </Col>
                        <Col sm>
                            <h3>Notification rules</h3>
                            <CreateNotificationRuleModal workspace={workspaceData}/>
                            <VWhitespace/>
                            <WorkspaceNotificationRuleTable workspace={workspaceData}
                                                            rules={workspaceRules}/>
                        </Col>
                    </Row>
                </Tab>
                <Tab eventKey="manage" title={<i className="bi bi-gear-fill"></i>}>
                    <CategorySwitcher defaultKey="#general">
                        <CategoryPanel name="General" tabId="#general">
                            <h4>{workspaceData.name}</h4>
                            <h6>ID: {workspaceData.id}</h6>
                        </CategoryPanel>
                        <CategoryPanel name="Tags" tabId="#tags">
                            <span className="text-muted">Specify custom colors for
                                tags instead of using generated</span>
                            <br/>
                            <VWhitespace/>
                            <WorkspaceTagColorTable workspace={workspaceData}
                                                    tags={workspaceData.settings.tag_coloring}/>
                        </CategoryPanel>
                        <CategoryPanel name="Ownership" tabId="#ownership">
                            <h6>Current owner: {workspaceData.owner.username}</h6>
                            {workspaceData.owner.id.toString() ===
                                localStorage.getItem("accountId")?
                                <div>
                                    <TransferWorkspaceOwnershipModal workspace={workspaceData}/>
                                </div>
                            : ""}
                        </CategoryPanel>
                        <CategoryPanel name="Danger zone" tabId="#danger-zone">
                            <DeleteWorkspaceModal workspace={workspaceData}/>
                        </CategoryPanel>
                    </CategorySwitcher>
                </Tab>
                <Tab eventKey="tasks" title="Tasks">
                    <div className="d-flex mb-2">
                        <CreateTaskModal workspace={workspaceData}/>
                        <Form.Control type="text" placeholder="Task filter" className="ms-2"
                                      onChange={e => setTaskFilter(e.target.value)}/>
                    </div>
                    {
                        taskList.map(function (data, id) {
                            return <TaskCard data={data} workspace={workspaceData} key={id}/>
                        })
                    }
                </Tab>
                <Tab eventKey="kanban" title="Kanban">
                    <KanbanBoard filter={taskFilter} workspace={workspaceData}/>
                </Tab>
                <Tab eventKey="documents" title="Documents">
                    <CreateDocumentModal workspaceId={workspaceData.id}/>
                    <VWhitespace/>
                    <ListGroup>
                        {
                            workspaceDocuments.map(function (data, id) {
                                return <ListGroup.Item action key={id}
                                                       href={`/workspaces/${workspaceId}/` +
                                                             `documents/${data.id}`}>
                                    <i className="bi bi-file-earmark-fill"></i>
                                    <HWhitespace/>
                                    {data.title}
                                </ListGroup.Item>;
                            })
                        }
                        {
                            workspaceDocuments.length === 0?
                                <ListGroup.Item>No documents for now</ListGroup.Item> : ""
                        }
                    </ListGroup>
                </Tab>
            </Tabs>
        </div>
    );
}
