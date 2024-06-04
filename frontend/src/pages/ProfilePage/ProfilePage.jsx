import {useEffect, useState} from "react";
import {Button, Col, Form, Row, Tab, Tabs} from "react-bootstrap";
import {login} from "../../api/endpoints-auth.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {getProfile} from "../../api/endpoints-profile.jsx";
import DeleteWorkspaceModal from "../../components/Modals/DeleteWorkspaceModal/DeleteWorkspaceModal.jsx";
import DeleteAccountModal from "../../components/Modals/DeleteAccountModal/DeleteAccountModal.jsx";
import VWhitespace from "../../utils/VWhitespace.jsx";
import CategoryPanel from "../../components/CategorySwitcher/CategoryPanel.jsx";
import TransferWorkspaceOwnershipModal
    from "../../components/Modals/TransferWorkspaceOwnershipModal/TransferWorkspaceOwnershipModal.jsx";
import CategorySwitcher from "../../components/CategorySwitcher/CategorySwitcher.jsx";

export default function ProfilePage() {
    const {page} = useParams();
    const [key, setKey] = useState(page);
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [profileData, setProfileData] = useState({});

    if (page === null) {
        navigate("/profile/dashboard");
        return;
    }

    useEffect(() => {
        getProfile(accessToken).then(response => {
            setProfileData(response.data);
        });
    }, []);

    useEffect(() => {
        navigate("/profile/" + key + "/");
    }, [key]);

    return (<div className="px-lg-5">
        <h1>Your profile</h1>
        <VWhitespace size={1}/>

        <Tabs id="controlled-tab-example" activeKey={key}
              onSelect={(k) => setKey(k)} className="mb-3">
            <Tab eventKey="dashboard" title="Dashboard">
                Tab content
            </Tab>
            <Tab eventKey="tasks" title="Tasks">
                Tab content
            </Tab>
            <Tab eventKey="calendar" title="Calendar">
                Tab content
            </Tab>
            <Tab eventKey="manage" title="Manage">
                <CategorySwitcher defaultKey="#general">
                    <CategoryPanel name="General" tabId="#general">
                        <h4>Username: {profileData.username}</h4>
                        <h6>ID: {profileData.id}</h6>
                    </CategoryPanel>
                    <CategoryPanel name="Danger zone" tabId="#danger-zone">
                        <DeleteAccountModal/>
                    </CategoryPanel>
                </CategorySwitcher>
            </Tab>
        </Tabs>
    </div>);
}
