import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {removeWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {toastError} from "../../../ui/toasts.jsx";

export default function DeleteWorkspaceModal(props) {
    const {workspace} = props;
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        removeWorkspace(
            localStorage.getItem("accessToken"),
            workspace.id
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces";
            }
        });
    };

    return (
        <>
            <Button variant="outline-danger" onClick={handleShow}>
                <i className="bi bi-trash"></i> Delete workspace {workspace.name}
            </Button>

            <Modal show={show} onHide={handleClose} className="alert-danger">
                <Modal.Header closeButton>
                    <Modal.Title>Delete workspace {workspace.name}?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete workspace {workspace.name}?<br/>
                    All related tasks, stages, logs and notifications will be lost.<br/>
                    <b>This action is not undoable, proceed with caution</b></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" type="submit" onClick={handleSubmit}>
                        Yes, I really want to delete {workspace.name}</Button>
                    <Button variant="secondary" type="submit" onClick={handleClose}>
                        No, keep {workspace.name}</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
