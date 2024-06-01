import React, {useState} from "react";
import {Button, Form, Modal} from "react-bootstrap";
import {useNavigate} from "react-router-dom";
import {removeWorkspace} from "../../../api/endpoints-workspaces.jsx";
import {toastError} from "../../../ui/toasts.jsx";
import {removeDocumentInWorkspace} from "../../../api/endpoints-documents.jsx";

export default function DeleteDocumentModal(props) {
    const {workspaceId, documentData} = props;
    const [show, setShow] = useState(false);
    const navigate = useNavigate();

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const handleSubmit = (e) => {
        e.preventDefault();
        removeDocumentInWorkspace(
            localStorage.getItem("accessToken"),
            workspaceId,
            documentData.id
        ).then((response) => {
            if (!response.success && response.status === 401) {
                navigate("/login");
            } else if (!response.success) {
                toastError(response.reason);
            } else {
                handleClose();
                window.location.href = "/workspaces/" + workspaceId + "/documents";
            }
        });
    };

    return (
        <>
            <Button variant="outline-danger" onClick={handleShow}>
                <i className="bi bi-trash"></i> Delete document {documentData.title}
            </Button>

            <Modal show={show} onHide={handleClose} className="alert-danger">
                <Modal.Header closeButton>
                    <Modal.Title>Delete document {documentData.title}?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>Are you sure you want to delete workspace {documentData.title}?<br/>
                    <b>This action is not undoable, proceed with caution</b></p>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="outline-danger" type="submit" onClick={handleSubmit}>
                        Yes, I really want to delete {documentData.title}</Button>
                    <Button variant="secondary" type="submit" onClick={handleClose}>
                        No, keep {documentData.title}</Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}
