import './App.css'
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import RealTimeNotificationUpdater from "./components/Notifications/RealTimeNotificationUpdater.jsx";
import {useEffect, useState} from "react";
import {getProfile} from "./api/endpoints-profile.jsx";
import Preloader from "./components/Preloader/Preloader.jsx";

function App() {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const token = localStorage.getItem("accessToken");
    const navigate = useNavigate();
    const location = useLocation();

    if (token === null || token === undefined)
        navigate("/login");

    useEffect(() => {
        getProfile(localStorage.getItem("accessToken")).then(response => {
            const tokenInvalid = !response.success && response.status === 401;
            if (!tokenInvalid) {
                localStorage.setItem("accountUsername", response.data.username);
                localStorage.setItem("accountId", response.data.id);
            }
            setIsAuthorized(!tokenInvalid);
        })
    }, []);

    if (isAuthorized === null) return <Preloader/>;
    if (!isAuthorized) navigate("/login");

    if (location.pathname === "/") navigate("/workspaces");

    return (
        <div className="container-fluid overflow-hidden">
            <div className="row vh-100 overflow-auto">
                <Navbar/>
                <div className="col-sm-9 p-3 min-vh-100" id="content">
                    <Outlet/>
                </div>
                <RealTimeNotificationUpdater/>
            </div>
        </div>
    );
}

export default App;
