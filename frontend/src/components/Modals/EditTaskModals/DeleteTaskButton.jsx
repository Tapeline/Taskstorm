import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {newWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {modifyTaskInWorkspace, newTaskInWorkspace, removeTaskFromWorkspace} from "../../../api/endpoints-tasks.jsx";

export default function DeleteTaskButton(props) {
    const [show, setShow] = useState(false);
    const {workspaceId, task} = props;
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        removeTaskFromWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            task.id
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspaceId + "/tasks";
            }
        });
    };

    return (
        <>
            <Button variant="outline-danger" onClick={handleShow}><i className="bi bi-trash"></i></Button>

            <Modal show={show} onHide={handleClose} className="alert-danger">
                <Modal.Header closeButton>
                    <Modal.Title>Delete task {task.name}?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete this task?<br/>
                    This action cannot be undone.</p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" type="submit" onClick={handleSubmit}>
                        Yes, I want to delete it</Button>
                    <Button variant="secondary" type="submit" onClick={handleClose}>No, keep it</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
