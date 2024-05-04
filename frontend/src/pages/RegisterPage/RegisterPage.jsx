import {useState} from "react";
import {Button, Form} from "react-bootstrap";
import {login, register} from "../../api/endpoints-auth.jsx";
import {toastError} from "../../ui/toasts.jsx";
import {Link, useNavigate} from "react-router-dom";

export default function RegisterPage() {
    const [userName, setUserName] = useState("");
    const [userPass, setUserPass] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        register(userName, userPass).then(response => {
            if (!response.success) {
                toastError(response.reason);
            } else {
                navigate("/login");
            }
        }).catch(toastError);
    }

    return (
        <div className="d-flex justify-content-center align-items-center min-vw-100 min-vh-100">
            <Form onSubmit={handleSubmit} className="d-flex flex-column justify-content-center">
                <h1>Register</h1>
                <Form.Control type="text" placeholder="Enter username"
                              onChange={e => setUserName(e.target.value)}
                              className="mb-3"/>
                <Form.Control type="password" placeholder="Enter password"
                              onChange={e => setUserPass(e.target.value)}
                              className="mb-3"/>
                <Button variant="primary" type="submit">Register</Button>
                <br/>
                <small><Link to="/login">or sign in</Link></small>
            </Form>
        </div>
    )
}
