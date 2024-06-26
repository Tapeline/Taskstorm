import {useEffect, useState} from "react";
import {useNavigate} from "react-router-dom";
import {getAllWorkspaces} from "../../api/endpoints-workspaces.jsx";
import WorkspaceCard from "../../components/WorkspaceCard/WorkspaceCard.jsx";
import CreateWorkspaceModal from "../../components/Modals/CreateWorkspaceModal/CreateWorkspaceModal.jsx";
import Preloader from "../../components/Preloader/Preloader.jsx";

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
            setWorkspaceList(response.data);
        });
    }, []);

    return (
        workspaceList === null?
        <Preloader/>
        :
        <div className="px-lg-5">
            <h1>Your workspaces</h1>
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
