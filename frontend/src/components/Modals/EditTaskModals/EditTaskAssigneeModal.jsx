import React, {useEffect, useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {modifyTaskInWorkspace} from "../../../api/endpoints-tasks.jsx";
import {getWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {getProfile} from "../../../api/endpoints-profile.jsx";

export default function EditTaskAssigneeModal(props) {
    const [show, setShow] = useState(false);
    const {workspaceId, task} = props;
    const [availableUsers, setAvailableUsers] = useState([]);
    const [profile, setProfile] = useState({});
    const [value, setValue] = useState(task.folder);
    const navigate = useNavigate();

    useEffect(() => {
        getProfile(localStorage.getItem("accessToken")).then((response) => {
            if (!response.success && response.status === 401) navigate("/login");
            else if (!response.success) toastError(response.reason);
            else setProfile(response.data);
        });
    }, []);

    useEffect(() => {
        getWorkspace(localStorage.getItem("accessToken"), workspaceId).then((response) => {
            if (!response.success && response.status === 401)  navigate("/login");
            else if (!response.success) toastError(response.reason);
            else {
                setAvailableUsers(response.data.members);
            }
        });
    }, []);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        modifyTaskInWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            task.id,
            {"assignee": value === "null"? null : parseInt(value)}
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspaceId + "/tasks/" + task.id;
            }
        });
    };

    return (
        <>
            <a className="link-secondary" onClick={handleShow}><i className="bi bi-pencil-square"></i></a>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Change assignee</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Select onChange={(e) => {
                                         setValue(e.target.value);
                                     }} defaultValue={`${task.assignee?.id}`}>
                            <option value="null">Unassigned</option>
                            <option value={`${profile.id}`}>{profile.username}</option>
                            {
                                availableUsers.map((data, id) => {
                                    return <option value={`${data.id}`}>{data.username}</option>;
                                })
                            }
                        </Form.Select>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit">Apply</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}
