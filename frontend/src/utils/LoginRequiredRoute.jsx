import {useEffect, useState} from "react";
import {getProfile} from "../api/endpoints-profile.jsx";
import Preloader from "../components/Preloader/Preloader.jsx";
import {Navigate} from "react-router-dom";

export default function LoginRequiredRoute({children}) {
    const [isAuthorized, setIsAuthorized] = useState(null);
    const token = localStorage.getItem("accessToken");

    if (token === null || token === undefined) return <Navigate to="/login"/>;

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

    return isAuthorized? children : <Navigate to="/login"/>;
}
