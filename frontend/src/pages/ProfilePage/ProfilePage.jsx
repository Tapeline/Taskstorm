import {useEffect, useState} from "react";
import {Button, Col, Form, Row, Tab, Tabs} from "react-bootstrap";
import {login} from "../../api/endpoints-auth.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {getProfile} from "../../api/endpoints-profile.jsx";
import DeleteWorkspaceModal from "../../components/Modals/DeleteWorkspaceModal/DeleteWorkspaceModal.jsx";
import DeleteAccountModal from "../../components/Modals/DeleteAccountModal/DeleteAccountModal.jsx";

export default function ProfilePage() {
    const {page} = useParams();
    const [key, setKey] = useState(page);
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [profileData, setProfileData] = useState({});

    if (accessToken === null) {
        navigate("login/");
        return;
    }
    if (page === null) {
        navigate("/profile/dashboard");
        return;
    }

    useEffect(() => {
        getProfile(accessToken).then(response => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else {
                setProfileData(response.data);
            }
        });
    }, []);

    return (
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
                <Row>
                    <Col md={2}>
                        <Row><Link to="#manage-general">General</Link></Row>
                        <Row><Link to="#manage-danger-zone">Danger zone</Link></Row>
                    </Col>
                    <Col>
                        <Row id="#manage-general">
                            <h3>General</h3>
                            <div>
                                <h4>Username: {profileData.username}</h4>
                                <h6>ID: {profileData.id}</h6>
                            </div>
                        </Row>
                        <hr/>
                        <Row id="#manage-danger-zone">
                            <h3>Danger zone</h3>
                            <div>
                                <DeleteAccountModal/>
                            </div>
                        </Row>
                    </Col>
                </Row>
            </Tab>
        </Tabs>
    )
}
