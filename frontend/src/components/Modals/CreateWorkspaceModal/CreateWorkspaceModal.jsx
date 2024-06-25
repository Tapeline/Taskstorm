import React, {useState} from "react";
import {Button, Form, Modal, Spinner} from "react-bootstrap";
import {newWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {confirmCreation} from "../../../api/common.jsx";

export default function CreateWorkspaceModal(props) {
    const [show, setShow] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const navigate = useNavigate();
    const accessToken = localStorage.getItem("accessToken");
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading(true);
        newWorkspace(accessToken, workspaceName).then((response) => {
            if (!response.success) toastError(response.reason);
            else confirmCreation(accessToken, "workspaces", response.data.id).then(r => {
                if (!r.success) toastError(r.reason)
                else {
                    handleClose();
                    window.location.href = "/workspaces";
                }
            });
        });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>New workspace</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New workspace</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="text" placeholder="Enter workspace title"
                                      onChange={e => setWorkspaceName(e.target.value)}
                                      className="mb-3"/>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" type="submit" disabled={isLoading}>
                            {isLoading
                                ? <Spinner as="span" animation="border"
                                    size="sm" role="status" aria-hidden="true"/>
                                : "Create"
                            }
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}