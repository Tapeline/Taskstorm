import {useEffect, useState} from "react";
import {Button, Form, Tab, Tabs} from "react-bootstrap";
import {login} from "../../api/endpoints-auth.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {getProfile} from "../../api/endpoints-profile.jsx";

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
                <p>Username {profileData.username}</p>
            </Tab>
        </Tabs>
    )
}
