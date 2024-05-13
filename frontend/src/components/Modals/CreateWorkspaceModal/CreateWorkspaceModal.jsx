import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {newWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";

export default function CreateWorkspaceModal(props) {
    const [show, setShow] = useState(false);
    const [workspaceName, setWorkspaceName] = useState("");
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        newWorkspace(localStorage.getItem("accessToken"), workspaceName).then((response) => {
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
                        <Button variant="primary" type="submit">Create</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    );
}