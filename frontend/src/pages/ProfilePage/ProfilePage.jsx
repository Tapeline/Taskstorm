import {useEffect, useState} from "react";
import {Button, Col, Form, Row, Tab, Tabs} from "react-bootstrap";
import {login} from "../../api/endpoints-auth.jsx";
import {toastError, toastSuccess} from "../../ui/toasts.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {getProfile, modifyProfileSettings} from "../../api/endpoints-profile.jsx";
import DeleteWorkspaceModal from "../../components/Modals/DeleteWorkspaceModal/DeleteWorkspaceModal.jsx";
import DeleteAccountModal from "../../components/Modals/DeleteAccountModal/DeleteAccountModal.jsx";
import VWhitespace from "../../utils/VWhitespace.jsx";
import CategoryPanel from "../../components/CategorySwitcher/CategoryPanel.jsx";
import TransferWorkspaceOwnershipModal
    from "../../components/Modals/TransferWorkspaceOwnershipModal/TransferWorkspaceOwnershipModal.jsx";
import CategorySwitcher from "../../components/CategorySwitcher/CategorySwitcher.jsx";
import {getPublicVAPID} from "../../api/common.jsx";

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

    const requestNotificationPermission = () => {
        Notification.requestPermission().then(function(permission) {
            if (permission === 'granted') {
                toastSuccess('Notification permission granted.');
                navigator.serviceWorker.ready.then(function(registration) {
                    registration.pushManager.subscribe(
                        {userVisibleOnly: true, applicationServerKey: getPublicVAPID()}
                    ).then(function(subscription) {
                        getProfile(accessToken).then(response => {
                            const settings = response.data.settings;
                            settings.wp_sub = subscription;
                            modifyProfileSettings(accessToken, settings).then(response1 => {
                                if (response1.success)
                                    toastSuccess("Push notifications will now be displayed" +
                                        "on this device");
                                else
                                    toastError("Could not register subscription")
                            })
                        });
                        console.log('Subscribed for push:', subscription.endpoint);
                    }).catch(function(error) {
                        console.error('Subscription failed:', error);
                        toastError("Could not register subscription")
                    });
                });
            } else {
                toastError('Unable to get permission to notify.');
            }
        });
    };

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
                    <CategoryPanel name="Notifications" tabId="#notifications">
                        <Button variant="outline-primary"
                                onClick={requestNotificationPermission}>
                            Click to bind this device
                        </Button>
                    </CategoryPanel>
                    <CategoryPanel name="Danger zone" tabId="#danger-zone">
                        <DeleteAccountModal/>
                    </CategoryPanel>
                </CategorySwitcher>
            </Tab>
        </Tabs>
    </div>);
}
