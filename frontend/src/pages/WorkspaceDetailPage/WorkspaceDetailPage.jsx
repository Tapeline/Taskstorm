import {useEffect, useState} from "react";
import {Button, Form, Tab, Tabs} from "react-bootstrap";
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

export default function WorkspaceDetailPage() {
    const {workspaceId, page} = useParams();
    const [key, setKey] = useState(page);
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [workspaceData, setWorkspaceData] = useState({});
    const [taskList, setTaskList] = useState([]);
    const [isWorkspaceNotFound, setWorkspaceNotFound] = useState(false);
    const [taskFilter, setTaskFilter] = useState(null);

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
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success && response.success == 404) {
                setWorkspaceNotFound(true);
            } else {
                setWorkspaceData(response.data);
            }
        });
        getAllTasksInWorkspace(accessToken, workspaceId, taskFilter).then(response => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success && response.success == 404) {
                setWorkspaceNotFound(true);
            } else {
                setTaskList(response.data);
            }
        });
    }, [taskFilter]);

    const reloadTasks = () => {

    }

    if (isWorkspaceNotFound)
        return <h1>Workspace not found</h1>;

    return (
        <div className="px-lg-5">
            <h1 className="mb-5">{workspaceData.name}</h1>
            <Tabs id="controlled-tab-example" activeKey={key}
                  onSelect={(k) => setKey(k)} className="mb-3">
                <Tab eventKey="tasks" title="Tasks">
                    <div className="d-flex mb-2">
                        <CreateTaskModal workspace={workspaceData}/>
                        <Form.Control type="text" placeholder="Task filter" className="ms-2"
                                      onChange={e => setTaskFilter(e.target.value)}/>
                    </div>
                    {
                        taskList.map(function (data, id) {
                            return <TaskCard data={data}/>
                        })
                    }
                </Tab>
                <Tab eventKey="members" title="Members">
                    Tab content
                </Tab>
                <Tab eventKey="manage" title="Manage">
                    <p>Owner {workspaceData.owner?.username}</p>
                </Tab>
            </Tabs>
        </div>
    );
}
