import {useEffect, useState} from "react";
import {Button, Col, Form, Row, Tab, Table, Tabs} from "react-bootstrap";
import {login} from "../../api/endpoints-auth.jsx";
import {toastError, toastSuccess} from "../../ui/toasts.jsx";
import {Link, useNavigate, useParams} from "react-router-dom";
import {toast} from "react-toastify";
import {
    getProfile,
    getRecommendedTasks,
    getUserStats,
    getUserTasks,
    modifyProfileSettings
} from "../../api/endpoints-profile.jsx";
import DeleteWorkspaceModal from "../../components/Modals/DeleteWorkspaceModal/DeleteWorkspaceModal.jsx";
import DeleteAccountModal from "../../components/Modals/DeleteAccountModal/DeleteAccountModal.jsx";
import VWhitespace from "../../utils/VWhitespace.jsx";
import CategoryPanel from "../../components/CategorySwitcher/CategoryPanel.jsx";
import TransferWorkspaceOwnershipModal
    from "../../components/Modals/TransferWorkspaceOwnershipModal/TransferWorkspaceOwnershipModal.jsx";
import CategorySwitcher from "../../components/CategorySwitcher/CategorySwitcher.jsx";
import {getPublicVAPID} from "../../api/common.jsx";
import Preloader from "../../components/Preloader/Preloader.jsx";
import TaskCard from "../../components/TaskCard/TaskCard.jsx";
import Chart from "react-apexcharts";

export default function ProfilePage() {
    const {page} = useParams();
    const [key, setKey] = useState(page);
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [profileData, setProfileData] = useState(null);
    const [recommendedTasks, setRecommendedTasks] = useState(null);
    const [stats, setStats] = useState(null);
    const [myTasks, setMyTasks] = useState(null);

    if (page === null) {
        navigate("/profile/dashboard");
        return;
    }

    useEffect(() => {
        getProfile(accessToken).then(response => {
            setProfileData(response.data);
        });
        getRecommendedTasks(accessToken).then(response => {
            setRecommendedTasks(response.data);
        });
        getUserStats(accessToken).then(response => {
            setStats(response.data);
        });
        getUserTasks(accessToken).then(response => {
            setMyTasks(response.data);
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

    if (recommendedTasks === null || profileData === null || stats === null || myTasks === null)
        return <Preloader/>;

    const chartOptions = {
        chart: {
            type: 'area',
            stacked: false,
            height: 200,
            zoom: {
                type: 'x',
                enabled: false,
            },
            toolbar: {
                autoSelected: 'zoom'
            }
        },
        dataLabels: {
            enabled: false
        },
        markers: {
            size: 0,
        },
        title: {
            text: 'Actions for past month',
            align: 'left'
        },
        yaxis: {
            labels: {
                formatter: function (val) {
                    return val;
                }
            },
            title: {
                text: 'Actions'
            },
        },
        xaxis: {
            type: 'datetime',
        },
        tooltip: {
            shared: false,
            y: {
                formatter: function (val) {
                    return val;
                }
            }
        }
    };

    const dailyActions = stats.distributed?.map((item) => {
        return [new Date(item[0]).getTime(), item[1]];
    })

    return (<div className="px-lg-5">
        <h1>Your profile</h1>
        <VWhitespace size={1}/>

        <Tabs id="controlled-tab-example" activeKey={key}
              onSelect={(k) => setKey(k)} className="mb-3">
            <Tab eventKey="dashboard" title="Dashboard">
                <Row>
                    <Col md>
                        <h5>You might want to pay attention to these tasks</h5>
                        <VWhitespace/>
                        {
                            recommendedTasks.map((task, index) => {
                                return <TaskCard data={task} key={index}/>;
                            })
                        }
                    </Col>
                    <Col md>
                        <h5>Statistics</h5>
                        <VWhitespace/>
                        <Chart
                            options={chartOptions}
                            series={[{name: "Actions", data: dailyActions}]}
                            height={250}>
                        </Chart>
                        <h6><b>Task closing quality</b></h6>
                        <Chart
                            options={{
                                chart: {type: "pie"},
                                labels: ["Closed fully", "Reopened"]
                            }}
                            series={[
                                stats.month.close_quality[1][1] - stats.month.close_quality[1][0],
                                stats.month.close_quality[1][0]
                            ]}
                            type={"pie"}
                            height={250}>
                        </Chart>
                        <Table striped>
                            <thead>
                            <tr>
                                <td>For past</td>
                                <td>Tasks created</td>
                                <td>Stages changed</td>
                                <td>Tasks closed</td>
                                <td>Close quality</td>
                            </tr>
                            </thead>
                            <tr>
                                <td>Day</td>
                                <td>{stats.day.tasks_created}</td>
                                <td>{stats.day.workflow_pushes}</td>
                                <td>{stats.day.closed_tasks}</td>
                                <td>{stats.day.close_quality[0] * 100}%</td>
                            </tr>
                            <tr>
                                <td>Week</td>
                                <td>{stats.week.tasks_created}</td>
                                <td>{stats.week.workflow_pushes}</td>
                                <td>{stats.week.closed_tasks}</td>
                                <td>{stats.week.close_quality[0] * 100}%</td>
                            </tr>
                            <tr>
                                <td>Month</td>
                                <td>{stats.month.tasks_created}</td>
                                <td>{stats.month.workflow_pushes}</td>
                                <td>{stats.month.closed_tasks}</td>
                                <td>{stats.month.close_quality[0] * 100}%</td>
                            </tr>
                        </Table>
                    </Col>
                </Row>
            </Tab>
            <Tab eventKey="tasks" title="Tasks">
                {
                    myTasks.map((task, index) => {
                        return <TaskCard data={task} key={index}/>;
                    })
                }
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
