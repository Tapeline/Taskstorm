import {useEffect, useState} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {getAllWorkspaces} from "../../api/endpoints-workspaces.jsx";
import WorkspaceCard from "../../components/WorkspaceCard/WorkspaceCard.jsx";
import CreateWorkspaceModal from "../../components/Modals/CreateWorkspaceModal/CreateWorkspaceModal.jsx";
import {Form, Spinner} from "react-bootstrap";

export default function WorkspaceListPage() {
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [workspaceList, setWorkspaceList] = useState(null);

    if (accessToken === null) {
        navigate("login/");
        return;
    }

    useEffect(() => {
        getAllWorkspaces(accessToken).then(response => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else {
                setWorkspaceList(response.data);
            }
        });
    }, []);

    return (
        workspaceList === null?
        <div className="d-flex justify-content-center h-100 w-100 align-items-center">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
            </Spinner>
        </div>
        :
        <div className="px-lg-5">
            <CreateWorkspaceModal/>
            <div className="my-2"></div>
            {
                workspaceList.map(function (data, id) {
                    return <WorkspaceCard data={data}/>
                })
            }
        </div>
    );
}
