import {Navigate} from "react-router-dom";

export default function LogoutPage() {
    localStorage.setItem("accessToken", null);
    return <Navigate to="/login"/>;
}
