import React, {useState} from "react";
import {Button, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {toastError} from "../../../ui/toasts.jsx";
import {deleteProfile} from "../../../api/endpoints-profile.jsx";

export default function DeleteAccountModal() {
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        deleteProfile(localStorage.getItem("accessToken")).then((response) => {
            if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/";
            }
        });
    };

    return (
        <>
            <Button variant="outline-danger" onClick={handleShow}>
                <i className="bi bi-trash"></i> Delete profile
            </Button>

            <Modal show={show} onHide={handleClose} className="alert-danger">
                <Modal.Header closeButton>
                    <Modal.Title>Delete profile?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete your profile?<br/>
                    All related workspaces, tasks, stages, logs and notifications will be lost.<br/>
                    Make sure you've transferred the ownership of your workspaces.<br/>
                    <b>This action is not undoable, proceed with caution</b></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" type="submit" onClick={handleSubmit}>
                        Yes, I really want to delete my account</Button>
                    <Button variant="secondary" type="submit" onClick={handleClose}>
                        No, keep my account</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
