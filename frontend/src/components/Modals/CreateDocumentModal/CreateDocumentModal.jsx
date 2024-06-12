import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {toastError} from "../../../ui/toasts.jsx";
import {useNavigate} from "react-router-dom";
import {newDocumentInWorkspace} from "../../../api/endpoints-documents.jsx";

export default function CreateDocumentModal(props) {
    const [show, setShow] = useState(false);
    const [documentName, setDocumentName] = useState("");
    const navigate = useNavigate();
    const {workspaceId} = props;

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        newDocumentInWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            documentName
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspaceId + "/documents/" + response.data.id;
            }
        });
    };

    return (
        <>
            <Button variant="primary" onClick={handleShow}>New document</Button>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>New document</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body>
                        <Form.Control type="text" placeholder="Enter title"
                                      onChange={e => setDocumentName(e.target.value)}
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